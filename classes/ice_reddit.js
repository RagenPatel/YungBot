var { RichEmbed } = require("discord.js");
var request = require("request");
var snoowrap = require('snoowrap');


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

        url = url.substring(url.indexOf("comments/")+9)
        var id = url.substring(0, url.indexOf("/"))
        // console.log("newURL " + id)
        // var id = 
        // Extracting every comment on a thread
        r.getSubmission(id).fetch().then(data => {
            // data = JSON.stringify(data)
            var image = JSON.stringify(data['url']);
                image = image.replace(/['"]+/g, '')
                var title = JSON.stringify(data['title']);
                title = title.replace(/['"]+/g, '')
                // console.log(image)

            if(data['thumbnail'] != "nsfw") {
                if (data.hasOwnProperty('post_hint')){
                    if(data['post_hint'].includes("video")) {
                        const embed = new RichEmbed()
                            .setColor("#5f449e")
                            .setTitle(title)
                            .addField("Upvote Ratio", data['upvote_ratio']*100.0 + "%");
                            message.channel.send(embed);
                        message.channel.send(image);
                    }else {
                        const embed = new RichEmbed()
                        .setColor("#5f449e")
                        .setTitle(title)
                        .setImage(image)
                        .addField("Upvote Ratio", data['upvote_ratio']*100.0 + "%");
                        message.channel.send(embed);
                    }
                }
                 else {
                    const embed = new RichEmbed()
                        .setColor("#5f449e")
                        .setTitle(title)
                        .addField("Upvote Ratio", data['upvote_ratio']*100.0 + "%");
                        message.channel.send(embed);
                }
            }
        })
    }
}