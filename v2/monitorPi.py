import discord
import os
from discord.ext import commands
import datetime
import psutil
from dotenv import load_dotenv
import subprocess

load_dotenv()

def getCPU(embed):
    # per core 
    # @returns: [12.2, 1.4, 32.1, 24]   load % for each core
    cpu = psutil.cpu_percent(percpu=True)

    embed.add_field(name=str(cpu), value="CPU Usage / Core")
    return embed

# @returns: 1400 MHz - frequency
def getCPUFreq(embed):
    freq = psutil.cpu_freq()[0]

    embed.add_field(name=str(freq)+"MHz", value="Freq")
    return embed

# @returns: (0.1, 0.2, 0.4)  tuple of load for last 1 min, 5 min, and 15 min
def getCPULoad(embed):
    load = psutil.getloadavg()

    embed.add_field(name=str(load), value="CPU Load: 1m 5m 15m")
    return embed


# @returns: % of RAM usage
def getRAM(embed):
    ram = psutil.virtual_memory()[2]

    embed.add_field(name=str(ram)+"%", value="RAM Usage")
    return embed


# @returns: Temp in C
def getTemp():
    temp = psutil.sensors_temperatures()['cpu_thermal'][0][1]

    if temp < 38:
        return (temp, (92, 198, 199))
    elif temp < 42:
        return (temp, (77, 204, 134))
    elif temp < 45:
        return (temp, (250, 150, 1))
    
    return (temp, (223, 53, 57))

# @returns: Long for last boottime of the system
def getBootTime():
    print("getting time")
    return datetime.datetime.fromtimestamp(psutil.boot_time()).strftime("%Y-%m-%d %H:%M:%S")


bot = commands.Bot(command_prefix='!')

@bot.command()
async def usage(ctx):
    temp = getTemp()

    embedVar = discord.Embed(title="Pi Usage", color=discord.Colour.from_rgb(temp[1][0], temp[1][1], temp[1][2]))
    embedVar.add_field(name=str(temp[0])+"°C", value="CPU Temp", inline=True)
    
    embedVar = getCPU(embedVar)
    embedVar = getCPUFreq(embedVar)
    embedVar = getCPULoad(embedVar)
    embedVar = getRAM(embedVar)
    embedVar.add_field(name=getBootTime(), value="Boot Time", inline=False)

    await ctx.send(embed=embedVar)

@bot.command()
async def v2clean(ctx):
    output = subprocess.run(["pgrep", "-af", "python"], capture_output=True).stdout.decode('UTF-8')

    known_names = ["python_discord.py", "live_youtube_check.py", "get_twitch_live.py", "post_anime_episode_updates.py"]

    for python_script in known_names:
        #pkill -9 -f script.py
        output = subprocess.run(["sudo", "pkill", "-9", "-f", python_script], capture_output=True).stdout.decode('UTF-8')
        
        with open("usage.log", 'w+') as f:
            f.write(output+"\n")
    
    with open("usage.log", 'w+') as f:
        f.write("---------------------------\n")

    await ctx.send(output)

@bot.command()
async def test(ctx):
    await ctx.send("v2 version")

token = os.getenv("DISCORD_API_TOKEN")
bot.run(token)