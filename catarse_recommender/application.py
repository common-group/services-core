#!/usr/bin/env python3
from flask import Flask, _app_ctx_stack, g
from flask_restful import Api
from flask_cors import CORS
import psycopg2
import numpy as np
import os

app = Flask(__name__)
api = Api(app)
CORS(app)

def connect_db():
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
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

# get project details in the same order as ids array
def get_project_details(ids, offset, limit):
    db, cur = get_db()
    query = """
    SELECT array_to_json(array_agg(s)) FROM
    (
        SELECT p.*
        FROM "1".projects p
        JOIN unnest(%s::int[]) WITH ORDINALITY t(project_id, ord) USING (project_id)
        where project_id IN %s
        ORDER  BY t.ord
        offset %s
        limit %s
    ) s
        """
    cur.execute(query, (ids, tuple(ids), str( offset ), str( limit - offset )))
    return np.array( cur.fetchall() )

@app.teardown_request
def teardown_request(exception):
    if hasattr(g, 'psql_db'):
        g.psql_db.close()
    if hasattr(g, 'cur'):
        g.cur.close()

from catarse_recommender.resources.collaborative_filtering import CollaborativeFiltering
from catarse_recommender.resources.content_based import ContentBased
from catarse_recommender.resources.train_tree import TrainTree
from catarse_recommender.resources.train_collaborative import TrainCollaborative
from catarse_recommender.resources.hybrid import Hybrid
api.add_resource(ContentBased, '/predictions/cb')
api.add_resource(TrainCollaborative, '/traincf')

# routes for a/b testing
api.add_resource(Hybrid, '/predictions/1')
api.add_resource(CollaborativeFiltering, '/predictions/2')
