from dotenv import load_dotenv
import os
import requests
import socket
from emoji import demojize

load_dotenv()

websocket_url = os.getenv('XQC_WEBSOCKET')

server = 'irc.chat.twitch.tv'
port = 6667
nickname = 'xqcowchat'
token = os.getenv('TWITCH_AUTH')
channel = '#xqcow'

sock = socket.socket()

sock.connect((server, port))

sock.send(f"PASS {token}\n".encode('utf-8'))
sock.send(f"NICK {nickname}\n".encode('utf-8'))
sock.send(f"JOIN {channel}\n".encode('utf-8'))

discord_token = os.getenv("DISCORD_API_TOKEN")

def send_message(resp):
    arr = resp.split('\n')

    for chat in arr:
        print(chat)
        if chat.lower().find('xqcow@xqcow.tmi.twitch.tv') > 0:
            dat = { "content": chat[49:] }
            print(dat)
            requests.post(url=websocket_url, data=dat)

while True:
    resp = sock.recv(2048).decode('utf-8')

    if resp.startswith('PING'):
        sock.send("PONG\n".encode('utf-8'))
    elif len(resp) > 0:
        send_message(demojize(resp))
