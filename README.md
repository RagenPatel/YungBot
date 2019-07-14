# LeagueDiscord

Discord Bot that adds Twitch Emotes to Discord chat messages and replies to questions by going to various APIs to retrieve and manipulate data.

### Setup

1. Set up environment variables for discord API token, Riot games API, and ChampionGG API in a .env file at root directory with `export DISCORD_API_TOKEN=*TOKEN HERE*` .. use `RIOT_API` and `CHAMP_API` for the other two keys.
2. Install required dependencies by running the dependencies.sh file
3. To reboot pi daily, edit by running `sudo crontab -e` and using this cron format to reboot at a specific time: `0 4 * * * /sbin/shutdown -r now`
4. To start a script at boot, edit the `autostart` file in `~/.config/lxsession/.../autostart` add a new line with `@bash /path/to/script.sh`
5. For Raspbian lite, open to `sudo vim /etc/rc.local` and add: `su pi -c 'bash /pathto/script.sh &'` to make it run at startup (`&` makes it so the process runs in the background)
6. Set up postgres from `https://opensource.com/article/17/10/set-postgres-database-your-raspberry-pi`
7. autostart postgresql at boot `sudo update-rc.d postgresql enable`
8. To connect external HDD to a directory, use: `/dev/sda1       /path/to/dir       ntfs-3g async,uid=*USER HERE*,gid=*USER HERE*,umask=000,defaults,sync,auto,nosuid,rw,nouser 0 0`
    1. Need to install `ntfs-3g` for this to work


----------------

### Transmission Setup

1. mount external HDD from Readyshare via fstab: `sudo vim /etc/fstab` and add `//##.##.##.##/USB_Storage/ /path/to/directory cifs user,guest,uid=pi,gid=pi,rw,iocharset=utf8 0 0` to the end of the file to connect the HDD to a directory.
2. To give proper permissions so that Transmission can run without encountering errors, stop the service `sudo service transmission-daemon stop` and then follow:
    1. Open `sudo vim /etc/init.d/transmission-daemon` and change the `USER` to `pi`
    2. Change permissions to these files: 
    ```
    sudo chown -R pi:pi /etc/transmission-daemon
    sudo chown -R pi:pi /etc/init.d/transmission-daemon
    sudo chown -R pi:pi /var/lib/transmission-daemon
    ```
    3. Change `USER` to `pi` from `sudo vim /etc/systemd/system/multi-user.target.wants/transmission-daemon.service`
    4. Reload service `sudo systemctl daemon-reload`
    5. Copy Transmission files to home directory and give it proper permissions:
    ```
    sudo mkdir -p /home/pi/.config/transmission-daemon/
    sudo ln -s /etc/transmission-daemon/settings.json /home/pi/.config/transmission-daemon/
    sudo chown -R pi:pi /home/pi/.config/transmission-daemon/
    ```
    6. start service `sudo service transmission-daemon start`
    
------------

### Pihole Setup

1. Ignore localhost : https://docs.pi-hole.net/ftldns/configfile/
