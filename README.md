# LeagueDiscord

Discord Bot that adds Twitch Emotes to Discord chat messages and replies to questions by going to various APIs to retrieve and manipulate data.

# Setup

1. Set up environment variables for discord API token, Riot games API, and ChampionGG API in a .env file at root directory with `export DISCORD_API_TOKEN=*TOKEN HERE*` .. use `RIOT_API` and `CHAMP_API` for the other two keys.
2. Install required dependencies by running the dependencies.sh file
3. To reboot pi daily, edit by running `sudo crontab -e` and using this cron format to reboot at a specific time: `0 4 * * * /sbin/shutdown -r now`
4. To start a script at boot, edit the `autostart` file in `~/.config/lxsession/.../autostart` add a new line with `@bash /path/to/script.sh`
5. For Raspbian lite, open to `sudo vim /etc/rc.local` and add: `su pi -c 'bash /pathto/script.sh &'` to make it run at startup (`&` makes it so the process runs in the background)
6. Set up postgres from `https://opensource.com/article/17/10/set-postgres-database-your-raspberry-pi`
7. autostart postgresql at boot `sudo update-rc.d postgresql enable`
