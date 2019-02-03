import json
import requests
import psycopg2
from dotenv import load_dotenv
import os
# OR, explicitly providing path to '.env'
from pathlib import Path  # python3 only
env_path = Path('.') / '.env'
load_dotenv(dotenv_path=env_path)

def upload_to_db(cursor, connection):
    url = "https://api.frankerfacez.com/v1/emoticons"
    resp = requests.get(url)
    pages = resp.json()['_pages']
    page = 2661

    while page <= pages:
        while True:
            resp = requests.get(url+"?page=" + str(page))
            print(resp.status_code)
            if resp.status_code == 200:
                break
        print("Page: %d of %d\t:: %d" % (page, pages, resp.status_code))
        page += 1

        data = resp.json()

        for emote in data['emoticons']:
            usage = emote['usage_count']

            if usage > 1000:
                id = emote['id']
                name = emote['name']
                image = "https:" + emote['urls']['1']               
                try:
                    query = 'INSERT INTO emotes (id, name, url, usage) SELECT \'%d\', \'%s\', \'%s\', \'%d\' WHERE NOT EXISTS (SELECT 1 FROM emotes WHERE name=\'%s\');' % (id, name, image, usage, name)
                    print(query)
                    cursor.execute(query)
                    connection.commit()
                except (Exception, psycopg2.DatabaseError) as error :
                    print ("Error while INSERT TO table", error)


def upload_greek_emote(cursor, connection):
    url = "https://api.frankerfacez.com/v1/room/greekgodx"
    resp = requests.get(url)
    print(resp.status_code)
    data = resp.json()

    for emote in data['sets']['185338']['emoticons']:
        print(emote)
        usage = 1000
        id = emote['id']
        name = emote['name']
        image = "https:" + emote['urls']['1']               
        try:
            query = 'INSERT INTO emotes (id, name, url, usage) SELECT \'%d\', \'%s\', \'%s\', \'%d\' WHERE NOT EXISTS (SELECT 1 FROM emotes WHERE name=\'%s\');' % (id, name, image, usage, name)
            print(query)
            cursor.execute(query)
            connection.commit()
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
    
    # upload_to_db(cursor, connection)
    upload_greek_emote(cursor, connection)

    

except (Exception, psycopg2.Error) as error :
    print ("Error while connecting to PostgreSQL: ", error)
finally:
    #closing database connection.
        if(connection):
            cursor.close()
            connection.close()
            print("PostgreSQL connection is closed")