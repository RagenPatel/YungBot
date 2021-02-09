import subprocess
import os

## Kills all python processes for Kappabot

# known_names = ["python_discord.py", "live_youtube_check.py", "get_twitch_live.py", "post_anime_episode_updates.py"]
known_names = ["tweet_posts.py"]

for python_script in known_names:
    #pkill -9 -f script.py
    output = subprocess.run(["sudo", "pkill", "-9", "-f", python_script], capture_output=True).stdout.decode('UTF-8')
