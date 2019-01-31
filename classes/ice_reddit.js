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
            if(data['thumbnail'] != "nsfw") {
                var image = JSON.stringify(data['url']);
                image = image.replace(/['"]+/g, '')
                var title = JSON.stringify(data['title']);
                title = title.replace(/['"]+/g, '')
                console.log(image)

                const embed = new RichEmbed()
                    .setColor("#5f449e")
                    .setTitle(title)
                    .setImage(image);
                    message.channel.send(embed);
            }
        })
    }
}