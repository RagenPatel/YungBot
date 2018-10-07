#!/bin/bash/

echo "Installing required packages"
echo ""
echo "============================="
echo ""

echo "Installing tmux"
sudo apt-get install tmux
echo "Installed!"
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
echo "Installed all packages"
