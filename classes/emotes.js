exports.checkForEmotes = function(input) {
    console.log("emotes.js file with input: " + input);
    var fs = require('fs')
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
            return 'D';
        }

        if (inputArr[word] == ':tf:') {
            return 'tf';
        }

        if (inputArr[word] == 'd') {
            return false
        }

        if (inputArr[word] == 'tf') {
            return false
        }

        if (fs.existsSync('./emotesImages/'+inputArr[word]+'.png')) {
            return inputArr[word]
        }

        // if (arr.indexOf(inputArr[word]) > -1) {
        //     return inputArr[word];
        // }
    }

    return false

    // if(arr.indexOf(input) > -1) {
    //     return true;
    // } else {
    //     return false;
    // }
}
