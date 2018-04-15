from flask_restful import Resource
from flask import g, current_app, request
import numpy as np
from lightfm.datasets import fetch_stackexchange
from lightfm.cross_validation import random_train_test_split
import scipy.io as spi
import scipy.sparse as sps
from lightfm.evaluation import auc_score, precision_at_k, recall_at_k
import scipy.sparse
import pickle
import psycopg2
import pandas
from lightfm import LightFM
from json import dumps
from scipy.sparse import coo_matrix
from app.application import app, get_db, get_project_details

class CollaborativeFiltering(Resource):
    def __init__(self):
        filehandler = open(b"common/cf_model.obj","rb")
        try:
            self.model = pickle.load(filehandler)
        except Exception as inst:
            print(inst)

    def get_online_projects(self, user_id):
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
        offset, limit = [0, 10000]
        if request.headers.has_key("Range"):
            offset, limit = np.array(request.headers["Range"].split('-'), dtype=int)
        projects = self.get_predictions(user_id)
        project_ids = np.array(projects, dtype=np.int)[:, 1].flatten().tolist()
        details = get_project_details(project_ids, offset, limit)
        return details.flatten().tolist()


class TrainCollaborative():
    def get_cv_data(self, n_rows):
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
