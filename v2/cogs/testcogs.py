from discord.ext import commands
import os

class Main(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def hello(self, ctx):
      await ctx.send("Hi!")

    @commands.command()
    async def reboot(self, ctx):
        await ctx.send("rebooting!")
        os.system('reboot now')

    @commands.Cog.listener("on_message")
    async def test(self, message):
        print(message.content)

def setup(bot):
    bot.add_cog(Main(bot))
