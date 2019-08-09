import * as functions from "firebase-functions";
import * as express from "express";
import * as line from "@line/bot-sdk";

"use strict";

const midllewareConfig: line.MiddlewareConfig = {
  channelSecret: functions.config().line.channel_secret,
  channelAccessToken: functions.config().line.channel_token
};
const clientConfig: line.ClientConfig = {
  channelSecret: functions.config().line.channel_secret,
  channelAccessToken: functions.config().line.channel_token
};

const app = express();

app.post("/webhook", line.middleware(midllewareConfig), (req, res) => {
  console.log(req.body.events);
  Promise.all(req.body.events.map(handleEvent))
    .then(result => res.json(result))
    .catch(e => {
      console.error(e);
    });
});

app.get("/", (req, res) => {
  res.send("ok");
});

const client = new line.Client(clientConfig);

async function handleEvent(event: line.MessageEvent | line.TextEventMessage) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  return client.replyMessage(event.replyToken, {
    type: "text",
    text: event.message.text //実際に返信の言葉を入れる箇所
  });
}

exports.app = functions.https.onRequest(app);
