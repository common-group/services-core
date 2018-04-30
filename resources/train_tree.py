import numpy as np
import scipy.io as spi
import scipy.sparse as sps
# import matplotlib.pyplot as plt
# import matplotlib.pylab as pl
import scipy.sparse
import pickle
import psycopg2
import pandas
import xgboost as xgb
# import shap
from flask_restful import Resource
from flask import g, current_app, request
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, recall_score, precision_score
from sklearn.datasets import dump_svmlight_file
from sklearn.datasets import load_svmlight_file
from xgboost.sklearn import XGBClassifier
from json import dumps
from sklearn import metrics   #Additional scklearn functions
from catarse_recommender.application import app, get_db, get_project_details

# Train content-based model using XGboost

class TrainTree(Resource):
    def __init__(self):
        self.f_names = [
                'category_count',
                'mode_count',
                'same_state',
                'recommended',
                'has_video',
                'budget',
                'description',
                'pledged',
                'contributions',
                'progress',
                'owner_projects',
                'reward_count'
            ]

    def get_db_data(self, n_rows):
        with app.app_context():
            db, cur = get_db()
        cur.execute("""
                WITH pt AS
        (SELECT c.project_id,
                sum(p.value) AS pledged,
                ((sum(p.value) / projects.goal) * (100)::numeric) AS progress,
                count(DISTINCT c.id) AS total_contributions
        FROM ((contributions c
                JOIN projects ON ((c.project_id = projects.id)))
                JOIN payments p ON ((p.contribution_id = c.id)))
        WHERE CASE
                    WHEN ((projects.state)::text <> ALL (array['failed'::text,
                                                                'rejected'::text])) THEN (p.state = 'paid'::text)
                    ELSE (p.state = ANY (confirmed_states()))
                END
            AND c.created_at <= projects.online_at + '3 days'::INTERVAL
        GROUP BY c.project_id,
                    projects.id)
        (SELECT
            (SELECT count(*)
            FROM contributions
            JOIN projects ON projects.id = contributions.project_id
            WHERE contributions.user_id = u.id
                AND projects.category_id = p.category_id) AS category_count,
            (SELECT count(*)
            FROM contributions
            JOIN projects ON projects.id = contributions.project_id
            WHERE contributions.user_id = u.id
                AND projects.mode = p.mode) AS mode_count,
                (coalesce(
                            (SELECT state_id
                            FROM cities
                            WHERE cities.id = p.city_id
                            LIMIT 1), 9999999) = coalesce(
                                                        (SELECT state_id
                                                        FROM addresses a
                                                        WHERE a.id = u.address_id
                                                            AND state_id IS NOT NULL
                                                        LIMIT 1), 8888888))::integer AS same_state,
                coalesce(p.recommended, FALSE)::integer AS recommended,
                (p.video_url IS NOT NULL and p.video_url <> '')::integer AS has_video,
                coalesce(char_length(p.budget), 0) AS budget_length,
                coalesce(char_length(p.about_html), 0) AS about_length,
                coalesce(pt.pledged::float, 0) AS pledged,
                coalesce(pt.total_contributions::integer, 0) AS total_contributions,
                coalesce(pt.progress::float, 0) AS progress,
            (SELECT count(*)
            FROM projects
            WHERE projects.user_id = p.user_id
                AND projects.state != 'draft')::integer AS project_count,
            (SELECT count(*)
            FROM rewards r
            WHERE r.project_id = p.id)::integer AS reward_count,
                1 AS y
        FROM contributions c
        JOIN users u ON u.id = c.user_id
        JOIN projects p ON p.id = c.project_id
        LEFT JOIN pt ON pt.project_id = p.id
        WHERE p.state IN ('successful', 'failed')
            AND p.created_at > '01-01-2015'::TIMESTAMP
        LIMIT """ + str( n_rows ) + """)
        UNION ALL
        (SELECT
            (SELECT count(*)
            FROM contributions
            JOIN projects ON projects.id = contributions.project_id
            WHERE contributions.user_id = u.id
                AND projects.category_id = p.category_id) AS category_count,

            (SELECT count(*)
            FROM contributions
            JOIN projects ON projects.id = contributions.project_id
            WHERE contributions.user_id = u.id
                AND projects.mode = p.mode) AS mode_count,
                (coalesce(
                            (SELECT state_id
                            FROM cities
                            WHERE cities.id = p.city_id
                            LIMIT 1), 9999999) = coalesce(
                                                        (SELECT state_id
                                                        FROM addresses a
                                                        WHERE a.id = u.address_id
                                                            AND state_id IS NOT NULL
                                                        LIMIT 1), 8888888))::integer AS same_state,
                coalesce(p.recommended, FALSE)::integer AS recommended,
                (p.video_url IS NOT NULL and p.video_url <> '')::integer AS has_video,
                coalesce(char_length(p.budget), 0) AS budget_length,
                coalesce(char_length(p.about_html), 0) AS about_length,
                coalesce(pt.pledged::float, 0) AS pledged,
                coalesce(pt.total_contributions::integer, 0) AS total_contributions,
                coalesce(pt.progress::float, 0) AS progress,

            (SELECT count(*)
            FROM projects
            WHERE projects.user_id = p.user_id
                AND projects.state != 'draft')::integer AS project_count,
            (SELECT count(*)
            FROM rewards r
            WHERE r.project_id = p.id)::integer AS reward_count,
                0 AS y
        FROM users u
        JOIN contributions c ON c.user_id = u.id
        JOIN projects p ON p.id = (u.id / ((
                                                (SELECT max(id)
                                                FROM users) /
                                                (SELECT max(id)
                                                FROM projects))))
        OR p.id = (u.id / ((
                                (SELECT max(id)
                                FROM users) /
                                (SELECT max(id)
                                FROM projects)))) + 1
        LEFT JOIN pt ON pt.project_id = p.id
        WHERE p.state IN ('failed')
            AND c.project_id != p.id
            AND p.created_at > '01-01-2015'::TIMESTAMP
        LIMIT """ +  str(n_rows) + """)
        """)
        return np.array( cur.fetchall() )

    #train model method
    def get(self, num_round=4000, cache=False):
        if not cache:
            rows = self.get_db_data(250000)
            print('finished getting data')
            features = rows[:, :-1]
            ys = rows[:, -1]
            seed = 1
            test_size = 0.33
            X_train, X_test, y_train, y_test = train_test_split(features, ys, test_size=test_size, random_state=seed)
            X = features
            y = ys
            try:
                dump_svmlight_file(features , ys, 'common/catarse.txt.all')
                dump_svmlight_file(X_train, y_train, 'common/catarse.txt.train')
                dump_svmlight_file(X_test, y_test, 'common/catarse.txt.test')
            except Exception as inst:
                print(inst)

            # dtrain = xgb.DMatrix(features, label = ys, feature_names = self.f_names)
            dtrain = xgb.DMatrix(X_train, label = y_train, feature_names = self.f_names)
            dtest = xgb.DMatrix(X_test, label = y_test, feature_names = self.f_names)
        else:
            # load file from text file, also binary buffer generated by xgboost
            # dtrain = xgb.DMatrix('common/catarse.txt.all', feature_names = self.f_names)
            dtrain = xgb.DMatrix('common/catarse.txt.train', feature_names = self.f_names)
            dtest = xgb.DMatrix('common/catarse.txt.test', feature_names = self.f_names)
            data = load_svmlight_file('common/catarse.txt.all')
            X = data[0]
            y = data[1]

        # specify parameters via map, definition are same as c++ version
        param = {'max_depth':4, 'eta':0.01, 'silent':1, 'booster': 'gbtree', 'min_child_weight': 2, 'objective':'binary:logistic', 'eval_metric': 'logloss'}

        # specify validations set to watch performance
        watchlist = [(dtest, 'eval')]
        bst = xgb.train(param, dtrain, num_round, watchlist, early_stopping_rounds=20)
        bst.feature_names = self.f_names
        # save dmatrix into binary buffer
        # dtest.save_binary('dtest.buffer')
        # dtrain.save_binary('dtrain.buffer')
        # save model
        bst.save_model('common/xgb.model')

    # def plot_importance(self, bst):
    #     plt.show(xgb.plot_importance(bst))

    def ranking_precision_score(self, y_true, y_score, k=10):
        """Precision at rank k
        Parameters
        ----------
        y_true : array-like, shape = [n_samples]
            Ground truth (true relevance labels).
        y_score : array-like, shape = [n_samples]
            Predicted scores.
        k : int
            Rank.
        Returns
        -------
        precision @k : float
        """
        unique_y = np.unique(y_true)

        if len(unique_y) > 2:
            raise ValueError("Only supported for two relevance levels.")

        pos_label = unique_y[1]
        n_pos = np.sum(y_true == pos_label)

        order = np.argsort(y_score)[::-1]
        y_true = np.take(y_true, order[:k])
        n_relevant = np.sum(y_true == pos_label)

        # Divide by min(n_pos, k) such that the best achievable score is always 1.0.
        return float(n_relevant) / min(n_pos, k)

    def evaluate(self):
        bst = xgb.Booster(model_file='common/xgb.model')

        # dtrain = xgb.DMatrix('common/catarse.txt.all', feature_names = self.f_names)
        dtrain = xgb.DMatrix('common/catarse.txt.train', feature_names = self.f_names)
        dtest = xgb.DMatrix('common/catarse.txt.test', feature_names = self.f_names)
        # this is prediction
        labels = dtest.get_label()
        preds = bst.predict(dtest)
        y_pred = [int(i > 0.5) for i in preds]
        print('recall=%f' % recall_score(labels, y_pred))
        print('accuracy=%f' % accuracy_score(labels, y_pred))
        print('precision =%f' % precision_score(labels, y_pred))
        # print('precision at 10=%f' % self.ranking_precision_score(labels, preds))
        print('error=%f' % (sum(1 for i in range(len(preds)) if int(preds[i] > 0.5) != labels[i]) / float(len(preds))))
        # with open('pred.txt', 'w') as predictions:
        #     for item in preds:
        #         predictions.write("%s\n" % str( item ))

    # def graphs(self):
    #     bst = xgb.Booster(model_file='common/xgb.model')
    #     data = load_svmlight_file('common/catarse.txt.all')
    #     X = data[0]
    #     y = data[1]
    #     X = pandas.DataFrame(data= X.toarray(), columns=self.f_names)
    #     shap_values = shap.TreeExplainer(bst).shap_values(X)
    #     # shap.dependence_plot("has_video", shap_values, X)
    #     shap.summary_plot(shap_values, X)

    def cv(self, cache=False):
        if not cache:
            rows = get_db_data(300000)
            features = rows[:, :-1]
            ys = rows[:, -1]
            try:
                dump_svmlight_file(features , ys, 'catarse.txt.all')
            except Exception as inst:
                print(inst)
            dtrain = xgb.DMatrix(features, label = ys)
            X = features
            y = ys
        else:
            # load file from text file, also binary buffer generated by xgboost
            dtrain = xgb.DMatrix('common/catarse.txt.all')
            data = load_svmlight_file('common/catarse.txt.all')
            X = data[0]
            y = data[1]

        xgb1 = XGBClassifier(
            learning_rate =0.01,
            n_estimators= 800,
            max_depth= 4,
            nthread=8,
            objective= 'binary:logistic',
            seed=27)

        xgb_param = xgb1.get_xgb_params()
        cvresult = xgb.cv(xgb_param, dtrain, num_boost_round=xgb1.get_params()['n_estimators'], nfold=5,
                            metrics=['logloss', 'error'], early_stopping_rounds=20, stratified=True, shuffle=True)
        print(cvresult)
        filehandler = open(b"common/cv_result.obj","wb")
        pickle.dump(cvresult, filehandler)
        # watchlist = [(dtrain, 'eval')]
        # bst = xgb.train(xgb_param, dtrain, 40, watchlist, early_stopping_rounds=20)
        # xgb1.set_params(n_estimators=cvresult.shape[0])
        #Fit the algorithm on the data
        # xgb1.fit(X, y, eval_metric='auc')
        #Predict training set:

        # preds = bst.predict(dtest)
        # labels = dtest.get_label()
        # y_pred = [int(i > 0.5) for i in preds]
        # print('recall=%f' % recall_score(labels, y_pred))
        # print('accuracy=%f' % accuracy_score(labels, y_pred))
        # print('precision at 10=%f' % self.ranking_precision_score(labels, preds))
        # print('error=%f' % (sum(1 for i in range(len(preds)) if int(preds[i] > 0.5) != labels[i]) / float(len(preds))))

        # dtrain_predictions = xgb1.predict(X)
        # #Print model report:
        # print("\nModel Report")
        # print("Accuracy : %.4g" % metrics.accuracy_score(y, dtrain_predictions))
        # feat_imp = pandas.Series(xgb1.booster().get_fscore()).sort_values(ascending=False)
        # feat_imp.plot(kind='bar', title='Feature Importances')
        # plt.ylabel('Feature Importance Score')
        # plt.show()



