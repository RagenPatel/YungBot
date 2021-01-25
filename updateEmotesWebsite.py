import json
import requests
import psycopg2
from dotenv import load_dotenv
import dotenv
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
    data.sort(key=lambda x:x[1])
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
    curr_json_file = open(os.getenv("REACT_DIR"), "r")
    curr_json = json.load(curr_json_file)

    new_json = jsn
    if curr_json == new_json:
        # Set env variable to false
        os.environ["SHOULD_DEPLOY"] = "false"
        dotenv.set_key(env_path, "SHOULD_DEPLOY", os.environ["SHOULD_DEPLOY"])
    else:
        # Set env variable to True and write new file
        os.environ["SHOULD_DEPLOY"] = "true"
        dotenv.set_key(env_path, "SHOULD_DEPLOY", os.environ["SHOULD_DEPLOY"])
        print(path.write_text(json.dumps(jsn, indent=4)))
    
except (Exception, psycopg2.Error) as error :
    print ("Error while connecting to PostgreSQL: ", error)
finally:
    #closing database connection.
        if(connection):
            cursor.close()
            connection.close()
            print("PostgreSQL connection is closed")