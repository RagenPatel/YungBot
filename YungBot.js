var { Client, RichEmbed } = require("discord.js");
var request = require("request");
var emotes = require("./classes/emotes.js");
var sentimentAnalysis = require("./classes/sentimentAnalysis.js");
var emojis = require('./classes/addEmojis.js');
var db = require('./classes/db/postgresDB.js');
var esp32 = require('./classes/IoT/esp32.js');

const spawn = require("child_process").spawn;
const util = require('util');
const exec = util.promisify(require('child_process').exec);

require('dotenv').config();

//File reader of .txt so I can upload this project to GitHub without disclosing APIs
var fs = require('fs')

//USE forever -w yungbot.js !!!!!!!
//Make functions

var line;
var checkID;

//set API keys here
var discordTok = process.env.DISCORD_API_TOKEN;

var region = 'na';
var data = {};

var bot = new Client();


//Start of bot
bot.on("message", function(message){
    console.log(message.channel.id)
    var input = message.content.toLowerCase();
    var sID;

    if (message.author.id == 173610714433454084) {
        if (input.indexOf("?addemote") == 0) {
            var msg = input.substr(input.indexOf(" "))
            msg = msg.substr(1)
            var arg1 = msg.substr(0, msg.indexOf(" "))
            msg = msg.substr(msg.indexOf(" "))
            var arg2 = msg.substr(1)
            const pythonProcess = spawn('python', ['addEmotes.py', arg1, arg2])
            pythonProcess
        }
    }

    if (input.indexOf("?addemoji") == 0) {
        emojis.addEmojis(input, message);
    }

    //FUNCTIONS
    function reboot_bot() {
        exec('sudo reboot');
    }

    function clear_logs() {
        exec('python /home/pi/YungBot/LeagueDiscord/clean_logs.py');
    }

    function help(){
        const embed = new RichEmbed()
            .setTitle('Commands')
            .setColor("#45bf18")
            .addField("?addemote emotename url/remove", "used to add an emote via the url or remove the emote")
            .addField("~summonerName", "Get League user info")
            .addField("?ingame summonerName", "Get ingame time for a user")
            .addField("?addemoji url name", "adds emote to discord emojis list (native)")
            .addField("?emotes", "Gets a list of all the current available emotes")
            .addField("?sqlRemove emoteName", "Remove an emote from the Postgres Database")
            .addField("!reboot", "restart server")
            .addField("?logs", "kappabot logs")
            .addField("!clean", "clean logs")
            .addField("Version", "v1.4.2")
            .addField("?addtodb <emoteName> <URL>", "Add emote to the DB. To remove from DB, use ?addtodb <emoteName> remove")
        message.channel.send(embed);    
    }

    //test second .js file
    // var checkEmote = false
    checkEmote = emotes.checkForEmotes(input, message);

    if(input.indexOf("#region") == 0){
        var arr = input.split(" ");
        if(arr.length != 2){
            message.channel.send("invalid # of arguments.");
        }else{
            region = arr[1];
            message.channel.send("region set to: "+ region);
            console.log("region set to: "+ region);
        }
    }

    if(input.indexOf("#getregion") >= 0){
        console.log("current region: "+ region);
        message.channel.send("current region: "+ region);
    }

    if(input == "dlift"){
        message.channel.send(" Doublelift is a God");
        message.channel.send("https://i.ytimg.com/vi/vN7EoPlxQsQ/hqdefault.jpg");
    }

    if(input.indexOf("?emotes") == 0 || input.indexOf("!emotes") == 0) {
        const embed = new RichEmbed()
        message.channel.send(embed
            .setColor("#31a9c6")
            .setTitle("YungBot GIF Emotes")
            .setURL("https://yungbotemotes.github.io/"))
            .catch(console.error);
    }

    if((input.includes("c9") || input.includes(" na ") || input.includes("sneaky"))) {
        sentimentAnalysis.sentiment(input, message);
    }

    if(input.indexOf("emojis") == 0) {
        emojis.addEmojis(input, message);
    }

    // help command
    if(input.indexOf("!help")==0){
        console.log("called help command");
        help();
    }

    if(input.indexOf("!reboot") == 0) {
        const embed = new RichEmbed()
            .setTitle('Rebooting server')
            .setColor("#45bf18")
        message.channel.send(embed); 
        reboot_bot()
    }

    if(input.indexOf("!clean") == 0) {
        const embed = new RichEmbed()
            .setTitle('Cleaning Logs and rebooting.')
            .setColor("#45bf18")
        message.channel.send(embed); 
        clear_logs()
        reboot_bot()

    }

    if (message.content.startsWith('?logs')) {
        message.channel.send("kappabot logs", { files: ["/home/pi/.forever/kappabot.log"] });
    }

    if (message.content.startsWith('!getimage') && process.env.SUDO_USER == message.author.id) {
        console.log("userId: " + message.author.id);
        esp32.getCapture(bot);
    }

    // MARK: - Add Emote to Database
    if (message.content.startsWith('?addtodb')) {
        var msg = input.split(" ");
        var word = msg[1];
        var url = msg[2];
        if (url.indexOf("http") >= 0) {
            db.addEmoteToDB(word, url, message);
        } else if (url.indexOf("remove") == 0) {
            db.deleteEmote(word, message);
        } else {
            const embed = new RichEmbed()
            .setTitle('Error with URL!')
            .setColor("#F14C52")
            message.channel.send(embed); 
        }
    }

    // MARK: - Query Emote usage
    if (input.startsWith("!emoteusage")) {
        console.log(">>>> emote usage calling db")
        db.getTop10UsedEmotes(message);
    }
});

bot.login("Bot "+ discordTok);
console.log("Starting bot...");
