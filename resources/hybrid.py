from flask_restful import Resource
from flask import request
from catarse_recommender.resources.collaborative_filtering import CollaborativeFiltering
from catarse_recommender.resources.content_based import ContentBased
from catarse_recommender.application import get_project_details
import numpy as np
import scipy.io as spi
import scipy.sparse as sps
import scipy.sparse
import pickle
import psycopg2
import pandas

class Hybrid(Resource):
    def __init__(self):
        self.cf = CollaborativeFiltering()
        self.cb = ContentBased()

    def get(self):
        user_id = request.args.get('user_id').split('.')[1]
        projects = self.get_predictions(user_id)
        offset, limit = [0, 10000]
        if request.headers.has_key("Range"):
            offset, limit = np.array(request.headers["Range"].split('-'), dtype=int)
        project_ids = np.array(projects, dtype=np.int)[:, 1].flatten().tolist()
        details = get_project_details(project_ids, offset, limit)
        return details.flatten().tolist()

    def get_predictions(self, user_id):
        cf_predictions = self.cf.get_predictions(user_id)
        cb_predictions = self.cb.get_predictions(user_id)
        cf_predictions.sort(key=lambda x: float(x[1]), reverse=True)
        cb_predictions.sort(key=lambda x: float(x[1]), reverse=True)
        hybrid = []
        for i, project in enumerate(cf_predictions):
            hybrid.append([project[0]*cb_predictions[i][0], project[1]])
        hybrid.sort(key=lambda x: float(x[0]), reverse=True)
        return hybrid
