var request = require("request");

modules.exports.getSummonerId = function (URL, input, region, api_key) {
  console.log("Getting summoner ID");
  var name = input.substr(1);

  var URL = 'https://' + region + '.api.pvp.net/api/lol/' + region + '/v1.4/summoner/by-name/' + name + '?api_key=' + api_key;
  request(URL, function (err, response, body) {
      if (!err && response.statusCode == 200) {
          var json = JSON.parse(body);
          console.log(json);
          var sName = json[name]['name'];
          sID = json[name]['id'];
          var answer = "Your summoner name is " + sName + "\n" +
            "Your id is " + json[name]['id'] + "\n" +
            "Summoner level " + json[name]['summonerLevel'];
            return answer;
      } else {
          console.log(err);
          var answer = "Error";
          return answer;
      }
  });

}
