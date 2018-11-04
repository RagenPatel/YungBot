exports.sentiment = async function(input, message) {
    var Sentiment = require('sentiment');
    var sentiment = new Sentiment();

    var options = {
        extras: {
            'pogchamp': 1,
            'pog': 2,
            'poggers': 3,
            'lul': -2,
            'omegalul': -3,
            'elegiggle': -2,
            '4head': -1,
            'trash': -1
        }
    }


    var outlook = sentiment.analyze(input, options);
    console.log(outlook);
    

    if (outlook['score'] > 1) {
        // Delete a message
        message.delete()
        .catch(console.error);
        
        message.channel.send("? 8)");
    } else if (outlook['score'] < -1) {
        message.react('😂')
        .catch(console.error);

        message.react('👌')
        .catch(console.error);
    }

    
}