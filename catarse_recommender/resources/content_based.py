from flask_restful import Resource
from flask import g, current_app, request
import numpy as np
import scipy.sparse as sps
# import eli5
# import matplotlib.pyplot as plt
import scipy.sparse
import pickle
import psycopg2
import pandas
import xgboost as xgb
from xgboost.sklearn import XGBClassifier
from json import dumps
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
                            LIMIT 1), 99999) = coalesce(
                                                    (SELECT state_id
                                                    FROM addresses a
                                                    WHERE a.id = u.address_id
                                                        AND state_id IS NOT NULL
                                                    LIMIT 1), 888888))::integer AS same_state,

            coalesce(p.recommended, FALSE)::integer AS recommended,
            (p.video_url IS NOT NULL and p.video_url <> '')::integer AS has_video,
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
        LEFT join contributions c on c.user_id = u.id
        LEFT JOIN projects p2 ON p2.id = c.project_id
        WHERE u.id = %s
        and p.state = 'online'
        AND NOT EXISTS (select true from contributions c2 where c2.project_id = p.id and c2.user_id = u.id)
        group by p.id, u.id
        """, (user_id,))

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
        headers = {'Content-Range': '{0}-{1}/{2}'.format(offset, limit, len(project_ids)), 'Access-Control-Expose-Headers': 'Content-Encoding, Content-Location, Content-Range, Content-Type, Date, Location, Server, Transfer-Encoding, Range-Unit'}
        return details.flatten().tolist(), 206, headers

    def get_predictions(self, user_id):
        rows = self.get_rows(user_id)
        #remove project id
        features = rows[:, :-1]
        # load model and data in
        bst = xgb.Booster(model_file='catarse_recommender/common/xgb.model')

        dtest = xgb.DMatrix(features)
        preds = bst.predict(dtest)
        projects = []
        for i, pred in enumerate( preds ):
            projects.append([float(pred), int(rows[i][-1])])

        projects.sort(key=lambda x: float(x[0]), reverse=True)
        return projects
