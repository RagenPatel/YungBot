var request = require("request");
require('dotenv').config();

module.exports = {

    checkForEmote : async function(word, message) {
        console.log("pg: "+ word)
        const { Client } = require('pg')
        const client = new Client()

        var sql_query = 'SELECT * FROM emotes WHERE LOWER(name)=LOWER(\'' + word + '\')'
        await client.connect();
        await client.query({
            rowMode: 'array',
            text: sql_query
        })
        .then(r => {
            // console.log(r.rows)
            if (r.rows.length > 0) {
                console.log(r.rows)
                message.channel.send("", {files: [r.rows[0][2]]});
                return true;
            } else {
                return false;
            }
        })
        .catch(err => console.error())
        await client.end()
        return false

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
