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
cd node-v8.9.0-linux-armv6l/
sudo cp -R * /usr/local/
echo "----\nVersion Info: Node, npm"
node -v
npm -v
echo ""
echo "Node/npm installed successfully!"
echo ""
echo "removing downloaded node files"

cd ~/YungBot/LeagueDiscord/
sudo rm -r node-v8.9.0*
echo "Files removed"

echo "Installing foreverjs"

sudo npm install forever -g

echo "...Installed!"

echo "npm install..."
sudo npm install

echo "Installing Python dependencies"
echo ""
echo "Installing Pillow"
pip install Pillow
echo ""

echo "Installed all packages"
