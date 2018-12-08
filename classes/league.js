/**
 * This class is utilized to make various API calls to League API
 * In addition, to display League stats (i.e. matchup info), this
 * class utilizes the postgresDB class to query the database and
 * get relevant information regarding champion/item etc.
 */
var request = require("request");
var db = require('./db/postgresDB.js');
require('dotenv').config();

var api_key = process.env.RIOT_API;
var champ_api = process.env.CHAMP_API;
const roles = {adc: "DUO_CARRY", support: "DUO_SUPPORT", top: "TOP", mid: "MIDDLE", jungle: "JUNGLE"}


 module.exports = {
    champGGMatchup : function(championID, role) {

        var URL = "http://api.champion.gg/v2/champions/"+championID+"/"+role+"/matchups?limit=500&api_key="+champ_api;
        request(URL, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                var json = JSON.parse(body);

                json.sort(function (a, b) {
                    if (a.count < b.count) {
                        return 1;
                    }
                    else if (a.count > b.count) {
                        return -1;
                    }
                    return 0;
                });
                console.log("champGGMatchup: " + json);
                return json;
            } else {
                console.log("CHAMPGG ERROR")
                console.log(err)
            }
        })

    },

    ingame : function(input, message) {
    
        // Check if the GUI in the next space is in game. Username = after the ' '
        if(input.length > 7 && input.charAt(7) == ' ') {
            var checkName = input.substr(8);
            var name = checkName.trim();
    
            var URL = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/' + name + '?api_key=' + api_key;
             request(URL, function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    var json =  JSON.parse(body);
                    var sName = json['name'];
                    var sID = json['id'];
                    var sLvl = json['summonerLevel'];
                    console.log("NAME: " + sName);
    
                    var URL = "https://na1.api.riotgames.com/lol/spectator/v3/active-games/by-summoner/" + sID + "?api_key=" + api_key;
                    request(URL, function (err, response, body) {
                        var json = JSON.parse(body);
                        if (json['gameid'] != "") {
                            var timeSec = json['gameLength'];
                            var timeMin = timeSec / 60 + 4;
                            if (isNaN(timeMin)) {
                                message.channel.send(sName + " is not in game.");
                            } else {
                                message.channel.send(sName + " has been in game for " + timeMin + " minutes.");
                            }
                        }
                    });
                } else {
                    console.log(err);
                    console.log(response.statusCode)
                    message.channel.send("Error retreiving data");
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
    },

    getChampionInformation : async function(input, message) {

    },

    getMatchup : async function(input, message) {
        var role = roles['mid']
        if (input.includes(" adc")) {
            role = roles['adc']
            input = input.replace(" adc", "")
        } else if (input.includes(" mid")) {
            role = roles['mid']
            input = input.replace(" mid", "")
        } else if (input.includes(" support")) {
            role = roles['support']
            input = input.replace(" support", "")
        } else if (input.includes(" jungle")) {
            role = roles['jungle']
            input = input.replace(" jungle", "")
        } else if (input.includes(" top")) {
            role = roles['top']
            input = input.replace(" top", "")
        }

        const champion = input.substr(9);
        const champDetails = await db.getChampData(champion)
            .catch(e => console.error(e));
    
        console.log("LEAGUE.JS: ~~~~~~~~~~~~~~~ \n " + champDetails[0][1]['key'])
        champData = await module.exports.champGGMatchup(champDetails[0][1]['key'], role)
        // console.log(champData)

        for (var champ in champData) {
            console.log("for loop")
            if (champ['_id']['role'] == "DUO_CARRY") {
                console.log(db.getChampByID(champ['_id']['champ1_id']))
                console.log(db.getChampByID(champ['_id']['champ2_id']))
                console.log("---------------")
            }
        }
    }
 }