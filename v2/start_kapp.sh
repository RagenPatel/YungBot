#!/bin/bash/
cd /home/pi/YungBot/LeagueDiscord/v2
python3 kill_kappabot.py > /home/pi/YungBot/LeagueDiscord/v2/kill_kappabot.log
python3 xqc_chat.py
sudo su kapp
cd /home/kapp/KappaBot/KappaBot
python3 python_app/tweet_posts.py > /home/kapp/KappaBot/KappaBot/logs/tweets-logs.txt
