#!/bin/bash/
sleep 8
cd ~/YungBot/LeagueDiscord/
git stash
git pull
cd v2

source venv/bin/activate
python3 main.py &
python3 twitch_chat.py &