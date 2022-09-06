import discord
from discord.ext import commands
from discord import Interaction
from discord import app_commands

import requests
from dotenv import load_dotenv

load_dotenv()


class TestDiscord(commands.Cog):
    def __init__(self, bot) -> None:
        self.bot = bot
        self.emote_test = ""

    @app_commands.command(name="emote", description="Check emotes")
    async def emoteCheck(self, interaction: Interaction, emote: str) -> None:
        select = discord.ui.Select(
            placeholder="Select a DB for emotes",
            options=[
                discord.SelectOption(
                    label="7tv", emoji="😈", description="7tv", value=0),
                discord.SelectOption(
                    label="FrankerFaceZ", emoji="🐕", description="FrankerFaceZ", value=1),
                discord.SelectOption(
                    label="BTTV", emoji="🎭", description="BTTV", value=2)
            ]
        )

        async def get_emote_from_frankerfacez(emote):
            base_url = "https://api.frankerfacez.com/v1/emotes"

            query = {'q': emote, 'sensitive': "false",
                     'high_dpi': 'off', 'page': 1, 'per_page': 200}
            r = requests.get(base_url, params=query)

            def parse_emote_list(emote_json, emote_dict):
                for emote_details in emote_json['emoticons']:
                    emote_dict.append(emote_details)

                return emote_dict

            if r.status_code != 200:
                return None

            page = r.json()

            emote_dict = []
            # should return a dict of emote jsons
            emote_dict = parse_emote_list(page, emote_dict)

            for i in range(2, page['_pages']):
                query['page'] = i
                r = requests.get(base_url, params=query)

                emote_dict = parse_emote_list(r.json(), emote_dict)

            emote_json = {"emotes": emote_dict}
            emote_dict = sorted(
                emote_json['emotes'], key=lambda x: x['usage_count'], reverse=True)

            if len(emote_dict) > 0:
                if '2' in emote_dict[0]['urls']:
                    # PSQL stuff here
                    return emote_dict[0]['urls']['2'], emote_dict
                elif '1' in emote_dict[0]['urls']:
                    # PSQL stuff here
                    return emote_dict[0]['urls']['1'], emote_dict

            return None

        async def query_7tv(emote):
            query = {
                'query': """
                        query($query: String!,$page: Int,$pageSize: Int,$globalState: String,$sortBy: String,$sortOrder:
                        Int,$channel: String,$submitted_by: String,$filter: EmoteFilter) {search_emotes(query: $query,limit:
                        $pageSize,page: $page,pageSize: $pageSize,globalState: $globalState,sortBy: $sortBy,sortOrder: $sortOrder,
                        channel: $channel,submitted_by: $submitted_by,filter: $filter) {id,visibility,urls,owner {id,display_name,role {id,name,color},banned}urls,name,tags}}
                    """,
                'variables': {
                    "query": emote,
                    "page": 1,
                    "pageSize": 36,
                    "limit": 36,
                    "globalState": None,
                    "sortBy": "popularity",
                    "sortOrder": 0,
                    "channel": None,
                    "submitted_by": None
                }
            }

            url = "https://7tv.io/v2/gql"
            r = requests.post(url, json=query)

            data = r.json()

            if ('errors' in data):
                return None

            data = data['data']['search_emotes']

            if len(data) > 0:
                emote_url = data[0]['urls'][1][1]
                check_gif = requests.head(
                    emote_url+'.gif').headers['Content-Type']

                if (check_gif == 'image/gif'):
                    return emote_url+'.gif', data

                return emote_url, data

            return None

        async def query_BTTV(emote):
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

        emote_list_index = 0
        emote_to_send = ""

        async def my_callback(interaction: Interaction):
            nonlocal emote_to_send
            nonlocal emote_list_index

            if select.values[0] == '0':
                emote_from_7tv, data = await query_7tv(emote)

                if emote_from_7tv != None:
                    emote_to_send = emote_from_7tv
            elif select.values[0] == '1':
                ffz, data = await get_emote_from_frankerfacez(emote)
                if ffz != None:
                    formatted_ffz = "https://" + ffz[2:]
                    emote_to_send = formatted_ffz
                else:
                    return
            elif select.values[0] == '2':
                bttv, data = await query_BTTV(emote)

                if bttv != None:
                    emote_to_send = bttv
                else:
                    return
            # if emote_url != None:
            #     formatted_url = "https://" + emote_url[2:]
            #     self.emote_stats_to_postgres(emote)
            #     await message.channel.send(formatted_url)

            new_view = discord.ui.View()
            new_view.add_item(select)

            send_button = discord.ui.Button(
                label="Send", style=discord.ButtonStyle.green, custom_id="send")
            next_button = discord.ui.Button(
                label="Next", custom_id="next_emote")
            previous_button = discord.ui.Button(
                label="Previous")
            new_view.add_item(send_button)
            new_view.add_item(next_button)
            new_view.add_item(previous_button)

            async def send(interaction: Interaction):
                nonlocal emote_to_send
                await interaction.response.send_message(content=f"{emote_to_send}")

            emote_list_index = 0

            async def next_emote(interaction: Interaction):
                nonlocal emote_list_index
                nonlocal emote_to_send

                emote_list_index = 0 if (
                    emote_list_index + 1) >= len(data) else (emote_list_index + 1)

                if select.values[0] == '0':
                    next_emote_data = data[emote_list_index]
                    emote_url = next_emote_data['urls'][1][1]
                    check_gif = requests.head(
                        emote_url+'.gif').headers['Content-Type']

                    if (check_gif == 'image/gif'):
                        emote_to_send = f"{emote_url}.gif"
                    else:
                        emote_to_send = f"{emote_url}.png"
                elif select.values[0] == '1':
                    next_emote_data = data[emote_list_index]
                    if '2' in next_emote_data['urls']:
                        # PSQL stuff here
                        ffz = next_emote_data['urls']['2']
                        formatted_ffz = "https://" + ffz[2:]
                        emote_to_send = formatted_ffz
                    elif '1' in next_emote_data['urls']:
                        # PSQL stuff here
                        ffz = next_emote_data['urls']['1']
                        formatted_ffz = "https://" + ffz[2:]
                        emote_to_send = formatted_ffz
                elif select.values[0] == '2':
                    next_emote_data = data[emote_list_index]
                    emote_to_send = f"https://cdn.betterttv.net/emote/{next_emote_data['id']}/2x{'.gif' if next_emote_data['imageType'] == 'gif' else '.png'}"

                await interaction.response.edit_message(content=f"{emote_to_send}")

            async def previous_emote(interaction: Interaction):
                nonlocal emote_list_index
                nonlocal emote_to_send

                emote_list_index = (len(data) - 1) if (
                    emote_list_index - 1) < 0 else (emote_list_index - 1)

                if select.values[0] == '0':
                    next_emote_data = data[emote_list_index]
                    emote_url = next_emote_data['urls'][1][1]
                    check_gif = requests.head(
                        emote_url+'.gif').headers['Content-Type']

                    if (check_gif == 'image/gif'):
                        emote_to_send = f"{emote_url}.gif"
                    else:
                        emote_to_send = f"{emote_url}.png"
                elif select.values[0] == '1':
                    next_emote_data = data[emote_list_index]
                    if '2' in next_emote_data['urls']:
                        # PSQL stuff here
                        ffz = next_emote_data['urls']['2']
                        formatted_ffz = "https://" + ffz[2:]
                        emote_to_send = formatted_ffz
                    elif '1' in next_emote_data['urls']:
                        # PSQL stuff here
                        ffz = next_emote_data['urls']['1']
                        formatted_ffz = "https://" + ffz[2:]
                        emote_to_send = formatted_ffz
                elif select.values[0] == '2':
                    next_emote_data = data[emote_list_index]
                    emote_to_send = f"https://cdn.betterttv.net/emote/{next_emote_data['id']}/2x{'.gif' if next_emote_data['imageType'] == 'gif' else '.png'}"

                await interaction.response.edit_message(content=f"{emote_to_send}")

            send_button.callback = send
            next_button.callback = next_emote
            previous_button.callback = previous_emote

            await interaction.response.edit_message(content=f"{emote_to_send}", view=new_view)
            return

        view = discord.ui.View()
        view.add_item(select)
        select.callback = my_callback

        await interaction.response.send_message(view=view, ephemeral=True)


async def setup(bot):
    await bot.add_cog(TestDiscord(bot))
