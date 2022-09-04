import asyncio
from discord.ext import commands
import discord
from dotenv import load_dotenv
import os

import psycopg2

load_dotenv()

intents = discord.Intents.all()
intents.message_content = True

bot = commands.Bot(command_prefix='!', intents=intents)
# client = discord.Client(intents=intents)

token = os.getenv("DISCORD_API_TOKEN")

async def load():
    for filename in os.listdir('./cogs'):
            if filename.endswith('.py'):
                await bot.load_extension(f'cogs.{filename[:-3]}')

async def main():
    await load()
    await bot.start(token)

# client.run(token)
asyncio.run(main())
