try:
    # conn = psycopg2.connect(dbname='catarse_db', user='catarse', host='localhost', password='example', port='5445')
    conn = psycopg2.connect(dbname='catarse_production', user='catarse', host='db.catarse.me')
except:
    print(  "I am unable to connect to the database" )
