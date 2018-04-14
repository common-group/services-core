from flask_restful import Resource
from app.resources.collaborative_filtering import CollaborativeFiltering
from app.resources.content_based import ContentBased
import numpy as np
from lightfm.datasets import fetch_stackexchange
from lightfm.cross_validation import random_train_test_split
import scipy.io as spi
import scipy.sparse as sps
from lightfm.evaluation import auc_score, precision_at_k, recall_at_k
import eli5
import scipy.sparse
import pickle
import psycopg2
import pandas
import xgboost as xgb
from lightfm import LightFM

class Hybrid(Resource):
    def __init__(self):
        self.cf = CollaborativeFiltering()
        self.cb = ContentBased()

    def get(self, user_id):
        projects = self.get_predictions(user_id)
        return {'projects': np.array(projects, dtype=np.int)[:, 1].flatten().tolist()}

    def get_predictions(self, user_id):
        cf_predictions = self.cf.get_predictions(user_id)
        cb_predictions = self.cb.get_predictions(user_id)
        # print(cf_predictions[:10])
        # print(cb_predictions[:10])
        cf_predictions.sort(key=lambda x: float(x[1]), reverse=True)
        cb_predictions.sort(key=lambda x: float(x[1]), reverse=True)
        hybrid = []
        for i, project in enumerate(cf_predictions):
            hybrid.append([project[0]*cb_predictions[i][0], project[1]])
        hybrid.sort(key=lambda x: float(x[0]), reverse=True)
        return hybrid
