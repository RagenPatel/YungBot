#!/bin/bash/
cd /home/pi/YungBot/LeagueDiscord/
export $(egrep -v '^#' .env | xargs)

STR_TRUE="true"

python3 /home/pi/YungBot/LeagueDiscord/updateEmotesWebsite.py

if [ $SHOULD_DEPLOY = $STR_TRUE ]
then
    echo "deploying : ${SHOULD_DEPLOY}"
    cd /home/pi/YungBot/React/emote-react
    npm run deploy

    CURRENTDATETIME=`date +"%b %d, %Y %T"`
    git add .
    git commit -m "Update: ${CURRENTDATETIME}"
    git push origin master
fi
