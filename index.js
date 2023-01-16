const line = require('@line/bot-sdk')
const express = require('express')
const axios = require('axios').default
const dotenv = require('dotenv')

const env = dotenv.config().parsed
const app = express();

const lineconfig = {
    channelAccessToken: env.ACCESS_TOKEN,
    channelSecret: env.SECRET_TOKEN
}

const client = new line.Client(lineconfig);

// event handler
function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        // ignore non-text-message event
        return Promise.resolve(null);
    } else if (event.type === 'message') {
        var data = JSON.stringify({
            "model": "text-davinci-003",
            "prompt": event.message.text,
            "max_tokens": 150,
        });

        var config = {
            method: 'post',
            url: 'https://api.openai.com/v1/completions',
            headers: {
                'Authorization': 'Bearer ' + process.env.OPENAI_KEY,
                'Content-Type': 'application/json'
            },
            data: data
        };


        axios(config)
            .then(function (response) {
                let text = response.data.choices[0].text
                return client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: text
                });
            })
    }
}

app.post('/webhook', line.middleware(lineconfig), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
