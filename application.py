#!/usr/bin/python
from flask import Flask, _app_ctx_stack, g
from flask_restful import Api
import psycopg2

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

from app.resources.collaborative_filtering import CollaborativeFiltering, TrainCollaborative
from app.resources.content_based import ContentBased, TrainTree
from app.resources.hybrid import Hybrid
api.add_resource(Hybrid, '/predictions/hybrid/<int:user_id>')
api.add_resource(CollaborativeFiltering, '/predictions/cf/<int:user_id>')
api.add_resource(ContentBased, '/predictions/cb/<int:user_id>')

# c = TrainTree()
# c.train_model(cache=False)
