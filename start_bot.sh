#!/bin/bash/
sleep 8
cd ~/YungBot/LeagueDiscord/
git stash
git pull
forever start -a -l yungbot.log YungBot.js -p 8080
cd v2
python3 monitorPi.py &

source venv/bin/activate
python3 emote_pro.py > emote_pro.log &
python3 xqc_chat.py &
python3 t1_chat.py &