.PHONY: all

all:
	@echo "Installing required packages"
	@echo ""
	@echo "============================="
	@echo ""

	sudo apt-get install vim

	@echo "Installing tmux"
	sudo apt-get install tmux
	@echo "Installed!"
	@echo ""

	@echo "Installing Node/npm"
	@echo "------\nDownloading..."
	wget https://nodejs.org/dist/v8.9.0/node-v8.9.0-linux-armv6l.tar.gz

	@echo ""
	@echo "unzipping..."
	tar -xzf node-v8.9.0-linux-armv6l.tar.gz

	@echo ""
	@echo "Installing..."
	cd node-v8.9.0-linux-armv6l/
	sudo cp -R * /usr/local/
	@echo "----\nVersion Info: Node, npm"
	node -v
	npm -v
	@echo ""
	@echo "Node/npm installed successfully!"
	@echo ""
	@echo "removing downloaded node files"
	sudo rm -r node-v8.9.0*
	@echo "Files removed"

	@echo "Installing foreverjs"

	sudo npm install forever -g

	@echo "...Installed!"

	@echo "npm install..."
	sudo npm install

	mkdir ~/KappaBot
	cd ~/KappaBot
	git clone https://github.com/deeppatel1/KappaBot.git

	@echo "Installing KappaBot dependencies"
	@echo ""
	cd ~/KappaBot/KappaBot/
	sudo npm install
	@echo ""

	@echo "Installing postgres"
	sudo apt install postgresql libpq-dev postgresql-client postgresql-client-common -y
	@echo "DONE!"
	@echo "--------------------------"
	@echo "Installed all packages"


postgres:
	@echo "Installing postgres"
	sudo apt install postgresql libpq-dev postgresql-client postgresql-client-common -y
	@echo "DONE!"
	@echo "--------------------------"
	@echo "Installed all packages"


kappabot:
	mkdir ~/KappaBot
	cd ~/KappaBot
	git clone https://github.com/deeppatel1/KappaBot.git

	@echo "Installing KappaBot dependencies"
	@echo ""
	cd ~/KappaBot/KappaBot/
	sudo npm install
	@echo ""


node:
	@echo "Installing Node/npm"
	@echo "------\nDownloading..."
	wget https://nodejs.org/dist/v8.9.0/node-v8.9.0-linux-armv6l.tar.gz

	@echo ""
	@echo "unzipping..."
	tar -xzf node-v8.9.0-linux-armv6l.tar.gz

	@echo ""
	@echo "Installing..."
	cd node-v8.9.0-linux-armv6l/
	sudo cp -R * /usr/local/
	@echo "----\nVersion Info: Node, npm"
	node -v
	npm -v
	@echo ""
	@echo "Node/npm installed successfully!"
	@echo ""
	@echo "removing downloaded node files"
	sudo rm -r node-v8.9.0*
	@echo "Files removed"

test:
	@echo "testing"