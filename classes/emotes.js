exports.checkForEmotes = async function(input, message) {
    console.log("emotes.js file with input: " + input);
    var fs = require('fs')
    var db = require('./db/postgresDB.js');
    // var arr = ['4head', 'anele', 'babyrage', 'biblethump', 'bigbrother', 'brokeback',
    //             'cmonbruh', 'dansgame', 'datsheffy', 'failfish', 'fungineer', 'jebaited',
    //             'kappa', 'kappaclaus', 'kappaross', 'keepo', 'kreygasm', 'minglee', 'notlikethis',
    //             'opieop', 'pogchamp', 'residentsleeper', 'seemsgood', 'swiftrage', 'trihard', 'wutface', 'lul',
    //             'hahaa', 'kkona', 'feelsbirthdayman', 'feelsbadman', 'feelsgoodman', 'feelsamazingman', 'd:', ':tf:',
    //             'poggers', 'elegiggle', 'omegalul', 'hypers', 'ez', 'monkamega', 'monkathink', 'monkah', 'pepehands'];

    var inputArr = input.split(" ");
    // if(input == 'd:') {
    //     return 'D';
    // }

    // if(input == ':tf:') {
    //     return 'tf';
    // }

    for (var word in inputArr) {

        if (inputArr[word] == 'd:') {
            message.channel.send({files: ['./emotesImages/D.png']});
            // return ('D', false);
        } else if (inputArr[word] == ':tf:') {
            message.channel.send({files: ['./emotesImages/tf.png']});
            // return ('tf', false);
        } else if (fs.existsSync('./emotesImages/'+inputArr[word]+'.png')) {
            message.channel.send({files: ['./emotesImages/' + inputArr[word] + '.png']});
            // return (inputArr[word], false)
        } else {
            db.checkForEmote(inputArr[word], message);
        }

    }

    // return (false, false)

    // if(arr.indexOf(input) > -1) {
    //     return true;
    // } else {
    //     return false;
    // }
}
