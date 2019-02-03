var { Client, RichEmbed } = require("discord.js");
var request = require("request");
var emotes = require("./classes/emotes.js");
var sentimentAnalysis = require("./classes/sentimentAnalysis.js");
var emojis = require('./classes/addEmojis.js');
var league = require('./classes/league.js');
var db = require('./classes/db/postgresDB.js');
var reddit = require('./classes/ice_reddit.js');
const spawn = require("child_process").spawn;
const { BitlyClient } = require('bitly');
const { Kayn, REGIONS } = require('kayn')

require('dotenv').config();

//File reader of .txt so I can upload this project to GitHub without disclosing APIs
var fs = require('fs')

//var functions = require('../controllers/functions.js');

//USE forever -w yungbot.js !!!!!!!
//Make functions

var line;
var checkID;

/*
fs.readFile('APIs.txt', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  console.log("Data is \n" + data);
  console.log(dataJson = data.split(" "));
  discordTokAPI = dataJson[0];
  console.log("discordTokAPI " + discordTokAPI);
}); */

//console.log("Outside function: " + data);

//set API keys here
var discordTok = process.env.DISCORD_API_TOKEN;
var api_key = process.env.RIOT_API;
var bitly_key = process.env.BITLY_API;

const bitly = new BitlyClient(bitly_key, {});
const kayn = Kayn(api_key)()


//======================================================================================================================
// USE THIS WHEN A NEW CHAMPION IS RELEASED TO UPDATE CHAMPIONS LIST----------------------------------------------------
//======================================================================================================================
//  https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/RiotSchmick?api_key=<key>
//  /lol/static-data/v3/champions
/* var URL = 'https://na1.api.riotgames.com/lol/static-data/v3/champions?api_key='+api_key;
request(URL, function(err, response, body){
    var json = JSON.parse(body);
    var saveData = JSON.stringify(json);
    console.log(json);

    fs.writeFile("champions.txt", saveData, function(err) {
        if(err) {
            return console.log(err);
        }
    });

}); */



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

    function help(){
        const embed = new RichEmbed()
            .setTitle('Commands')
            .setColor("#45bf18")
            .addField("?addemote emotename url/remove", "used to add an emote via the url or remove the emote")
            .addField("~summonerName", "Get League user info")
            .addField("?ingame summonerName", "Get ingame time for a user")
            .addField("?bitly <link>", "shorten a url")
            .addField("?addemoji url name", "adds emote to discord emojis list (native)")
            .addField("?emotes", "Gets a list of all the current available emotes")
        message.channel.send(embed);    
    }

    function summonerInfo(input, retStuff) {
        console.log(input.substr(1));
        var name = input.substr(1);

        // Get summoner by name, get data and output
        kayn.Summoner.by.name(name)
        .then(summoner => {
            var sName = summoner['name'];
            var sID = summoner['id'];
            var sLvl = summoner['summonerLevel'];

            if(retStuff == true) {
                return sID;
            }

            const embed = new RichEmbed()
            .setTitle('Summoner Info')
            .setColor("#45bf18")
            .addField("Name", sName)
            .addField("ID", sID)
            .addField("Level", sLvl)
            .setURL("http://na.op.gg/summoner/userName=" + sName)

            message.channel.send(embed);
        })
        .catch(error => {
            message.channel.send("Something is not right 🤔")
            console.error(error)
        })
    }

    //test second .js file
    // var checkEmote = false
    checkEmote = emotes.checkForEmotes(input, message);

    // if(checkEmote[1] == true) {
    //     console.log()
    // } else if (checkEmote[0] != false) {
    //     message.channel.send({files: ['./emotesImages/'+checkEmote+'.png']});
    // }



    //help command
    // if(input == "--h" || input == "?help"){
    //     help();
    // }

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

    if(input.indexOf(" na ") >= 0){
      var randNum = Math.floor(Math.random() * 100);
      console.log("random num: " + randNum);
      if(randNum < 20) {
        message.channel.send("C9 3-0 out of groups Poggers");
      }
    } else if (input.indexOf("na") == 0 && input.length == 2){
      var randNum = Math.floor(Math.random() * 100);
      console.log("random num: " + randNum);
      if(randNum < 30) {
        message.channel.send("LETS GO NA Pog");
      }
    } else if (input.indexOf(" na")>=0 && input.length-2 == input.indexOf("na")){
      var randNum = Math.floor(Math.random() * 100);
      console.log("random num: " + randNum);
      if(randNum < 40) {
        message.channel.send("LETS GO NA Poggers");
      }
    }

    if(input.indexOf("?emote") == 0) {
        var path = './emotesImages';
 
        fs.readdir(path, function(err, items) {
            console.log(items);
            var emoteList = ""
            const embed = new RichEmbed();

            for (var i=0; i<items.length; i++) {
                if (items[i].includes(".png")) {
                    emoteList += items[i].replace(".png", "") + "\n";
                }
            }
    
            message.channel.send(embed
                .setColor("#31a9c6")
                .addField("Emote List", emoteList))
                .catch(console.error);
        });
    }

    if(input.includes("ice_poseidon") && input.includes('reddit.com')) {
        reddit.dataFromURL(input, message)
    }

    if((input.includes("c9") || input.includes("na") || input.includes("sneaky"))) {
        sentimentAnalysis.sentiment(input, message);
    }

    if(input.indexOf("emojis") == 0) {
        emojis.addEmojis(input, message);
    }

    // if (message.author.id != '197948432961241089' && input.indexOf('?updatedb') == 0) {
    //     console.log("updating database!")
    //     db.updateChampions();
    //     db.updateItems();
    // }

    // if (message.author.id != '197948432961241089' && input == '?createtable') {
    //     console.log("CREATED TABLE ~~~~~~~~~~~~~~~~")
    //     db.createTable();
    // }

    if (input.indexOf("checkID: ") == 0) {
        league.checkStats(input, message);
    }

    if (input.indexOf("?matchup ") == 0) {
        league.getMatchup(input, message);
    }

    //IMPLEMENT GETTING CUSTOM TIMES FOR ANY PERSON.. MAYBE EVEN REGIONS
    //get ongoing game data. i.e current game length
    if(input.indexOf("?ingame") == 0){
        const embed = new RichEmbed()
        league.ingame(input, message, embed);
    }

    if (input.charAt(0) == '~' && input.indexOf("ingame")==1){
        var arr = input.split(" ");
        if(arr.length != 2){
            message.channel.send("`Invalid format. Use: '~ ingame *SUMMONERNAME*`");
        }else{
            console.log("Finding sID for "+ arr[1]);
            message.channel.send("!lol match na " + arr[1]);
        }
    }

    if(input.charAt(0) == '~') {
        summonerInfo(input, false);
    }

    if(input.indexOf("?bitly") == 0) {
        var input_arr = input.split(" ");
        var url = input_arr[1];

        bitly.shorten(url)
        .then(function(result) {
            message.channel.send(result['url']);
        })
        .catch(function(error) {
            console.error(error);
        });
    }

    // help command
    if(input.indexOf("!help")==0){
        console.log("called help command");
        help();
    }

    // Sending image from url
    // if(input.indexOf('test')==0) {
    //     message.channel.send("", {files: ['https://cdn.frankerfacez.com/7390d699a3362a0f5a7fe4ca3c643b24.PNG']})
    // }

});

bot.login("Bot "+ discordTok);
console.log("Starting bot...");
