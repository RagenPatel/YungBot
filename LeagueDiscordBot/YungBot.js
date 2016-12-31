var discord = require("discord.js");
var request = require("request");

//USE forever -w yungbot.js !!!!!!!
//Make functions

var bot = new discord.Client();
var discordTok = “YOUR DISCORD API TOKEN HERE”;

var region = 'na';
var data = {};



//Start of bot
bot.on("message", function(message){
    //set API keys here
    var api_key = ‘YOUR RIOTGAMES API KEY HERE’;
    var champ_key = ‘YOUR CHAMPgg API KEY HERE’;
    var input = message.content.toLowerCase();
    var sID;

    //FUNCTIONS

    function help(){
        bot.sendMessage(message, "Current commands: dlift, na, #matchup **champName**, #**champName**, !**summonerName**," +
            " #build *champName*, #region *REGION* (i.e. KR, NA, EUW, EUNE ...)");
    }


    //help command
    if(input == "--h"){
        help();
    }

    if(input.indexOf("#region") == 0){
        var arr = input.split(" ");
        if(arr.length != 2){
            bot.reply(message, "invalid # of arguments.");
        }else{
            region = arr[1];
            bot.sendMessage(message, "set region to "+ region);
            console.log("set region to: "+ region);
        }
    }

    if(input.indexOf("#getregion") >= 0){
        console.log("current region: "+ region);
        bot.reply(message, "current region: "+ region);
    }

    if(input == "dlift"){
        bot.sendMessage(message, " Doublelift is a God");
        bot.sendFile(message, "https://i.ytimg.com/vi/vN7EoPlxQsQ/hqdefault.jpg");
    }

    if(input.indexOf(" na ") >= 0){
        bot.reply(message, "LUL 0-10");
    } else if (input.indexOf("na") == 0 && input.length == 2){
        bot.reply(message, "LUL 0-10 LUL");
    } else if (input.indexOf(" na")>=0 && input.length-2 == input.indexOf("na")){
        bot.reply(message, "LUL 0-10 EleGiggle");
    }


    //IMPLEMENT GETTING CUSTOM TIMES FOR ANY PERSON.. MAYBE EVEN REGIONS
    //get ongoing game data. i.e current game length
    if(input.indexOf("game on!")>=0){
        var URL="https://na.api.pvp.net/observer-mode/rest/consumer/getSpectatorGameInfo/NA1/50628556?api_key="+api_key;
        request(URL, function(err, response, body){
            var json = JSON.parse(body);
            console.log(json);
            var timeSec = json['gameLength'];
            var timeMin = timeSec/60 + 4;
            bot.sendMessage(message, "This person is in game for "+timeMin+" minutes.");
        });

    }

    if(input.indexOf("#build")==0){
        if(input.length == 6) {
            bot.reply(message, "Enter a champ name after #build. i.e: **#build ChampName**");
            console.log("Enter champ name with a space in between");
        }else{
            var champ = input.substr(input.indexOf(" ")+1);

            if(champ == "blitz"){
                champ = "blitzcrank";
            }else if(champ == "godyr" || champ == "dyr"){
                champ = "udyr";
            }else if(champ == "doge"){
                champ = "nasus";
            }

            var URL = 'http://api.champion.gg/champion/'+champ+'/skills/mostPopular?api_key='+champ_key;
            request(URL, function (err, response, body) {
                if(!err && response == 200) {
                    var json = JSON.parse(body);
                    console.log(json[0]);
                    var response = "";
                    var Q = 0, W = 0, E = 0, R = 0;
                    var last, first, second;
                    for (var i = 0; i < json[0]['order'].length; i++) {
                        if (i == json[0]['order'].length - 1) {
                            response += json[0]['order'][i];
                            break;
                        }
                        if (json[0]['order'][i] == 'Q') {
                            Q += 1;
                        } else if (json[0]['order'][i] == 'W') {
                            W += 1;
                        } else if (json[0]['order'][i] == 'E') {
                            E += 1;
                        } else if (json[0]['order'][i] == 'R') {
                            R += 1;
                        }

                        if (i == 8) {
                            last = json[0]['order'][json[0]['order'].length - 1];
                            if (R > 1) {
                                //Special case where R max
                            } else {
                                if (Q > W && Q > E) {
                                    first = 'Q';
                                    if (last == 'W') {
                                        second = 'E';
                                    } else {
                                        second = 'W';
                                    }
                                }
                                if (W > Q && Q > E) {
                                    first = 'W';
                                    if (last == 'E') {
                                        second = 'W';
                                    } else {
                                        second = 'E';
                                    }
                                }
                                if (E > Q && E > W) {
                                    first = 'E';
                                    if (last == 'W') {
                                        second = 'Q';
                                    } else {
                                        second = 'W';
                                    }
                                }
                            }


                        }


                        response += json[0]['order'][i] + ", ";
                        var response1 = "`" + response + "`";
                    }
                }else{
                    console.log(err);
                }

                var answer = "`" + response + "`\n`Max: R>" + first + ">" + second + ">" + last + "`\n`For role: " + json[0]['role'] + "`";
                bot.sendMessage(message, answer);


            });

            var highest = [0, 0, 0];
            var lowest = [100, 100, 100];
            var role = [];
            var lowRole = [];
            var lowName = [""];
            var name = ["", "", ""];


            var URL = 'http://api.champion.gg/champion/'+champ+'/matchup?api_key=?api_key='+champ_key;
            request(URL, function(err, response, body){
                var json = JSON.parse(body);
                //console.log(json[0]);

                var percent;
                var champName;
                for(var i = 0; i<json[0]['matchups'].length;i++) {
                    role[i]=json[0]['role'];
                    percent = json[0]['matchups'][i]['winRate'];
                    champName = json[0]['matchups'][i]['key'];
                    //bot.sendMessage(message, champName + " winrate: " + percent+"%");
                    for(var j=0; j<3;j++){

                        if(percent<lowest[j]){

                            for(var k =4;k>j;k--){
                                lowest[k]=lowest[k-1];
                                lowRole[k]=lowRole[k-1];
                                lowName[k]=lowName[k-1];
                            }
                            //console.log("percent <= lowest[j]: "+ percent+"<="+lowest[j]);
                            lowRole[j]=role;
                            lowName[j]=champName;
                            lowest[j]=percent;
                            //console.log("J: "+j+" "+lowest[j]+" role: "+lowRole[j]+" name: "+ lowName[j]);
                            break;
                        }

                        if (percent>=highest[j]){
                            for(var k = 4; k>j;k--){
                                highest[k]=highest[k-1];
                                role[k]=role[k-1];
                                name[k]=name[k-1];
                            }
                            role[j]=role;
                            name[j]=champName;
                            highest[j]=percent;
                            //console.log(highest[j] + "role: "+ role[j]+" name: "+name[j]);
                            break;
                        }

                    }

                }

                bot.sendMessage(message, "`HIGHEST winrates for **"+champ+"`\n`** against: "+name[0] + " with %: "+ highest[0]+"`" +
                    "\n`** against: "+name[1] + " with %: "+ highest[1]+"`\n`** against: "+name[2] + " with %: "+ highest[2]+"`");

                bot.sendMessage(message, "`LOWEST winrate for **"+champ+"`\n`** against: "+lowName[0]+" with %: "+lowest[0]+"`" +
                    "\n`** against: "+lowName[1]+" with %: "+lowest[1]+"`\n`** against: "+lowName[2]+" with %: "+lowest[2]+"`");

                /*
                 var percent = json[0]['winRate'];
                 for(var j=0; j<3;j++){
                 if (percent>=highest[j]){
                 highest[3]=highest[2]
                 for(var k = 4; k>j;k--){
                 highest[k]=highest[k-1];
                 }
                 highest[j]=percent;
                 console.log(highest[j]);
                 break;
                 }
                 }
                 */
            });


            //Build items
            var items;
            var winPer;
            var totGames;
            var role;
            var ans;
            var URL2 = 'http://api.champion.gg/champion/'+champ+'/items/finished/mostPopular?api_key='+champ_key;
            request(URL2, function(err, response, body){
                if(!err) {
                    var json = JSON.parse(body);
                    //console.log(json[0]);
                    items = json[0]['items'];
                    winPer = json[0]['winPercent'];
                    totGames = json[0]['games'];
                    role = json[0]['role'];
                    ans = "`For role: "+role+", the total games played: "+ totGames+", and win%: "+winPer+" with items: "+items+"`";
                }else{
                    console.log("err: "+ err);
                }
            });


        }
    }


    if(input.substr(0,8)=="#matchup" && input.indexOf(" ")>=0){
        console.log("Entered matchup if statement");
        var champ = input.substr(input.indexOf(" ")+1);
        var highest = [0, 0, 0];
        var lowest = [100, 100, 100];
        var role = [];
        var lowRole = [];
        var lowName = [""];
        var name = ["", "", ""];


        var URL = 'http://api.champion.gg/champion/'+champ+'/matchup?api_key=?api_key='+champ_key;
        request(URL, function(err, response, body){
            var json = JSON.parse(body);
            //console.log(json[0]);

            var percent;
            var champName;
            for(var i = 0; i<json[0]['matchups'].length;i++) {
                role[i]=json[0]['role'];
                percent = json[0]['matchups'][i]['winRate'];
                champName = json[0]['matchups'][i]['key'];
                //bot.sendMessage(message, champName + " winrate: " + percent+"%");
                for(var j=0; j<3;j++){

                    if(percent<lowest[j]){

                        for(var k =4;k>j;k--){
                            lowest[k]=lowest[k-1];
                            lowRole[k]=lowRole[k-1];
                            lowName[k]=lowName[k-1];
                        }
                        //console.log("percent <= lowest[j]: "+ percent+"<="+lowest[j]);
                        lowRole[j]=role;
                        lowName[j]=champName;
                        lowest[j]=percent;
                        console.log("J: "+j+" "+lowest[j]+" role: "+lowRole[j]+" name: "+ lowName[j]);
                        break;
                    }

                    if (percent>=highest[j]){
                        for(var k = 4; k>j;k--){
                            highest[k]=highest[k-1];
                            role[k]=role[k-1];
                            name[k]=name[k-1];
                        }
                        role[j]=role;
                        name[j]=champName;
                        highest[j]=percent;
                        //console.log(highest[j] + "role: "+ role[j]+" name: "+name[j]);
                        break;
                    }

                }

            }

            bot.sendMessage(message, "`HIGHEST winrates for **"+champ+"`\n`** against: "+name[0] + " with %: "+ highest[0]+"`" +
                "\n`** against: "+name[1] + " with %: "+ highest[1]+"`\n`** against: "+name[2] + " with %: "+ highest[2]+"`");

            bot.sendMessage(message, "`LOWEST winrate for **"+champ+"`\n`** against: "+lowName[0]+" with %: "+lowest[0]+"`" +
                "\n`** against: "+lowName[1]+" with %: "+lowest[1]+"`\n`** against: "+lowName[2]+" with %: "+lowest[2]+"`");

        });


        console.log("Highest: "+highest);


    }


    if(input.indexOf("#build")>=0){
        console.log("#build command");
    }

    if (input.charAt(0) == '~' && input.indexOf("ingame")==1){
        var arr = input.split(" ");
        if(arr.length != 2){
            bot.sendMessage(message, "`Invalid format. Use: '~ ingame *SUMMONERNAME*`");
        }else{
            console.log("Finding sID for "+ arr[1]);
            bot.sendMessage(message, "!lol match na " + arr[1]);
        }
    }

    if(input.charAt(0)=='!') {
        if(input.indexOf("!lol")>-1){
            console.log("called gravebot");
        }else if(input.indexOf("!help")==0){
            console.log("called help command");
        }else if (input.length == 1) {
            bot.sendMessage(message, " enter a summoner name after the !");
        }else if (input.indexOf(" ") >= 0) {
            bot.sendMessage(message, "Invalid format. Make sure there aint no spaces in der");
        } else {
            console.log(input.substr(1));
            var name = input.substr(1);

            var URL = 'https://' + region + '.api.pvp.net/api/lol/' + region + '/v1.4/summoner/by-name/' + name + '?api_key=' + api_key;
            request(URL, function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    var json = JSON.parse(body);
                    console.log(json);
                    var sName = json[name]['name'];
                    sID = json[name]['id'];
                    bot.sendMessage(message, "Your summoner name is " + sName);
                    bot.sendMessage(message, "Your id is " + json[name]['id']);
                    bot.sendMessage(message, "Summoner level " + json[name]['summonerLevel']);
                } else {
                    console.log(err);
                    bot.reply(message, "Username does not exist.");
                }
            });

        }
    }


    if(input.indexOf("your id is")>-1){
        console.log("ID recognized by second if " + input.indexOf("is")+"  substr: " + input.substr(input.indexOf("is")+3));

        var sID = input.substr(input.indexOf("is")+3);
        console.log("sID is: "+sID);

        var URL = 'https://'+region+'.api.pvp.net/api/lol/'+region+'/v1.3/stats/by-summoner/'+ sID +'/summary?' +
                'season=SEASON2016&api_key='+api_key;
        request(URL, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                var json = JSON.parse(body);
                console.log("For summoner name: ");         // add name later
                var arr = [0];
                var temp = 0;
                var mostPlayed;
                var mostWins;
                var totalWins = 0;

                for (var i = 0; i < json['playerStatSummaries'].length; i++) {
                    //console.log("Game mode: "+ json['playerStatSummaries'][i]['playerStatSummaryType'] + " wins: " +
                    //json['playerStatSummaries'][i]['wins']);
                    var wins = json['playerStatSummaries'][i]['wins'];
                    console.log("wins: "+ wins);
                    totalWins += wins;
                    console.log("total wins: "+totalWins);
                    var pop = arr.pop();
                    if (pop > json['playerStatSummaries'][i]['wins']) {
                        arr.push(pop);
                        //console.log("Most played game type is: "+ json['playerStatSummaries'][temp]['playerStatSummaryType']);
                    } else {
                        arr.push(json['playerStatSummaries'][i]['wins']);
                        //console.log("UPDATED MOST WINS! New monst played game type is: "+
                        //json['playerStatSummaries'][i]['playerStatSummaryType']);
                        temp = i;
                        //save most played and wins to show
                        mostPlayed = json['playerStatSummaries'][i]['playerStatSummaryType'];
                        mostWins = json['playerStatSummaries'][i]['wins'];
                        console.log("Most played: " + mostPlayed + "     mostWins: " + mostWins);
                    }
                }

                console.log("\nMost played game type is: " + mostPlayed + " with " + mostWins + " wins!!");

                //TIME SPENT
                var totalGames = totalWins * 2;
                console.log("Total games: " + totalGames);
                var totalTime = totalGames * 30;
                console.log("Total Time(in seconds): " + totalTime);
                var totalHours = totalTime / 60;
                console.log("Total hours: " + totalHours);
                var totalDays = totalHours / 24;
                console.log("Total Days: " + totalDays);
                bot.sendMessage(message, "most wins: " + mostWins + " in game type **" + mostPlayed + "**\nTotal wins: "+ totalWins);
                bot.sendMessage(message, "`Total time spent: "+ totalDays + " days or " + totalHours + " hours`");

            } else {
                console.log(err);
            }

        });
    }
});


bot.loginWithToken("Bot "+ discordTok);