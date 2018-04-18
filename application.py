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
    cur.execute("""
    SELECT array_to_json(array_agg(s)) FROM
    (
        SELECT p.*
        FROM "1".projects p
        JOIN unnest('{""" + ','.join(str(e) for e in ids) + """}'::int[]) WITH ORDINALITY t(project_id, ord) USING (project_id)
        where project_id IN (""" + ','.join(str(e) for e in ids) + """)
        ORDER  BY t.ord
        offset """ + str( offset ) + """
        limit """ + str( limit - offset ) + """
    ) s
    """)
    return np.array( cur.fetchall() )

@app.teardown_request
def teardown_request(exception):
    if hasattr(g, 'psql_db'):
        g.psql_db.close()
    if hasattr(g, 'cur'):
        g.cur.close()

from catarse_recommender.resources.collaborative_filtering import CollaborativeFiltering, TrainCollaborative
from catarse_recommender.resources.content_based import ContentBased, TrainTree
from catarse_recommender.resources.hybrid import Hybrid
api.add_resource(Hybrid, '/predictions/hybrid')
api.add_resource(CollaborativeFiltering, '/predictions/cf')
api.add_resource(ContentBased, '/predictions/cb')
