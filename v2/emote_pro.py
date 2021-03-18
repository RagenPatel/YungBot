import discord
import os
from discord.ext import commands
import requests
import json
from dotenv import load_dotenv
from collections import OrderedDict

load_dotenv()

client = discord.Client()

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
            return emote_dict[0]['urls']['2']
        elif '1' in emote_dict[0]['urls']:
            return emote_dict[0]['urls']['1']
    
    return None


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
                # check frankerFacez
                emote_url = get_emote_from_frankerfacez(emote)

                if emote_url != None:
                    formatted_url = "https://" + emote_url[2:]
                    await message.channel.send(formatted_url)

    print(message_arr)

    
token = os.getenv("DISCORD_API_TOKEN")
client.run(token)