#!/bin/bash/
cd ~/YungBot/LeagueDiscord/
git stash
git pull
cd v2

source venv/bin/activate
python3 main.py &
python3 twitch_chat.py &

deactivate
cd ~/Yashas-DiscordBot/discordbot
rm -rf *.mp3
source venv/bin/activate
python3 botbot.py &

