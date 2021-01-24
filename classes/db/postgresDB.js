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

    // updateChampions : async function() {
    //     const { Client } = require('pg')
    //     const client = new Client()

    //     var URL = "http://ddragon.leagueoflegends.com/cdn/8.24.1/data/en_US/champion.json"
    //     await request(URL, async function(err, response, body) {
    //         if (!err && response.statusCode == 200) {
    //             var json = JSON.parse(body);
    //             await client.connect()
    //             for (var champInfo in json['data']){
    //                 var champData = JSON.stringify(json['data'][champInfo])

    //                 if(champData.includes("'")) {
    //                     champData = champData.replace(/'/g, "\\'")
    //                     console.log("CHECK HERE2: " + champData)
    //                 }


    //                 var sql_query = 'INSERT INTO champions("name", "data") SELECT \'' + champInfo +'\', \'' + champData + '\' WHERE NOT EXISTS (SELECT 1 FROM champions WHERE "name"=\''+ champInfo +'\');'
    //                 console.log(sql_query)
    //                 await client.query(sql_query)
    //                     .then(res => console.log(res.rows[0]))
    //                     .catch(e => console.error(e.stack))
    //             }
    //             await client.end();
    //         } else {
    //             console.log(err);
    //         }
    //     })
    // },
    
    // updateItems : async function() {
    //     const { Client } = require('pg')
    //     const client = new Client()

    //     var URL = "http://ddragon.leagueoflegends.com/cdn/8.24.1/data/en_US/item.json"
    //     await request(URL, async function(err, response, body) {
    //         if (!err && response.statusCode == 200) {
    //             var json = JSON.parse(body)
    //             await client.connect()
    //             for (var item in json['data']) {

    //                 var item_data = JSON.stringify(json['data'][item])
    //                 var sql_query = 'INSERT INTO items("name", "data") SELECT \'' + item +'\', \'' + item_data + '\' WHERE NOT EXISTS (SELECT 1 FROM items WHERE "name"=\''+ item +'\');'

    //                 // const query = {
    //                 //     text: 'INSERT INTO items(name, data) VALUES($1, $2)',
    //                 //     values: [item, JSON.stringify(json['data'][item])],
    //                 // }
    
    //                 await client.query(sql_query)
    //                     .then(res => console.log(res.rows[0]))
    //                     .catch(e => console.error(e.stack))
    //             }
    //         }
    //     })
    //     client.end();
    // },
    
    // createTable : async function() {
    //     const { Client } = require('pg')
    //     const client = new Client()

    //     await client.connect();
    
    //     await client.query('CREATE TABLE testing ( name text, data json );');
    
    //     client.end();
    
    //     console.log("Created table");
    // },
    
    // getChampData : async function(championName) {
    //     const { Client } = require('pg')
    //     const client = new Client()
        
    //     console.log("CHAMPION: " + championName)
    //     await client.connect();
    //     const result = await client.query({
    //         rowMode: 'array',
    //         text: "SELECT * FROM champions WHERE LOWER(name) = '"+championName+"'"
    //     })
    
    //     await client.end();
    
    //     return result.rows // [1, 2]
    // },

    // getChampByID : async function(champID) {
    //     const { Client } = require('pg')
    //     const client = new Client()

    //     var query = "SELECT \"name\", data -> 'key' FROM champions WHERE \"data\" ->> 'key' = '"+champID+"';"

        // await client.connect();
        // const result = await client.query({
        //     rowMode: 'array',
        //     text: query
        // })

        // await client.end()
        // console.log("PG: " + result.rows)
        // return result.rows
    // }
}
