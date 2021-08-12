from discord.ext import commands
from dotenv import load_dotenv
import os

import psycopg2

load_dotenv()

bot = commands.Bot(command_prefix='!')

token = os.getenv("DISCORD_API_TOKEN")

for filename in os.listdir('./cogs'):
    if filename.endswith('.py'):
        bot.load_extension(f'cogs.{filename[:-3]}')

bot.run(token)
