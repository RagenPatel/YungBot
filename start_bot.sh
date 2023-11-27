#!/bin/bash/
cd /home/pi/dev/YungBot/
git stash
git pull
cd v2

source venv/bin/activate
python3 main.py &
python3 twitch_chat.py &

CURRENT_DATE="botbot-"`date +"%Y-%m-%d-%T"`".log"

# deactivate
# cd ~/Yashas-DiscordBot/discordbot
# rm -rf *.mp3
# source venv/bin/activate
# python3 botbot.py > ${CURRENT_DATE} &

