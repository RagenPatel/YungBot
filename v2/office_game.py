import discord
import os
from discord.ext import commands
from discord_components import DiscordComponents, Button, Select, SelectOption, ButtonStyle, InteractionType

import random
import requests

class OfficeGame(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
    
    @commands.command()
    async def game(self, ctx):
        DiscordComponents(self.bot)
        quote, name = self.get_random_quote()
        database = self.get_characters()
        component = self.create_random_components(database, name)

        question = await ctx.send(
            quote,
            components = [ component ]
        )

        try:
            interaction = await self.bot.wait_for("button_click", timeout=10)
            
            if interaction.component.label == name:
                await question.edit(quote, components = [ Button(style=ButtonStyle.green, label="Correct!", disabled=True) ] )
                await interaction.respond(type=InteractionType.ChannelMessageWithSource, content="Lucky")
            else:
                await question.edit(quote, components = [ Button(style=ButtonStyle.red, label="You're an idiot!", disabled=True) ] )
                await interaction.respond(type=InteractionType.ChannelMessageWithSource, content="so bad")
        except:
            await question.edit( components = [ Button(label="Too slow!", disabled=True) ])
    # Helpers
    def get_random_quote(self):
        r = requests.get("https://officeapi.dev/api/quotes/random")

        data = r.json()
        return data['data']['content'], data['data']['character']['firstname']

    def get_characters(self):
        r = requests.get("https://officeapi.dev/api/characters")
        
        return r.json()
    
    def get_random_character(self, database, answer):
        character = random.choice(database['data'])

        while character['firstname'] == answer:
            character = random.choice(database['data'])

        return character['firstname']

    def create_random_components(self, database, answer):
        components = []
        index = random.randint(0,3)

        for i in range(0, 4):
            if i == index:
                components.append(answer)
            else:
                new_char = self.get_random_character(database, answer)
                while new_char in components:
                    new_char = self.get_random_character(database, answer)
                
                components.append(new_char)
        
        for i in range(0, len(components)):
            components[i] = Button(label=components[i])

        return components


def setup(bot):
    bot.add_cog(OfficeGame(bot))