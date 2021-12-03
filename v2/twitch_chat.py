from dotenv import load_dotenv
import os
import re
import requests
import socket

import psycopg2
from psycopg2.extras import RealDictCursor
import json

from discord import Webhook, RequestsWebhookAdapter

load_dotenv()

def send_custom_message(message):
    hook = Webhook.partial(webhookid, webhooktoken, adapter=RequestsWebhookAdapter())
    hook.send("Error Connecting to channels: \`\`\`" + message + "\`\`\`", username="🚨 Mod 🚨", avatar_url="https://upload.wikimedia.org/wikipedia/commons/e/ea/Settings_%28iOS%29.png")

def jsonify_data(data):
    dat = {}
    data = json.dumps(data)
    data = json.loads(data)

    for jsn in data:
        dat[jsn['channel']] = jsn

    return dat

def load_info_from_db():
    conn = psycopg2.connect(user = os.getenv("PGUSER"),
                                password = os.getenv("PGPASSWORD"),
                                host = os.getenv("PGHOST"),
                                port = os.getenv("PGPORT"),
                                database = os.getenv("PGDATABASE"))

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

sock.settimeout(60)

try:
    sock.connect((server, port))
except socket.error as exc:
    send_custom_message(exc)
except Exception as exc:
    send_custom_message(exc)

# Get table info from psql with channels. For each row, join the channel
# then when receiving a message, decode each line to get the user, channel, and message
# then send a request to discord websocket if a user matches

sock.send(f"PASS {token}\n".encode('utf-8'))
sock.send(f"NICK {nickname}\n".encode('utf-8'))

for row in db_info:
    print(row)
    sock.send(f"JOIN {db_info[row]['channel_id']}\n".encode('utf-8'))

def get_message_info(message):
    search = re.search(':(.*)\!.*@.*\.tmi\.twitch\.tv PRIVMSG #(.*?) :(.*)', message)

    if search is not None:
        username, channel, message = search.groups()
        return username, channel, message

    return None, None, None

def send_message(resp):
    arr = resp.split('\n')

    for chat in arr:
        username, channel, message = get_message_info(chat)

        if username is None:
            continue

        if username in db_info:
            hook = Webhook.partial(webhookid, webhooktoken, adapter=RequestsWebhookAdapter())
            hook.send(message, username=username + " in #" + channel + " chat", avatar_url=db_info[username]['channel_image'])

f = open("twitchchat.txt", "w")

while True:
    resp = sock.recv(16384).decode('utf-8')
    f.write(resp)

    if resp.startswith('PING'):
        sock.send("PONG\n".encode('utf-8'))
    elif len(resp) > 0:
        send_message(resp)
