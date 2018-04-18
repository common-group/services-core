from flask_restful import Resource
from flask import g, current_app, request
import numpy as np
# from IPython.display import display
import scipy.io as spi
import scipy.sparse as sps
import eli5
# import matplotlib.pyplot as plt
import scipy.sparse
import pickle
import psycopg2
import pandas
import xgboost as xgb
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.datasets import dump_svmlight_file
from sklearn.datasets import load_svmlight_file
from xgboost.sklearn import XGBClassifier
from sqlalchemy import create_engine
from json import dumps
from sklearn import metrics   #Additional scklearn functions
from catarse_recommender.application import app, get_db, get_project_details

class ContentBased(Resource):
    def get_rows(self, user_id):
        with app.app_context():
            db, cur = get_db()
        cur.execute("""
                SELECT
        count(c.*) FILTER (where p2.category_id = p.category_id) as category_count,
        count(c.*) FILTER (where p2.mode = p.mode) as mode_count,
            (coalesce(
                        (SELECT state_id
                            FROM cities
                            WHERE cities.id = p.city_id
                            LIMIT 1), 0) = coalesce(
                                                    (SELECT state_id
                                                    FROM addresses a
                                                    WHERE a.id = u.address_id
                                                        AND state_id IS NOT NULL
                                                    LIMIT 1), 0))::integer AS same_state,

            coalesce(p.recommended, FALSE)::integer AS recommended,
            (p.video_url IS NOT NULL)::integer AS has_video,
            coalesce(char_length(p.budget), 0) AS budget_length,
            coalesce(char_length(p.about_html), 0) AS about_length, --tuned for performance, we only need an estimate here
        COALESCE(
                    (SELECT sum(pa.value)
                    FROM contributions c
                    JOIN payments pa ON pa.contribution_id = c.id
                    WHERE pa.state IN ('paid')
                    AND c.project_id = p.id
                    AND pa.created_at <= p.online_at + '3 days'::interval)::float, 0) AS pledged,

        (SELECT count(*)
        FROM contributions c
        WHERE c.project_id = p.id
            AND c.created_at <= p.online_at + '3 days'::interval) AS total_contributions,
        (COALESCE(
                    (SELECT sum(pa.value)
                    FROM contributions c
                    JOIN payments pa ON pa.contribution_id = c.id
                    WHERE pa.state IN ('paid')
                        AND c.project_id = p.id
                        AND pa.created_at <= p.online_at + '3 days'::interval)::float, 0)/ p.goal) * (100)::numeric AS progress,

        (SELECT count(*)
        FROM projects
        WHERE projects.user_id = p.user_id
            AND projects.state != 'draft')::integer AS project_count,
        (SELECT count(*)
        FROM rewards r
        WHERE r.project_id = p.id)::integer AS reward_count,
        p.id
        FROM projects p,
            users u
        join contributions c on c.user_id = u.id
        JOIN projects p2 ON p2.id = c.project_id
        WHERE u.id = """ + str( user_id ) + """
        and p.state = 'online'
        AND NOT EXISTS (select true from contributions c2 where c2.project_id = p.id and c2.user_id = u.id)
        group by p.id, u.id
        """)

        return np.array(cur.fetchall())

    # def explain_prediction(self, bst, row):
    #     display(eli5.format_as_html(eli5.explain_prediction_xgboost(bst, row),  show_feature_values=True))

    def get(self):
        user_id = request.args.get('user_id').split('.')[1]
        offset, limit = [0, 10000]
        if request.headers.has_key("Range"):
            offset, limit = np.array(request.headers["Range"].split('-'), dtype=int)
        projects = self.get_predictions(user_id)
        project_ids = np.array(projects, dtype=np.int)[:, 1].flatten().tolist()
        details = get_project_details(project_ids, offset, limit)
        return details.flatten().tolist()

    def get_predictions(self, user_id):
        rows = self.get_rows(user_id)
        #remove project id
        features = rows[:, :-1]
        # load model and data in
        bst = xgb.Booster(model_file='common/xgb.model')

        dtest = xgb.DMatrix(features)
        preds = bst.predict(dtest)
        projects = []
        for i, pred in enumerate( preds ):
            projects.append([float(pred), int(rows[i][-1])])

        projects.sort(key=lambda x: float(x[0]), reverse=True)
        return projects


