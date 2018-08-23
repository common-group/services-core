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
    def __init__(self, cb_weight = 0.5, cf_weight = 0.5):
        self.cf = CollaborativeFiltering()
        self.cb = ContentBased()
        self.cb_weight = cb_weight
        self.cf_weight = cf_weight

    def get(self):
        user_id = request.args.get('user_id').split('.')[1]
        projects = self.get_predictions(user_id)
        offset, limit = [0, 10000]
        if request.headers.has_key("Range"):
            offset, limit = np.array(request.headers["Range"].split('-'), dtype=int)
        project_ids = np.array(projects, dtype=np.int)[:, 1].flatten().tolist()
        details = get_project_details(project_ids, offset, limit)
        headers = {'Content-Range': '{0}-{1}/{2}'.format(offset, limit, len(project_ids)), 'Access-Control-Expose-Headers': 'Content-Encoding, Content-Location, Content-Range, Content-Type, Date, Location, Server, Transfer-Encoding, Range-Unit'}
        return details.flatten().tolist(), 206, headers

    def get_predictions(self, user_id):
        cf_predictions = self.cf.get_predictions(user_id)
        cb_predictions = self.cb.get_predictions(user_id)
        # sort predictions by project_id
        cf_predictions.sort(key=lambda x: float(x[1]), reverse=True)
        cb_predictions.sort(key=lambda x: float(x[1]), reverse=True)
        hybrid = []
        for i, cf_prediction in enumerate(cf_predictions):
            weighted_average = (self.cf_weight * cf_prediction[0]) + (self.cb_weight * cb_predictions[i][0])
            hybrid.append([weighted_average, cf_prediction[1]])
        hybrid.sort(key=lambda x: float(x[0]), reverse=True)
        return hybrid
