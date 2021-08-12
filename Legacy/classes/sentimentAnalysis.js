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
    

    if (message.author.id != '197948432961241089' && outlook['score'] > 1) {
        message.react('❓')
        .catch(console.error);
        message.react('👎')
        .catch(console.error);
    } else if (outlook['score'] < -1) {
        message.react('😂')
        .catch(console.error);

        message.react('👌')
        .catch(console.error);
    }

    
}