var discord = require("discord.js");
var request = require("request");
var emotes = require("./classes/emotes.js");
var sentimentAnalysis = require("./classes/sentimentAnalysis.js");
var emojis = require('./classes/addEmojis.js');
const spawn = require("child_process").spawn;
const { BitlyClient } = require('bitly');

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
var champ_key = process.env.CHAMP_API;
var bitly_key = process.env.BITLY_API;

const bitly = new BitlyClient(bitly_key, {});


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

var bot = new discord.Client();


//Start of bot
bot.on("message", function(message){
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
        message.channel.send("Current commands: ?addemote emotename url (use remove instead of url to remove an emote), dlift, na, !**summonerName**," +
            " #region *REGION* (i.e. KR, NA, EUW, EUNE ...), #getregion, ?ingame (<- to check if priyams in game), !bitly <link>, ?addemoji url name");    }

    function summonerInfo(input, retStuff) {
        console.log(input.substr(1));
        var name = input.substr(1);

        var URL = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/' + name + '?api_key=' + api_key;
        request(URL, function (err, response, body) {
            if (!err && response.statusCode == 200) {
                var json = JSON.parse(body);
                console.log(json);
                var sName = json['name'];
                var sID = json['id'];
                var sLvl = json['summonerLevel'];

                if(retStuff == true) {
                    return sID;
                }

                var output = "\n`Name: " + sName + "`\n" +
                    "`ID: " + sID + "`\n" +
                    "`Level: " + sLvl + "`";
                message.channel.send(output);
            } else {
                console.log(err);
            }
        });
    }

    //test second .js file
    var checkEmote = false
    checkEmote = emotes.checkForEmotes(input);
    console.log("checkEmote local: " + checkEmote);

    if (checkEmote != false) {
        message.channel.send({files: ['./emotesImages/'+checkEmote+'.png']});
    }

    // TESTING OUT IF EXTRA FILE IS NECESSARY
    // if(checkEmote == false) {
    //     console.log("no emote");
    // } else if(checkEmote == true) {
    //     message.channel.send({files: ['./emotesImages/'+input+'.png']});
    // } else {
    //     message.channel.send({files: ['./emotesImages/'+checkEmote+'.png']});
    // }



    //help command
    if(input == "--h"){
        help();
    }

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


    if(input.includes("c9") || input.includes("na") || input.includes("sneaky")) {
        sentimentAnalysis.sentiment(input, message);
    }

    if(input.indexOf("emojis") == 0) {
        emojis.addEmojis(input, message);
    }


    //IMPLEMENT GETTING CUSTOM TIMES FOR ANY PERSON.. MAYBE EVEN REGIONS
    //get ongoing game data. i.e current game length
    if(input.indexOf("?ingame") == 0){

        // Check if the GUI in the next space is in game. Username = after the ' '
        if(input.length > 7 && input.charAt(7) == ' ') {
            var checkName = input.substr(8);
            var name = checkName.trim();

            var URL = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/' + name + '?api_key=' + api_key;
            request(URL, function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    var json = JSON.parse(body);
                    console.log(json);
                    var sName = json['name'];
                    var sID = json['id'];
                    var sLvl = json['summonerLevel'];

                    var output = "checkID: " + sID;
                    message.channel.send(output);
                } else {
                    console.log(err);
                    message.channel.send("invalid summoner name");
                }
            });
        } else {

            var URL = "https://na1.api.riotgames.com/lol/spectator/v3/active-games/by-summoner/50628556?api_key=" + api_key;
            request(URL, function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    var json = JSON.parse(body);
                    console.log(json);
                    if (json['gameid'] != "") {
                        var timeSec = json['gameLength'];
                        var timeMin = timeSec / 60 + 4;
                        if (isNaN(timeMin)) {
                            message.channel.send("This GUIs not in game.");
                        } else {
                            message.channel.send("This person is in game for " + timeMin + " minutes.");
                        }
                    }
                } else {
                    console.log(err);
                    message.channel.send("error reaching API")
                }
            });
        }
    }

    if (input.indexOf("checkID: ") == 0) {
        var idToCheck = input.substr(9);

        var URL = "https://na1.api.riotgames.com/lol/spectator/v3/active-games/by-summoner/" + idToCheck + "?api_key=" + api_key;
        request(URL, function (err, response, body) {
            var json = JSON.parse(body);
            console.log(json);
            if (json['gameid'] != "") {
                var timeSec = json['gameLength'];
                var timeMin = timeSec / 60 + 4;
                if (isNaN(timeMin)) {
                    message.channel.send("This GUIs not in game.");
                } else {
                    message.channel.send("This GUIs been in game for " + timeMin + " minutes.");
                }
            }
        });

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

    if(input.charAt(0)=='!') {
        if(input.indexOf("!help")==0){
            console.log("called help command");
            help();
        } else if(input.indexOf("!bitly") == 0) {
            var input_arr = input.split(" ");
            var url = input_arr[1];

            bitly.shorten(url)
            .then(function(result) {
                message.channel.send(result['url']);
            })
            .catch(function(error) {
                console.error(error);
            });
        } else if (input.indexOf(" ") >= 0 && input.indexOf("!bitly") != 0) {
            message.channel.send("Invalid format. Make sure there aint no spaces in der");
        } else {
            summonerInfo(input, false);
        }
    }

});

bot.login("Bot "+ discordTok);
console.log("Starting bot...");
