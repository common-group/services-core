from flask_restful import Resource
from flask import g, current_app
import numpy as np
from IPython.display import display
from lightfm.datasets import fetch_stackexchange
from lightfm.cross_validation import random_train_test_split
import scipy.io as spi
import scipy.sparse as sps
from lightfm.evaluation import auc_score, precision_at_k, recall_at_k
import eli5
import matplotlib.pyplot as plt
import scipy.sparse
import pickle
import psycopg2
import pandas
import xgboost as xgb
from lightfm import LightFM
from sklearn import model_selection
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
from sklearn.datasets import dump_svmlight_file
from sklearn.datasets import load_svmlight_file
from xgboost.sklearn import XGBClassifier
from sqlalchemy import create_engine
from json import dumps
from sklearn import metrics   #Additional scklearn functions
import matplotlib.pyplot as plt
from scipy.sparse import coo_matrix

class CollaborativeFiltering(Resource):
    def __init__(self):
        filehandler = open(b"common/cf_model.obj","rb")
        self.model = pickle.load(filehandler)

    def get_online_projects(self, user_id):
        from ..application import get_db, app
        with app.app_context():
            db, cur = get_db()
        cur.execute("""
        (SELECT
        p.id
        FROM projects p
        WHERE p.state = 'online'
        AND NOT EXISTS(select true from contributions where user_id = """ + str( user_id ) + """ and project_id =  p.id)
        )
        """)
        return np.array( cur.fetchall() ).flatten()

    def get_predictions(self, user_id):
        pids = self.get_online_projects(user_id)
        predictions = self.model.predict(user_id, pids)
        predictions = (predictions - np.min(predictions))/np.ptp(predictions)
        projects = []
        for i, pred in enumerate( predictions ):
            projects.append([float(pred), int(pids[i])])

        projects.sort(key=lambda x: float(x[0]), reverse=True)
        return projects

    def get(self, user_id):
        projects = self.get_predictions(user_id)
        return {'projects': np.array(projects, dtype=np.int)[:, 1].flatten().tolist()}


class TrainCollaborative():
    def get_cv_data(self, n_rows):
        from ..application import get_db, app
        with app.app_context():
            db, cur = get_db()
        cur.execute("""
        (SELECT
        u.id,
        p.id,
        1 AS y
        FROM contributions c
        JOIN users u ON u.id = c.user_id
        JOIN projects p ON p.id = c.project_id
        WHERE p.created_at > '01-01-2015'::TIMESTAMP
        AND p.state not in ('draft', 'failed')
        LIMIT """ + n_rows + """)
        """)
        return np.array( cur.fetchall() )

    def train_model(self):
        cv_data = self.get_cv_data(str(5000000))
        max_user_id = max(cv_data[:, 0])
        max_project_id = max(cv_data[:, 1])
        # LightFM accepts standard scipy sparse matrics as inputs, with user ids as row indices, item ids as columns, and entries being non-zero only if a user interacted with an item.
        rating_matrix = sps.dok_matrix((max_user_id + 1, max_project_id + 200), dtype=np.int8)

        for row in cv_data:
            rating_matrix[row[0], row[1]] = row[2]

        train_matrix, test_matrix = random_train_test_split(rating_matrix)
        data = {'train': coo_matrix(train_matrix),
            'test': coo_matrix(test_matrix)
            }
        train = data['train']
        test = data['test']
        print('The dataset has %s users and %s items, '
        'with %s interactions in the test and %s interactions in the training set.'
        % (train.shape[0], train.shape[1], test.getnnz(), train.getnnz()))
        NUM_THREADS = 2
        NUM_EPOCHS = 3
        ITEM_ALPHA = 1e-6

        # Let's fit a WARP model: these generally have the best performance.
        model = LightFM(loss='warp',
                    item_alpha=ITEM_ALPHA)

        print('training start')
        model = model.fit(train, epochs=NUM_EPOCHS, num_threads=NUM_THREADS)
        print('training done')
        filehandler = open(b"common/cf_model.obj","wb")
        pickle.dump(model, filehandler)
