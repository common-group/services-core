from flask_restful import Resource
from catarse_recommender.resources.collaborative_filtering import CollaborativeFiltering
from catarse_recommender.resources.content_based import ContentBased
import numpy as np
from IPython.display import display
from lightfm.datasets import fetch_stackexchange
from lightfm.cross_validation import random_train_test_split
import scipy.io as spi
import scipy.sparse as sps
from lightfm.evaluation import auc_score, precision_at_k, recall_at_k
import eli5
import matplotlib.pyplot as plt
import scipy.sparse
import pickle
import psycopg2
import pandas
import xgboost as xgb
from lightfm import LightFM
from sklearn import model_selection
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
from sklearn.datasets import dump_svmlight_file
from sklearn.datasets import load_svmlight_file
from xgboost.sklearn import XGBClassifier
from sqlalchemy import create_engine
from json import dumps
from sklearn import metrics   #Additional scklearn functions
import matplotlib.pyplot as plt
from scipy.sparse import coo_matrix


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
