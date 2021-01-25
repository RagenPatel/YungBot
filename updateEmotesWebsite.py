import json
import requests
import psycopg2
from dotenv import load_dotenv
import os
# OR, explicitly providing path to '.env'
from pathlib import Path  # python3 only
env_path = '.env'
load_dotenv(dotenv_path=env_path)

path = Path(os.getenv("REACT_DIR"))


def updateJSONForWebsite(cursor, connection):

    try:
        query = 'SELECT * FROM emotes'
        cursor.execute(query)
        data = cursor.fetchall()

        connection.commit()

        return data
    except (Exception, psycopg2.DatabaseError) as error :
        print ("Error while INSERT TO table", error)


try:
    connection = psycopg2.connect(user = os.getenv("PGUSER"),
                                  password = os.getenv("PGPASSWORD"),
                                  host = os.getenv("PGHOST"),
                                  port = os.getenv("PGPORT"),
                                  database = os.getenv("PGDATABASE"))
    cursor = connection.cursor()
    # Print PostgreSQL Connection properties
    print ( connection.get_dsn_parameters(),"\n")
    # Print PostgreSQL version
    cursor.execute("SELECT version();")
    record = cursor.fetchone()
    print("You are connected to - ", record,"\n")
    
    data = updateJSONForWebsite(cursor, connection)
    arr = []
    for tupl in data:
        tmp = []
        tmp.append(tupl[0])
        tmp.append(tupl[1])
        tmp.append(tupl[2])
        tmp.append(tupl[3])

        arr.append(tmp)
    
    jsn = { "emotes": arr }
    # print(jsn)
    print(os.getenv("REACT_DIR"))
    print(path.write_text(json.dumps(jsn, indent=4)))
    
except (Exception, psycopg2.Error) as error :
    print ("Error while connecting to PostgreSQL: ", error)
finally:
    #closing database connection.
        if(connection):
            cursor.close()
            connection.close()
            print("PostgreSQL connection is closed")