class TrainTree():
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
                            LIMIT 1), 0) = coalesce(
                                                        (SELECT state_id
                                                        FROM addresses a
                                                        WHERE a.id = u.address_id
                                                            AND state_id IS NOT NULL
                                                        LIMIT 1), 0))::integer AS same_state,
                coalesce(p.recommended, FALSE)::integer AS recommended,
                (p.video_url IS NOT NULL)::integer AS has_video,
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
        WHERE p.state IN ('successful')
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
                            LIMIT 1), 0) = coalesce(
                                                        (SELECT state_id
                                                        FROM addresses a
                                                        WHERE a.id = u.address_id
                                                            AND state_id IS NOT NULL
                                                        LIMIT 1), 0))::integer AS same_state,
                coalesce(p.recommended, FALSE)::integer AS recommended,
                (p.video_url IS NOT NULL)::integer AS has_video,
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

    def train_model(self, num_round=8000, cache=False):
        if not cache:
            rows = self.get_db_data(250000)
            print('finished getting data')
            features = rows[:, :-1]
            ys = rows[:, -1]
            seed = 1
            test_size = 0.33
            X_train, X_test, y_train, y_test = train_test_split(features, ys, test_size=test_size, random_state=seed)
            try:
                dump_svmlight_file(features , ys, 'common/catarse.txt.all')
                dump_svmlight_file(X_train, y_train, 'common/catarse.txt.train')
                dump_svmlight_file(X_test, y_test, 'common/catarse.txt.test')
            except Exception as inst:
                print(inst)

            dtrain = xgb.DMatrix(features, label = ys, feature_names = self.f_names)
            # dtrain = xgb.DMatrix(X_train, label = y_train, feature_names = self.f_names)
            dtest = xgb.DMatrix(X_test, label = y_test, feature_names = self.f_names)
        else:
            # load file from text file, also binary buffer generated by xgboost
            # dtrain = xgb.DMatrix('common/catarse.txt.all', feature_names = self.f_names)
            dtrain = xgb.DMatrix('common/catarse.txt.train', feature_names = self.f_names)
            dtest = xgb.DMatrix('common/catarse.txt.test', feature_names = self.f_names)

        # specify parameters via map, definition are same as c++ version
        param = {'max_depth':4, 'eta':0.01, 'silent':1, 'booster': 'gbtree', 'min_child_weight': 2, 'objective':'binary:logistic', 'eval_metric': 'logloss'}

        # specify validations set to watch performance
        watchlist = [(dtrain, 'train'), (dtest, 'eval')]
        bst = xgb.train(param, dtrain, num_round, watchlist, early_stopping_rounds=20)
        bst.feature_names = self.f_names
        # dump model
        # bst.dump_model('dump.raw.txt')

        # save dmatrix into binary buffer
        # dtest.save_binary('dtest.buffer')
        # dtrain.save_binary('dtrain.buffer')
        # save model
        bst.save_model('common/xgb.model')

    # def plot_importance(self, bst):
    #     plt.show(xgb.plot_importance(bst))

    def evaluate(self, bst, dtest):
        print(bst.get_fscore())
        print('best ite:', bst.best_iteration)
        print('best score:', bst.best_score)
        print('best ntree:', bst.best_ntree_limit)

        # this is prediction
        preds = bst.predict(dtest, ntree_limit=bst.best_ntree_limit)
        labels = dtest.get_label()
        print('error=%f' % (sum(1 for i in range(len(preds)) if int(preds[i] > 0.5) != labels[i]) / float(len(preds))))
        # with open('pred.txt', 'w') as predictions:
        #     for item in preds:
        #         predictions.write("%s\n" % str( item ))

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
            dtrain = xgb.DMatrix('catarse.txt.all')
            data = load_svmlight_file('catarse.txt.all')
            X = data[0]
            y = data[1]

        predictors = X
        xgb1 = XGBClassifier(
            learning_rate =0.01,
            n_estimators= 600,
            max_depth= 4,
            objective= 'binary:logistic',
            seed=27)

        xgb_param = xgb1.get_xgb_params()
        cvresult = xgb.cv(xgb_param, dtrain, num_boost_round=xgb1.get_params()['n_estimators'], nfold=5,
                            metrics='logloss', early_stopping_rounds=30)
        print(cvresult)
        xgb1.set_params(n_estimators=cvresult.shape[0])
        #Fit the algorithm on the data
        xgb1.fit(X, y, eval_metric='auc')
        #Predict training set:
        dtrain_predictions = xgb1.predict(X)
        # #Print model report:
        print("\nModel Report")
        print("Accuracy : %.4g" % metrics.accuracy_score(y, dtrain_predictions))
        # feat_imp = pandas.Series(xgb1.booster().get_fscore()).sort_values(ascending=False)
        # feat_imp.plot(kind='bar', title='Feature Importances')
        # plt.ylabel('Feature Importance Score')
        # plt.show()
