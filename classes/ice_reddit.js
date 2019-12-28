var { RichEmbed } = require("discord.js");
var request = require("request");
var snoowrap = require('snoowrap');
var fs = require('fs')


require('dotenv').config();


module.exports = {
    dataFromURL : function(url, message) {
        const r = new snoowrap({
            userAgent: 'reddit-post-on-discord',
            clientId: process.env.REDDIT_ID,
            clientSecret: process.env.REDDIT_SECRET,
            username: process.env.REDDIT_USER,
            password: process.env.REDDIT_PASSWORD
        });
    },

    redditCheck : function(clientfordiscord, intervalLength) {
        setInterval(function () {

            const r = new snoowrap({
                userAgent: 'reddit-post-on-discord',
                clientId: process.env.REDDIT_ID,
                clientSecret: process.env.REDDIT_SECRET,
                username: process.env.REDDIT_USER,
                password: process.env.REDDIT_PASSWORD
            });

            // Reddit check here
            var redditkeys = process.env.REDDIT_KEYWORDS
            console.log("redditkeys: " + redditkeys)
            var splitEqual = redditkeys.split("=")
            console.log(splitEqual)
            var splitComma = splitEqual[0].split(",")
            console.log(splitComma)
            
            r.getSubreddit(process.env.REDDIT_SUBREDDIT).getNew().then( posts => {
                var postsTitles = posts.map(post => post.title)
                var postsURL = posts.map(post => post.url)
                var postIDs = posts.map(post => post.id)
            
                var i = 0
                for(let title of postsTitles) {
                    var check = false;

                    title = title.toLowerCase();
                    var fs = require('fs');

                    fs.appendFileSync('redditPosts.txt', "", function (err) {
                        if (err) throw err;
                    });

                    var fileData = fs.readFileSync("redditPosts.txt").toString();
                    if(fileData.includes(postIDs[i])){
                        check = true;
                    }

                    if(check){
                        continue
                    }
                    
                    fs.appendFileSync('redditPosts.txt', postIDs[i]+"\n", function (err) {
                        if (err) throw err;
                    });

                    for (let keyWords of splitComma) {
                        if(keyWords == "") {
                            continue
                        }
                        
                        if (title.indexOf(keyWords)>= 0) {
                            //Message url here
                            clientfordiscord.channels.get("198297756295495681").send(postsURL[i])
                        }
                        
                        i++;
                    }
                }

            })
        }, intervalLength)
    }
}