exports.addEmojis = async function(input, message) {
    var guild = message.guild;
    var inputArr = input.split(" ");

    var url = inputArr[1];
    var name = inputArr[2];

    guild.createEmoji(url, name)
    .catch(err => {
        console.log("++++++++++++++++")
        console.log(url)
        console.log(name)
        console.log(err)
        console.log("++++++++++++++++")
    });
}