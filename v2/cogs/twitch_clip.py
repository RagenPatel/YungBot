import discord
from discord.ext import commands

import os
from dotenv import load_dotenv

from twitchAPI.twitch import Twitch
from twitchAPI.types import AuthScope
from twitchAPI.oauth import UserAuthenticator, refresh_access_token

import psycopg2

load_dotenv()


class TwitchClip(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.client_id = os.getenv('TWITCH_CLIENT_ID')
        self.client_secret = os.getenv('TWITCH_SECRET')
        self.twitch = Twitch(self.client_id, self.client_secret)

        self.conn = psycopg2.connect(user=os.getenv("PGUSER"),
                                password=os.getenv("PGPASSWORD"),
                                host=os.getenv("PGHOST"),
                                port=os.getenv("PGPORT"),
                                database=os.getenv("PGDATABASE"))

        self.curs = self.conn.cursor()
        self.curs.execute("SELECT * FROM twitchclips")
        rows = self.curs.fetchall()

        for row in rows:
            if row[0] == 2:
                self.access_token = row[2]
            
            if row[0] == 3:
                self.refresh_token = row[2]
        
        self.scope = [AuthScope.CLIPS_EDIT]

        self.twitch.set_user_authentication(self.access_token, self.scope, self.refresh_token)


    @commands.command()
    async def clip(self, ctx, streamer):
        """Get a Twitch Clip"""

        self.update_twitch_tokens()

        # Get the streamer's ID
        streamer_info = self.twitch.get_users(logins=[streamer])['data']

        if len(streamer_info) == 0:
            embed = discord.Embed(title="Streamer not found", color=discord.Colour.from_rgb(255, 0, 0))
            await ctx.send(embed=embed)
            return

        streamer_id = streamer_info[0]['id']

        create_clip = self.twitch.create_clip(broadcaster_id=streamer_id, has_delay=True)

        if 'error' in create_clip:
            embed = discord.Embed(title=f"{create_clip['message']}", color=discord.Colour.from_rgb(255, 0, 0))
            await ctx.send(embed=embed)
            return
        elif len(create_clip['data']) == 0:
            embed = discord.Embed(title="Streamer not found", color=discord.Colour.from_rgb(255, 0, 0))
            await ctx.send(embed=embed)
            return
        
        clip_url = f"https://clips.twitch.tv/{create_clip['data'][0]['id']}"

        await ctx.send(clip_url)

    def update_twitch_tokens(self):
        # refresh twitch
        new_tokens = refresh_access_token(self.refresh_token, self.client_id, self.client_secret)
        self.access_token = new_tokens[0]
        self.refresh_token = new_tokens[1]

        # Update the access token
        update_access_query = f"UPDATE twitchclips SET token = '{new_tokens[0]}' WHERE id = 2"
        update_refresh_query = f"UPDATE twitchclips SET token = '{new_tokens[1]}' WHERE id = 3"

        self.curs.execute(update_access_query)
        self.curs.execute(update_refresh_query)

def setup(bot):
    bot.add_cog(TwitchClip(bot))
