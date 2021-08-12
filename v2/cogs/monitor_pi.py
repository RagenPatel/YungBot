import discord
import os
from discord.ext import commands
import datetime
import psutil
from dotenv import load_dotenv
import subprocess

load_dotenv()

class PiStats(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def usage(self, ctx):
        temp = self.getTemp()

        embedVar = discord.Embed(title="Pi Usage", color=discord.Colour.from_rgb(temp[1][0], temp[1][1], temp[1][2]))
        embedVar.add_field(name=str(temp[0])+"°C", value="CPU Temp", inline=True)
        
        embedVar = self.getCPU(embedVar)
        embedVar = self.getCPUFreq(embedVar)
        embedVar = self.getCPULoad(embedVar)
        embedVar = self.getRAM(embedVar)
        embedVar.add_field(name=self.getBootTime(), value="Boot Time", inline=False)

        await ctx.send(embed=embedVar)

    @commands.command()
    async def reboot(self, ctx):
        embed = discord.Embed(title="Rebooting...", color=discord.Colour.from_rgb(255, 219, 110))
        await ctx.send(embed=embed)

        os.system('sudo shutdown -r now')


    # Helpers ----------------------------------------------------
    def getCPU(self, embed):
        # per core 
        # @returns: [12.2, 1.4, 32.1, 24]   load % for each core
        cpu = psutil.cpu_percent(percpu=True)

        embed.add_field(name=str(cpu), value="CPU Usage / Core")
        return embed

    # @returns: 1400 MHz - frequency
    def getCPUFreq(self, embed):
        freq = psutil.cpu_freq()[0]

        embed.add_field(name=str(freq)+"MHz", value="Freq")
        return embed

    # @returns: (0.1, 0.2, 0.4)  tuple of load for last 1 min, 5 min, and 15 min
    def getCPULoad(self, embed):
        load = psutil.getloadavg()

        embed.add_field(name=str(load), value="CPU Load: 1m 5m 15m")
        return embed


    # @returns: % of RAM usage
    def getRAM(self, embed):
        ram = psutil.virtual_memory()[2]

        embed.add_field(name=str(ram)+"%", value="RAM Usage")
        return embed


    # @returns: Temp in C
    def getTemp(self):
        temp = psutil.sensors_temperatures()['cpu_thermal'][0][1]

        if temp < 38:
            return (temp, (92, 198, 199))
        elif temp < 42:
            return (temp, (77, 204, 134))
        elif temp < 45:
            return (temp, (250, 150, 1))
        
        return (temp, (223, 53, 57))

    # @returns: Long for last boottime of the system
    def getBootTime(self):
        print("getting time")
        return datetime.datetime.fromtimestamp(psutil.boot_time()).strftime("%Y-%m-%d %H:%M:%S")

def setup(bot):
    bot.add_cog(PiStats(bot))