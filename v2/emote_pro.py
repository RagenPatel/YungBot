import discord
import os
from discord.ext import commands
import requests
import json
from dotenv import load_dotenv
from collections import OrderedDict

import psycopg2

load_dotenv()

client = discord.Client()


def emote_stats_to_postgres(emote):
    conn = psycopg2.connect(user = os.getenv("PGUSER"),
                                password = os.getenv("PGPASSWORD"),
                                host = os.getenv("PGHOST"),
                                port = os.getenv("PGPORT"),
                                database = os.getenv("PGDATABASE"))

    emoteExists = False

    with conn:
        with conn.cursor() as curs:
            # Check if emote exists in DB. If it doesnot, add it otherwise increase count by 1
            query = "SELECT * FROM emotes WHERE LOWER(name)=LOWER(\'"+ emote +"\');"
            curs.execute(query)

            dat = curs.fetchall()
            if len(dat) > 0:
                emoteExists = True

    with conn:
        with conn.cursor() as curs:
            if emoteExists:
                # Emote already exists, increment by 1
                update_query = 'Update emotes Set usage = usage + 1 WHERE LOWER(name)=LOWER(\'' + emote.lower() + '\');'
                curs.execute(update_query)
            else:
                # Emote doesnt exist, insert entry
                insert_query = 'INSERT into emotes (id, name, url, usage) VALUES (50, \'' + emote.lower() + '\', \'nil\', 1)'
                curs.execute(insert_query)

    conn.close()

def get_emote_from_frankerfacez(emote):
    base_url = "https://api.frankerfacez.com/v1/emotes"

    query = { 'q': emote, 'sensitive': "false", 'high_dpi': 'off', 'page': 1, 'per_page': 200 }
    r = requests.get(base_url, params=query)

    if r.status_code != 200:
        return None

    page = r.json()

    emote_dict = []
    emote_dict = parse_emote_list(page, emote_dict) # should return a dict of emote jsons

    for i in range(2, page['_pages']):
        query['page'] = i
        r = requests.get(base_url, params=query)

        emote_dict = parse_emote_list(r.json(), emote_dict)

    emote_json = { "emotes": emote_dict }
    emote_dict = sorted(emote_json['emotes'], key=lambda x : x['usage_count'], reverse=True)

    if len(emote_dict) > 0:
        if '2' in emote_dict[0]['urls']:
            # PSQL stuff here
            emote_stats_to_postgres(emote)
            return emote_dict[0]['urls']['2']
        elif '1' in emote_dict[0]['urls']:
            # PSQL stuff here
            emote_stats_to_postgres(emote)
            return emote_dict[0]['urls']['1']
    
    return None

def checkBTTV(emote):
    conn = psycopg2.connect(user = os.getenv("PGUSER"),
                                password = os.getenv("PGPASSWORD"),
                                host = os.getenv("PGHOST"),
                                port = os.getenv("PGPORT"),
                                database = os.getenv("PGDATABASE"))
    
    with conn:
        with conn.cursor() as curs:
            # Check if emote exists in DB. If it doesnot, add it otherwise increase count by 1
            query = "SELECT * FROM bttvemotes WHERE LOWER(name)=LOWER(\'"+ emote +"\');"
            curs.execute(query)

            dat = curs.fetchall()
            print(dat)
            if len(dat) > 0:
                return dat[0]['url']
            
            return None
    conn.close()


def parse_emote_list(emote_json, emote_dict):
    for emote_details in emote_json['emoticons']:
        emote_dict.append(emote_details)

    return emote_dict

@client.event
async def on_ready():
    print('We have logged in as {0.user}'.format(client))

@client.event
async def on_message(message):
    if message.author == client.user:
        return  # no recursive loop from bot posts

    message_arr = message.content.split(" ")

    for word in message_arr:
        # for each word, check if it has :word: format
        # if it does, look up in frankerFacez
        if word[0] == ':' and word[-1] == ':' and len(word) > 2:
            emote = word[1:len(word)-1]
            if " " not in emote:
                #check BTTV
                bttv_url = checkBTTV(emote)

                # if emote exists in BTTV, return it
                if bttv_url not None:
                    return bttv_url
                    
                # check frankerFacez
                emote_url = get_emote_from_frankerfacez(emote)

                if emote_url != None:
                    formatted_url = "https://" + emote_url[2:]
                    await message.channel.send(formatted_url)

    print(message_arr)

    
token = os.getenv("DISCORD_API_TOKEN")
client.run(token)