from flask_restful import Resource
from flask import g, current_app, request
import numpy as np
import scipy.io as spi
import scipy.sparse as sps
import scipy.sparse
import pickle
import psycopg2
import pandas
from lightfm import LightFM
from json import dumps
from catarse_recommender.application import app, get_db, get_project_details

class CollaborativeFiltering(Resource):
    def __init__(self):
        filehandler = open(b"catarse_recommender/common/cf_model.obj","rb")
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

    def get(self):
        user_id = request.args.get('user_id').split('.')[1]
        offset, limit = [0, 10000]
        if request.headers.has_key("Range"):
            offset, limit = np.array(request.headers["Range"].split('-'), dtype=int)
        projects = self.get_predictions(user_id)
        project_ids = np.array(projects, dtype=np.int)[:, 1].flatten().tolist()
        details = get_project_details(project_ids, offset, limit)
        return details.flatten().tolist()
