from discord.ext import commands
from dotenv import load_dotenv
import os

import psycopg2

load_dotenv()

bot = commands.Bot(command_prefix='!')

@bot.event
async def on_message(message):
    await bot.process_commands(message)

    keys = message.content.split(' ')

    for key in keys:
        if len(key) > 2 and key[0] == ':' and key[-1] == ':' and " " not in key:
            emote = key[1:len(key)-1]
    

token = os.getenv("DISCORD_API_TOKEN")

for filename in os.listdir('./cogs'):
    if filename.endswith('.py'):
        bot.load_extension(f'cogs.{filename[:-3]}')

bot.run(token)
