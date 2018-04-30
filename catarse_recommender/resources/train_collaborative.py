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

class TrainCollaborative(Resource):
    def get_cv_data(self):
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
        )
        """)
        return np.array( cur.fetchall() )

    def predict(self):
        test_file = open(b"catarse_recommender/common/cf_test.obj","rb")
        train_file = open(b"catarse_recommender/common/cf_train.obj","rb")
        model_file = open(b"catarse_recommender/common/cf_model.obj","rb")
        model = None
        test = None
        train = None
        NUM_THREADS=8
        try:
            model = pickle.load(model_file)
            train = pickle.load(train_file)
            test = pickle.load(test_file)
        except Exception as inst:
            print(inst)

        # train_auc = auc_score(model, train, num_threads=NUM_THREADS).mean()
        # # print(test)
        # cx = test
        # contribs = []
        # for user_id,project_id,v in zip(cx.row, cx.col, cx.data):
        #     contribs.append([user_id, project_id])

        # for index, c in enumerate(contribs):
        #     prediction = model.predict(np.array([c[0]]), np.array([c[1]]))
        #     c.append(prediction[0])
        #     contribs[index] = c
        #     if index % 1000 == 0:
        #         print(index)

        # positive = sum(1 for i in contribs if i[2] > 0)
        # print(positive)
        # print(len( positive ))
        # predictions = model.predict(user_id, pids)
        # print('Collaborative filtering train AUC: %s' % train_auc)	
        # test_auc = auc_score(model, test, train_interactions=train, num_threads=NUM_THREADS).mean()	
        # print('Collaborative filtering test AUC: %s' % test_auc)	
        test_precision5 = precision_at_k(model, test, train_interactions=train, num_threads=NUM_THREADS, k=5).mean()	
        print('Collaborative filtering test precision 5: %s' % test_precision5)	
        test_recall5 = recall_at_k(model, test, train_interactions=train, num_threads=NUM_THREADS, k=5).mean()	
        print('Collaborative filtering test recall 5: %s' % test_recall5)

        test_precision = precision_at_k(model, test, train_interactions=train, num_threads=NUM_THREADS, k=10).mean()	
        print('Collaborative filtering test precision: %s' % test_precision)	
        test_recall = recall_at_k(model, test, train_interactions=train, num_threads=NUM_THREADS, k=10).mean()	
        print('Collaborative filtering test recall: %s' % test_recall)

    #train model method
    def get(self):
        print('getting data')
        cv_data = self.get_cv_data()
        print('finished getting data')
        max_user_id = max(cv_data[:, 0])
        max_project_id = max(cv_data[:, 1])
        # LightFM accepts standard scipy sparse matrics as inputs, with user ids as row indices, item ids as columns, and entries being non-zero only if a user interacted with an item.
        rating_matrix = sps.dok_matrix((max_user_id + 1000, max_project_id + 1000), dtype=np.int8)

        for row in cv_data:
            rating_matrix[row[0], row[1]] = row[2]

        train_matrix, test_matrix = random_train_test_split(rating_matrix)
        data = {'train': coo_matrix(train_matrix),
            'test': coo_matrix(test_matrix)
            }
        train = data['train']
        test = data['test']
        # print('The dataset has %s users and %s items, '
        # 'with %s interactions in the test and %s interactions in the training set.'
        # % (train.shape[0], train.shape[1], test.getnnz(), train.getnnz()))
        NUM_THREADS = 4
        NUM_EPOCHS = 20
        ITEM_ALPHA = 1e-6

        # Let's fit a WARP model: these generally have the best performance.

        try:
            model_file = open(b"catarse_recommender/common/cf_model.obj","rb")
            model = pickle.load(model_file)
            model = model.fit_partial(train, epochs=4, num_threads=NUM_THREADS)
        except:
            print('new model')
            model = LightFM(loss='warp',
                        item_alpha=ITEM_ALPHA)
            model = model.fit(train, epochs=NUM_EPOCHS, num_threads=NUM_THREADS)

        filehandler = open(b"catarse_recommender/common/cf_model.obj","wb")
        pickle.dump(model, filehandler)
        # train_file = open(b"common/cf_train.obj","wb")
        # pickle.dump(train, train_file)
        # test_file = open(b"common/cf_test.obj","wb")
        # pickle.dump(test, test_file)
        return '', 200

