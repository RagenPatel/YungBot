/**
 * This class is utilized to make various API calls to League API
 * In addition, to display League stats (i.e. matchup info), this
 * class utilizes the postgresDB class to query the database and
 * get relevant information regarding champion/item etc.
 */
var { RichEmbed } = require("discord.js");
var request = require("request");
var db = require('./db/postgresDB.js');
require('dotenv').config();
const { Kayn, REGIONS } = require('kayn')

var api_key = process.env.RIOT_API;
var champ_api = process.env.CHAMP_API;
const roles = {adc: "DUO_CARRY", support: "DUO_SUPPORT", top: "TOP", mid: "MIDDLE", jungle: "JUNGLE"}

const kayn = Kayn(api_key)()


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
                // console.log(json);
                return json;
            } else {
                console.log("CHAMPGG ERROR")
                console.log(err)
            }
        })

    },

    ingame : function(input, message, embed) {
    
        // Check if the GUI in the next space is in game. Username = after the ' '
        if(input.length > 7 && input.charAt(7) == ' ') {
            var checkName = input.substr(8);
            var name = checkName.trim();
    
            kayn.Summoner.by.name(name)
            .then(json => {
                var sName = json['name'];
                var sID = json['id'];
                var sLvl = json['summonerLevel'];

                kayn.CurrentGame.by.summonerID(sID)
                .then(json => {
                    if (json['gameid'] != "") {
                        var timeSec = json['gameLength'];
                        var timeMin = timeSec / 60 + 4;
                        if (isNaN(timeMin)) {
                            embed = embed
                            .setTitle("Error")
                            message.channel.send(embed);
                        } else {
                            var color = ""
                            if (time < 10) {
                                color = "#9eff49"
                            } else if (time < 25) {
                                color = "#e8be17"
                            } else {
                                color = "#af3221"
                            }

                            embed = embed
                            .setTitle("Game Time")
                            .setColor("#9eff49")
                            .addField("Name", sName)
                            .addField("Time (Mins)", timeMin)
                            message.channel.send(embed);
                        }
                    }
                })
                .catch(error => {
                    const embed = new RichEmbed()
                    .setColor("#f95762")
                    .setTitle("GUI not in game!");
                    message.channel.send(embed);
                })
            })
            .catch(error => {
                const embed = new RichEmbed()
                .setColor("#f95762")
                .setTitle("GUI not in game!");
                message.channel.send(embed);
            })
        } else {
    
            kayn.CurrentGame.by.summonerID(50628556)
            .then(json => {
                message.channel.send("TEST")
                if (json['gameid'] != "") {
                    var timeSec = json['gameLength'];
                    var timeMin = timeSec / 60 + 4;
                    if (isNaN(timeMin)) {
                        embed = embed
                        .setTitle("Test")
                        message.channel.send(embed);
                    } else {
                        embed = embed
                        .setTitle("Test")
                        .addField("Name", sName)
                        .addField("Time (Mins)", timeMin)
                        message.channel.send(embed);
                    }
                }
            })
            .catch(error => {
                const embed = new RichEmbed()
                .setColor("#f95762")
                .setTitle("GUI not in game!");
                message.channel.send(embed);
            })
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
        var champData = await module.exports.champGGMatchup(champDetails[0][1]['key'], role)
        console.log("Outside")
        console.log(champData)

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