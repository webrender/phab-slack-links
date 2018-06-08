// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var rp = require('request-promise')

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.use(bodyParser.json())

// http://expressjs.com/en/starter/basic-routing.html
app.post("/", function (request, response) {
  if (request.body.challenge) {
    response.json(request.body.challenge);
  } else {
    if (request.body &&
        request.body.event &&
        request.body.event.links) {
      var r = /([^/(Dd)]+$)/;
      var did = request.body.event.links[0].url.match(r)[0];
    }
    var options = {
      uri: `https://${process.env.PHAB_DOMAIN}/api/differential.query`,
      method: 'POST',
      qs: {
          "api.token": process.env.PHAB_TOKEN,
          "ids": [did]
      },
      json: true // Automatically stringifies the body to JSON
    };

    rp(options)
        .then(function (res) {
            console.log(res.result[0].title, res.result[0].uri);
            response.sendStatus(200);
            // if (request.body.event.channel === 'CB40W4D6Z') { //test channel
              var options2 = {
                uri: 'https://slack.com/api/chat.postMessage',
                method: 'POST',
                qs: {
                    "token": process.env.SLACK_TOKEN,
                    "channel": request.body.event.channel,
                    "text": `<${res.result[0].uri}|*D${did}*: ${res.result[0].title}>`,
                    "as_user": false,
                },
                json: true // Automatically stringifies the body to JSON
              };

              rp(options2)
                .then(function (res) {
                });
            // }
        })
        .catch(function (err) {
            // API call failed...
        });

  }
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
