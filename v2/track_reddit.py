from dotenv import load_dotenv
import requests
import time
import os
import json
import discord
import psycopg2
import re

from discord import SyncWebhook

load_dotenv()

webhookid = os.getenv('DISCORD_WEBHOOK_ID')
webhooktoken = os.getenv('DISCORD_WEBHOOK_TOKEN')
url = os.getenv('TRACKED_URL')

def fetch_visited():
    conn = psycopg2.connect(user=os.getenv("PGUSER"),
                                password=os.getenv("PGPASSWORD"),
                                host=os.getenv("PGHOST"),
                                port=os.getenv("PGPORT"),
                                database=os.getenv("PGDATABASE"))
    
    
    with conn:
        with conn.cursor() as curs:
            # Check if emote exists in DB. If it doesnot, add it otherwise increase count by 1
            query = 'SELECT * FROM reddit'
            curs.execute(query)
            dat = curs.fetchall()

    conn.close()
    return dat

def add_visited(visited):
    conn = psycopg2.connect(user=os.getenv("PGUSER"),
                                password=os.getenv("PGPASSWORD"),
                                host=os.getenv("PGHOST"),
                                port=os.getenv("PGPORT"),
                                database=os.getenv("PGDATABASE"))
    cur = conn.cursor()
    
    sql = "INSERT INTO reddit (post_id) VALUES (%s)"

    data = [(s, ) for s in visited]
    
    cur.executemany(sql, data)

    conn.commit()
    cur.close()
    conn.close()


def fetch_info():
    data = requests.get(url)

    if (data.status_code != 200):
        return
    data = data.json()

    posts = data['data']['children']

    visited_tuples = fetch_visited()
    visited = []
    for t in visited_tuples:
        visited.append(t[1])
 
    links = []
    
    add_to_visited = []

    for post in posts:
        post = post['data']
        if ('[H]' not in post['title']):
            continue
        match_regex = re.match(os.getenv('TRACKED_PATTERN'), post['title']).group(2)

        if ('paypal' in match_regex.lower()):
            continue

        if (post['id'] not in visited and ("kaiju" in match_regex.lower() or "kaiju" in post['selftext'].lower())):
            links.append((post['title'], post['url'], post['selftext'][:999], "Found Kaiju"))
            add_to_visited.append(post['id'])
        elif (post['id'] not in visited and ("gmk" in match_regex.lower() or "gmk" in post['selftext'].lower())):
            links.append((post['title'], post['url'], post['selftext'][:999], "Found GMK"))
            add_to_visited.append(post['id'])
        elif (post['id'] not in visited and ("dots" in match_regex.lower() or "dots" in post['selftext'].lower())):
            links.append((post['title'], post['url'], post['selftext'][:999], "Found Dots"))
            add_to_visited.append(post['id'])

    hook = SyncWebhook.partial(webhookid, webhooktoken)

    add_visited(add_to_visited)

    for link in links:
        # Post links to discord
        embed = discord.Embed(title=link[3], url=link[1], color=discord.Colour.from_rgb(188, 66, 245))
        embed.add_field(name=link[0], value=link[2])
        hook.send(embed=embed)
        time.sleep(1)


while True:
    fetch_info()
    time.sleep(300)
