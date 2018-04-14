#!/usr/bin/python
from flask import Flask, _app_ctx_stack, g
from flask_restful import Api
from catarse_recommender.resources.collaborative_filtering import CollaborativeFiltering, TrainCollaborative
from catarse_recommender.resources.content_based import ContentBased, TrainTree
from catarse_recommender.resources.hybrid import Hybrid
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

app = Flask(__name__)
api = Api(app)

def connect_db():
    try:
        conn = psycopg2.connect(dbname='catarse_production', user='catarse', host='db.catarse.me')
        # conn = psycopg2.connect(dbname='catarse_db', user='catarse', host='localhost', password='example', port='5445')
        return conn
    except:
        print("Error connecting to the database")

def get_db():
    """Opens a new database connection if there is none yet for the
    current application context.
    """
    if not hasattr(g, 'psql_db'):
        g.psql_db = connect_db()
    if not hasattr(g, 'cur'):
        g.cur = g.psql_db.cursor()
    return g.psql_db, g.cur

@app.teardown_request
def teardown_request(exception):
    if hasattr(g, 'psql_db'):
        g.psql_db.close()
    if hasattr(g, 'cur'):
        g.cur.close()

api.add_resource(Hybrid, '/predictions/hybrid/<int:user_id>')
api.add_resource(CollaborativeFiltering, '/predictions/cf/<int:user_id>')
api.add_resource(ContentBased, '/predictions/cb/<int:user_id>')

# c = TrainCollaborative()
# c.train_model()
