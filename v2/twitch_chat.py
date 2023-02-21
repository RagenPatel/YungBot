from dotenv import load_dotenv
import os
import re
import requests
import socket
import logging

import psycopg2
from psycopg2.extras import RealDictCursor
import json

from discord import SyncWebhook

load_dotenv()
logging.basicConfig(filename='twitchchat.log', level=logging.DEBUG,
                    format='%(asctime)s %(levelname)-8s %(message)s', filemode='w', datefmt='%Y-%m-%d %H:%M:%S')


def send_custom_message(message):
    hook = SyncWebhook.partial(webhookid, webhooktoken)
    hook.send("Error Connecting to channels: \`\`\`" + message + "\`\`\`", username="🚨 Mod 🚨",
              avatar_url="https://upload.wikimedia.org/wikipedia/commons/e/ea/Settings_%28iOS%29.png")
    logging.warning(
        "SEND_CUSTOM_MESSAGE: Error Connecting to channels: \`\`\`" + message + "\`\`\`")


def jsonify_data(data):
    dat = {}
    data = json.dumps(data)
    data = json.loads(data)

    for jsn in data:
        dat[jsn['channel']] = jsn

    return dat


def load_info_from_db():
    conn = psycopg2.connect(user=os.getenv("PGUSER"),
                            password=os.getenv("PGPASSWORD"),
                            host=os.getenv("PGHOST"),
                            port=os.getenv("PGPORT"),
                            database=os.getenv("PGDATABASE"))

    with conn:
        curs = conn.cursor(cursor_factory=RealDictCursor)
        query = "SELECT * FROM twitchchat"
        curs.execute(query)
        dat = curs.fetchall()
        return jsonify_data(dat)


db_info = load_info_from_db()

webhookid = os.getenv('WEBHOOK_ID')
webhooktoken = os.getenv('WEBHOOK_TOKEN')

server = 'irc.chat.twitch.tv'
port = 6667
nickname = 'xqcowchat'
token = os.getenv('TWITCH_AUTH')

sock = socket.socket()

try:
    sock.connect((server, port))
except socket.error as exc:
    send_custom_message(exc)
    logging.error(exc)
except Exception as exc:
    send_custom_message(exc)
    logging.error(exc)

# Get table info from psql with channels. For each row, join the channel
# then when receiving a message, decode each line to get the user, channel, and message
# then send a request to discord websocket if a user matches

sock.send(f"PASS {token}\n".encode('utf-8'))
sock.send(f"NICK {nickname}\n".encode('utf-8'))

for row in db_info:
    print(row)
    logging.info(f'JOINING: {row}')
    sock.send(f"JOIN {db_info[row]['channel_id']}\n".encode('utf-8'))


def get_message_info(message):
    search = re.search(
        ':(.*)\!.*@.*\.tmi\.twitch\.tv PRIVMSG #(.*?) :(.*)', message)

    if search is not None:
        username, channel, message = search.groups()
        return username, channel, message

    return None, None, None


def send_message(resp):
    arr = list(filter(None, resp.split('\n')))

    for chat in arr:
        username, channel, message = get_message_info(chat)

        if username is None:
            continue

        if username in db_info:
            logging.info(f'SEND_MESSAGE: {username}, {channel}, {message}')
            if os.getenv('TWITCH_IGNORE') not in message and 'esportbet' not in message.lower() and 'esb.io/' not in message.lower() and 'esportsbet' not in message.lower() and '100 usdt' not in message.lower() and 'lichess' not in message.lower():
                hook = SyncWebhook.partial(webhookid, webhooktoken)
                hook.send(message, username=username + " in #" + channel +
                          " chat", avatar_url=db_info[username]['channel_image'])


while True:
    resp = sock.recv(1024).decode('utf-8', 'ignore')
    messages = resp.split('\r\n')
    messages = list(filter(None, messages))
    for message in messages:
        logging.info(f'RESP: {repr(message)}')
        if message == '' or len(message) <= 1:
            continue
        if message.startswith('PING'):
            sock.send("PONG :tmi.twitch.tv\r\n".encode("utf-8"))
        elif len(message) > 1:
            send_message(message)
