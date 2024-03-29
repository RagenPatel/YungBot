import discord
import os
from discord.ext import commands
import requests
import json
from dotenv import load_dotenv
from collections import OrderedDict

import io
import aiohttp

import psycopg2
from requests.api import request
import asyncio

from sgqlc.endpoint.http import HTTPEndpoint

load_dotenv()


class Emotes(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.Cog.listener("on_message")
    async def post_emotes(self, message):
        """Posts emote if found in a message."""
        if message.author == self.bot.user:
            return  # no recursive loop from bot posts

        message_arr = message.content.split(" ")

        for word in message_arr:
            # for each word, check if it has :word: format
            # if it does, look up in frankerFacez
            if len(word) > 2 and word[0] == ':' and word[-1] == ':':
                emote = word[1:len(word)-1]
                if " " not in emote:
                    # check BTTV
                    bttv_url = self.checkBTTV(emote)

                    # if emote exists in BTTV, return it
                    if bttv_url is not None:
                        self.emote_stats_to_postgres(emote)
                        await message.channel.send(bttv_url)
                    else:
                        # check frankerFacez
                        emote_url = self.get_emote_from_frankerfacez(emote)

                        if emote_url != None:
                            formatted_url = "https://" + emote_url[7:]
                            self.emote_stats_to_postgres(emote)
                            await message.channel.send(formatted_url)
            elif len(word) > 2 and word[0] == '#' and word[-1] == '#':
                channel = message.channel
                emote_url, data = self.query_BTTV(word[1:len(word)-1])

                if (emote_url is not None):
                    self.emote_stats_to_postgres(word[1:len(word)-1])
                    msg = await channel.send(emote_url)

            elif len(word) > 2 and word[0] == '@' and word[-1] == '@':
                channel = message.channel
                emote_url = self.query_7tv(word[1:len(word)-1])

                if (emote_url is not None):
                    await channel.send(emote_url)

            elif word == 'D:':
                channel = message.channel
                emote_url = self.query_7tv(word)

                if (emote_url is not None):
                    await channel.send(emote_url)
            else:
                filenames = os.listdir('./emotesImages')
                filenames.remove('D.png')
                filenames_concat = [x[:-4] for x in filenames]

                word = word.lower()

                if word in filenames_concat:
                    channel = message.channel
                    emote_url = self.query_7tv(word)

                    if (emote_url is not None):
                        await channel.send(emote_url)
                else:
                    # call helper method
                    emote_normal = self.check_normal_emote(word)
                    if (emote_normal is None):
                        continue

                    channel = message.channel
                    emote_url = self.query_7tv(word)

                    if (emote_url is not None):
                        await channel.send(emote_url)

    @commands.command()
    async def emoteusage(self, ctx):
        """Shows top 10 most used emotes"""
        # do something here
        conn = psycopg2.connect(user=os.getenv("PGUSER"),
                                password=os.getenv("PGPASSWORD"),
                                host=os.getenv("PGHOST"),
                                port=os.getenv("PGPORT"),
                                database=os.getenv("PGDATABASE"))

        with conn:
            with conn.cursor() as curs:
                # Check if emote exists in DB. If it doesnot, add it otherwise increase count by 1
                query = "SELECT name, usage FROM emotes ORDER BY usage DESC LIMIT 10"

                curs.execute(query)
                dat = curs.fetchall()

                embed = discord.Embed(
                    title="Emote Usage Stats", color=discord.Colour.from_rgb(188, 66, 245))

                for stat in dat:
                    embed.add_field(
                        name=stat[0], value="Used: " + str(stat[1]), inline=False)

                await ctx.send(embed=embed)

        conn.close()

    @commands.command()
    async def removeemote(self, ctx, emote):
        """Remove emote from database. (eg: **!removeemote lul**)"""
        conn = psycopg2.connect(user=os.getenv("PGUSER"),
                                password=os.getenv("PGPASSWORD"),
                                host=os.getenv("PGHOST"),
                                port=os.getenv("PGPORT"),
                                database=os.getenv("PGDATABASE"))

        with conn:
            with conn.cursor() as curs:
                # Check if emote exists in DB. If it doesnot, add it otherwise increase count by 1
                query = 'DELETE FROM emotes WHERE LOWER(name)=LOWER(\'' + \
                    emote + '\')'

                curs.execute(query)

                embed = discord.Embed(
                    color=discord.Colour.from_rgb(155, 245, 66))
                embed.add_field(name="Success!", value="Removed " +
                                str(emote) + " from database.", inline=False)

                await ctx.send(embed=embed)

        conn.close()

    @commands.command()
    async def addemote(self, ctx, emote, url):
        """Add an emote to database. (eg: **!addemote lul https://url.com/lul.png**)"""
        conn = psycopg2.connect(user=os.getenv("PGUSER"),
                                password=os.getenv("PGPASSWORD"),
                                host=os.getenv("PGHOST"),
                                port=os.getenv("PGPORT"),
                                database=os.getenv("PGDATABASE"))

        with conn:
            with conn.cursor() as curs:
                # Check if emote exists in DB. If it doesnot, add it otherwise increase count by 1
                query = 'INSERT into emotes (id, name, url, usage) VALUES (12, \'' + \
                    emote + '\', \'' + url + '\', 0)'

                curs.execute(query)

                embed = discord.Embed(
                    color=discord.Colour.from_rgb(155, 245, 66))
                embed.add_field(name="SUCCESS!", value="Added " +
                                str(emote) + " to database.", inline=False)

                await ctx.send(embed=embed)

        conn.close()

    @commands.command()
    async def emotes(self, ctx):
        """Posts a link to old emotes"""
        embed = discord.Embed(title="Emotes List", url='https://yungbotemotes.github.io/',
                              color=discord.Colour.from_rgb(55, 227, 250))

        await ctx.send(embed=embed)

    # Helpers ------------------------
    async def send_image(self, url):
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as resp:
                if resp.status != 200:
                    return None
                data = io.BytesIO(await resp.read())
                return data

    def check_normal_emote(self, emote):
        conn = psycopg2.connect(user=os.getenv("PGUSER"),
                                password=os.getenv("PGPASSWORD"),
                                host=os.getenv("PGHOST"),
                                port=os.getenv("PGPORT"),
                                database=os.getenv("PGDATABASE"))

        with conn:
            with conn.cursor() as curs:
                # Check if emote exists in DB. If it doesnot, add it otherwise increase count by 1
                query = "SELECT * FROM emotes WHERE LOWER(name)=LOWER(\'" + \
                    emote + "\');"
                curs.execute(query)
                dat = curs.fetchall()
                if len(dat) > 0:
                    return dat[0][2]

                return None
        conn.close()

    def emote_stats_to_postgres(self, emote):
        conn = psycopg2.connect(user=os.getenv("PGUSER"),
                                password=os.getenv("PGPASSWORD"),
                                host=os.getenv("PGHOST"),
                                port=os.getenv("PGPORT"),
                                database=os.getenv("PGDATABASE"))

        emoteExists = False

        with conn:
            with conn.cursor() as curs:
                # Check if emote exists in DB. If it doesnot, add it otherwise increase count by 1
                query = "SELECT * FROM emotes WHERE LOWER(name)=LOWER(\'" + \
                    emote + "\');"
                curs.execute(query)

                dat = curs.fetchall()
                if len(dat) > 0:
                    emoteExists = True

        with conn:
            with conn.cursor() as curs:
                if emoteExists:
                    # Emote already exists, increment by 1
                    update_query = 'Update emotes Set usage = usage + 1 WHERE LOWER(name)=LOWER(\'' + emote.lower(
                    ) + '\');'
                    curs.execute(update_query)
                else:
                    # Emote doesnt exist, insert entry
                    insert_query = 'INSERT into emotes (id, name, url, usage) VALUES (50, \'' + emote.lower(
                    ) + '\', \'nil\', 1)'
                    curs.execute(insert_query)

        conn.close()

    def get_emote_from_frankerfacez(self, emote):
        base_url = "https://api.frankerfacez.com/v1/emotes"

        query = {'q': emote, 'sensitive': "false",
                 'high_dpi': 'off', 'page': 1, 'per_page': 200}
        r = requests.get(base_url, params=query)

        if r.status_code != 200:
            return None

        page = r.json()

        emote_dict = []
        # should return a dict of emote jsons
        emote_dict = self.parse_emote_list(page, emote_dict)

        for i in range(2, page['_pages']):
            query['page'] = i
            r = requests.get(base_url, params=query)

            emote_dict = self.parse_emote_list(r.json(), emote_dict)

        emote_json = {"emotes": emote_dict}
        emote_dict = sorted(
            emote_json['emotes'], key=lambda x: x['usage_count'], reverse=True)

        if len(emote_dict) > 0:
            if '2' in emote_dict[0]['urls']:
                # PSQL stuff here
                self.emote_stats_to_postgres(emote)
                return emote_dict[0]['urls']['2']
            elif '1' in emote_dict[0]['urls']:
                # PSQL stuff here
                self.emote_stats_to_postgres(emote)
                return emote_dict[0]['urls']['1']

        return None

    def checkBTTV(self, emote):
        conn = psycopg2.connect(user=os.getenv("PGUSER"),
                                password=os.getenv("PGPASSWORD"),
                                host=os.getenv("PGHOST"),
                                port=os.getenv("PGPORT"),
                                database=os.getenv("PGDATABASE"))

        with conn:
            with conn.cursor() as curs:
                # Check if emote exists in DB. If it doesnot, add it otherwise increase count by 1
                query = "SELECT * FROM bttvemotes WHERE LOWER(name)=LOWER(\'" + \
                    emote + "\');"
                curs.execute(query)

                dat = curs.fetchall()
                if len(dat) > 0:
                    return dat[0][2]+".gif"

                return None
        conn.close()

    def parse_emote_list(self, emote_json, emote_dict):
        for emote_details in emote_json['emoticons']:
            emote_dict.append(emote_details)

        return emote_dict

    def query_BTTV(self, emote):
        r = requests.get(
            'https://api.betterttv.net/3/emotes/shared/search?query=' + emote + '&offset=0&limit=50')
        data = r.json()

        first_emote_url = None
        if len(data) > 0 and 'message' not in data:
            # Find emote with gif imageType
            for emote in data:
                if (emote['imageType'] == 'gif'):
                    first_emote_url = 'https://cdn.betterttv.net/emote/{}/2x'.format(
                        emote['id']) + '.gif'

        return first_emote_url, data

    def query_7tv(self, emote):
        # Select your transport with a defined url endpoint
        url = "https://7tv.io/v3/gql"
        query_gql = '''
            query SearchEmotes(
                $query: String!
                $page: Int
                $sort: Sort
                $limit: Int
                $filter: EmoteSearchFilter
            ) {
                emotes(
                    query: $query
                    page: $page
                    sort: $sort
                    limit: $limit
                    filter: $filter
                ) {
                    count
                    items {
                        id
                        name
                        state
                        trending
                        owner {
                            id
                            username
                            display_name
                            style {
                                color
                                paint_id
                                __typename
                            }
                            __typename
                        }
                        flags
                        host {
                            url
                            files {
                                name
                                format
                                width
                                height
                                __typename
                            }
                            __typename
                        }
                        __typename
                    }
                    __typename
                }
            }
        '''

        variables = {
            "query": emote,
            "limit": 30,
            "page": 1,
            "sort": {
                "value": "popularity",
                "order": "DESCENDING"
            },
            "filter": {
                "category": "TOP",
                "exact_match": False,
                "case_sensitive": False,
                "ignore_tags": False,
                "zero_width": False,
                "animated": False,
                "aspect_ratio": ""
            }
        }

        endpoint = HTTPEndpoint(url)
        data = endpoint(query_gql, variables)

        if ('errors' in data):
            return None

        data = data['data']['emotes']['items']

        if len(data) > 0:
            emote_url = 'https:' + data[0]['host']['url'] + '/2x'
            check_gif = requests.get(emote_url+'.gif').headers['Content-Type']

            if (check_gif == 'image/gif'):
                return emote_url + '.gif'

            return emote_url + '.webp'


async def setup(bot):
    await bot.add_cog(Emotes(bot))
