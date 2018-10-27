# LeagueDiscord

Bot that monitors Discord chatroom and replies to questions by going to various APIs to retrieve and manipulate data.

# Setup

1. Set up environment variables for discord API token, Riot games API, and ChampionGG API in a .env file at root directory with `export DISCORD_API_TOKEN=*TOKEN HERE*` .. use `RIOT_API` and `CHAMP_API` for the other two keys.
2. Install required dependencies by running the dependencies.sh file
3. To reboot pi daily, edit by running `sudo crontab -e` and using this cron format to reboot at a specific time: `0 4 * * * /sbin/shutdown -r now`
4. To start a script at boot, edit the `autostart` file in `~/.config/lxsession/.../autostart` add a new line with `@bash /path/to/script.sh`
