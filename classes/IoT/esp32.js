var { Client, RichEmbed } = require("discord.js");
var request = require("request");

require('dotenv').config();

var espServer = process.env.ESP32_SERVER;

module.exports = {
    getCapture : async function(client) {
        request({
            url: espServer,
            encoding: null
        }, function(err, response, body) {
            client.channels.get("709941091511828522").send("", {files: [body]});
        })
    }
}