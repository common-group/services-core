from flask_restful import Resource
from flask import g, current_app, request
import numpy as np
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
from catarse_recommender.application import app, get_db, get_project_details

class TrainCollaborative():
    def get_cv_data(self, n_rows):
        with app.app_context():
            db, cur = get_db()
        cur.execute("""
        (SELECT
        c.user_id as user_id,
        c.project_id as project_id,
        1 AS y
        FROM contributions c
        join projects p on p.id = c.project_id
        WHERE p.state not in ('draft', 'deleted')
        AND p.created_at > '01-01-2015'::TIMESTAMP
        LIMIT """ + n_rows + """)
        """)
        return np.array( cur.fetchall() )

    def train_model(self):
        cv_data = self.get_cv_data(str(5000000))
        max_user_id = max(cv_data[:, 0])
        max_project_id = max(cv_data[:, 1])
        # LightFM accepts standard scipy sparse matrics as inputs, with user ids as row indices, item ids as columns, and entries being non-zero only if a user interacted with an item.
        rating_matrix = sps.dok_matrix((max_user_id + 100, max_project_id + 200), dtype=np.int8)

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
        NUM_THREADS = 4
        NUM_EPOCHS = 30
        ITEM_ALPHA = 1e-6

        # Let's fit a WARP model: these generally have the best performance.
        model = LightFM(loss='warp',
                    item_alpha=ITEM_ALPHA)

        print('training start')
        model = model.fit(train, epochs=NUM_EPOCHS, num_threads=NUM_THREADS)
        print('training done')
        filehandler = open(b"common/cf_model.obj","wb")
        pickle.dump(model, filehandler)

        train_auc = auc_score(model, train, num_threads=NUM_THREADS).mean()
        print('Collaborative filtering train AUC: %s' % train_auc)	
        test_auc = auc_score(model, test, train_interactions=train, num_threads=NUM_THREADS).mean()	
        test_precision = precision_at_k(model, test, train_interactions=train, num_threads=NUM_THREADS).mean()	
        test_recall = recall_at_k(model, test, train_interactions=train, num_threads=NUM_THREADS).mean()	
        print('Collaborative filtering test AUC: %s' % test_auc)	
        print('Collaborative filtering test precision: %s' % test_precision)	
        print('Collaborative filtering test recall: %s' % test_recall)
