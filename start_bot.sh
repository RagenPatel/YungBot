#!/bin/bash/
cd /root/yungbot 
cd v2

source venv/bin/activate
python3 main.py &
# python3 twitch_chat.py &
# python3 track_reddit.py &

CURRENT_DATE="botbot-"`date +"%Y-%m-%d-%T"`".log"

# deactivate
# cd ~/Yashas-DiscordBot/discordbot
# rm -rf *.mp3
# source venv/bin/activate
# python3 botbot.py > ${CURRENT_DATE} &

