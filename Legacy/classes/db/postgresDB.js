var request = require("request");
var { Client, RichEmbed } = require("discord.js");
require('dotenv').config();

var successColor = "#6EC54B"
var deleteColor = "#F14C52"

module.exports = {
    checkForEmote : async function(word, message) {
        console.log("pg1: " + word)
        const { Client } = require('pg')
        const client = new Client()

        var sql_query = 'SELECT * FROM emotes WHERE LOWER(name)=LOWER(\'' + word + '\')'
        await client.connect();
        await client.query({
            rowMode: 'array',
            text: sql_query
        })
        .then(r => {
            console.log(">>>> DB Queries")
            console.log(">>>> rows: " + r.rows)
            if (r.rows.length > 0) {
                console.log(r.rows)
                // message.channel.send("", {files: [r.rows[0][2]]});
                if (r.rows[0][2].indexOf(".png") >= 0 || r.rows[0][2].indexOf(".PNG") >= 0) {
                    message.channel.send("", {files: [r.rows[0][2]]});
                } else {
                    message.channel.send({files: [{
                        attachment: r.rows[0][2],
                        name: r.rows[0][1]+'.gif'
                    }]})
                }

                // Update DB here. Increase usage by 1
                update_query = 'Update emotes Set usage = usage + 1 WHERE LOWER(name)=LOWER(\'' + word + '\');'
                console.log("query: " + update_query);
                client.query(update_query, (err, result) => {
                    if (err) {
                        console.log("ERROR OR RES: " + err.message);
                    } else {
                        console.log(result);
                    }
                })
                return true;
            } else {
                return false;
            }
        })
        .catch(err => console.error())
        await client.end()
        return false

    },

    getTop10UsedEmotes: async function(message) {
        const { Client } = require('pg')
        const client = new Client()

        query_str = "SELECT name, usage FROM emotes ORDER BY usage DESC LIMIT 10"
        await client.connect();

        await client
            .query({
                rowMode: 'array',
                text: query_str
            })
            .then(res => {
                console.log(res.rows);
                const embed = new RichEmbed()
                .setTitle('Emote Usage Stats')
                .setColor("#45bf18")

                const rows = res.rows;

                for (var i = 0; i < rows.length; i++) {
                    embed.addField(rows[i][0], "Used: " + rows[i][1]);
                }
                
            message.channel.send(embed);   
            })
            .catch(e => console.error(e.stack));

        await client.end();

    },
    
    executeCustomQuery : async function(queryString, message) {
        const { Client } = require('pg')
        const client = new Client()

        // var sql_query = 'SELECT * FROM emotes WHERE LOWER(name)=LOWER(\'' + word + '\')'
        await client.connect();
        await client.query({
            rowMode: 'array',
            text: queryString
        })
        .then(() => {
            // console.log(r.rows)
            message.channel.send("Success!");
        })
        .catch(err => {
            message.channel.send(console.error())
        })
        await client.end()
        return false
    },

    deleteEmote : async function(emote, message) {

        const { Client } = require('pg')
        const client = new Client()

        var sql_query = 'DELETE FROM emotes WHERE LOWER(name)=LOWER(\'' + emote + '\')'

        await client.connect();
        await client.query({
            rowMode: 'array',
            text: sql_query
        })
        .then(() => {
            // console.log(r.rows)
            const embed = new RichEmbed()
            .setTitle("Success!")
            .addField(emote, "Removed " + emote + " from database.")
            .setColor(successColor)
            message.channel.send(embed); 
        })
        .catch(err => {
            const embed = new RichEmbed()
            .setTitle("ERROR!")
            setField(console.error())
            .setColor(deleteColor)
            message.channel.send(embed);
        })
        await client.end()
        return false

    },

    addEmoteToDB : async function(word, url, message) {
        const { Client } = require('pg')
        const client = new Client()

        var sql_query = 'INSERT into emotes (id, name, url, usage) VALUES (12, \'' + word + '\', \'' + url + '\', 0)'
        // var sql_query = 'SELECT * FROM emotes WHERE LOWER(name)=LOWER(\'' + word + '\')'
        await client.connect();
        await client.query({
            rowMode: 'array',
            text: sql_query
        })
        .then(() => {
            // console.log(r.rows)
            const embed = new RichEmbed()
            .setTitle("Success!")
            .addField(word, "Added to DB")
            .setColor(successColor)
            message.channel.send(embed); 
        })
        .catch(err => {
            const embed = new RichEmbed()
            .setTitle("ERROR!")
            setField(console.error())
            .setColor(deleteColor)
            message.channel.send(embed);
        })
        await client.end()
    }
}
