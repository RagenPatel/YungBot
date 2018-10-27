#!/bin/bash/

echo "Installing required packages"
echo ""
echo "============================="
echo ""

echo "Installing tmux"
sudo apt-get install tmux
echo "Installed!"
echo ""

echo "Installing Node/npm"
echo "------\nDownloading..."
wget https://nodejs.org/dist/v8.9.0/node-v8.9.0-linux-armv6l.tar.gz
sleep 10
echo ""
echo "unzipping..."
tar -xzf node-v8.9.0-linux-armv6l.tar.gz
sleep 10
echo ""
echo "Installing..."
cd node-v6.11.1-linux-armv6l/
sudo cp -R * /usr/local/
echo "----\nVersion Info: Node, npm"
node -v
npm -v
echo ""
echo "Node/npm installed successfully!"
echo ""
echo ""

echo "Installing foreverjs"

sudo npm install forever -g

echo "...Installed!"


echo "installing discord.js"

sudo npm install --save discord.js

echo "...Installed!"

echo ""
echo "Installing request"

sudo npm install request --save

echo "Installed request\n===================================="
echo "Installing async"

sudo npm install --save async

echo "Installed async\n==================================="
echo "Installing GoogleURL"

sudo npm install googleapis --save

echo "Installed GoogleURL"
echo ""

echo "Installing bitly API"

sudo npm install bitly --save

echo "Installed!"
echo ""

echo "Installing python-shell"

sudo npm install python-shell --save

echo "Python-Shell Installed!"

echo "Installing Python dependencies"
echo ""
echo "Installing Pillow"
pip install Pillow
echo ""

echo "Installing Dotenv"
sudo npm install dotenv
echo ""
echo "Dotenv Installed!"


echo "Installed all packages"
