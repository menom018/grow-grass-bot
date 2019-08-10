"use strict";
import * as functions from "firebase-functions";
import * as express from "express";
import * as line from "@line/bot-sdk";
import { gitCommitPush } from "./github";

const midllewareConfig: line.MiddlewareConfig = {
  channelSecret: functions.config().line.channel_secret,
  channelAccessToken: functions.config().line.channel_token
};
const clientConfig: line.ClientConfig = {
  channelSecret: functions.config().line.channel_secret,
  channelAccessToken: functions.config().line.channel_token
};

const client = new line.Client(clientConfig);
const app = express();

app.post("/webhook", line.middleware(midllewareConfig), (req, res) => {
  console.log(req.body.events);
  res.send("receive event");
  Promise.all(req.body.events.map(handleEvent)).catch(e => {
    console.error(e);
  });
});

app.get("/", (req, res) => {
  res.send("ok");
});

async function handleEvent(event: line.MessageEvent) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  if (event.message.text.includes("草生やす")) {
    // git hub に草生やす
    await client.replyMessage(event.replyToken, {
      type: "text",
      text: `草はやしたるわｗｗ`
    });
    const message = await growGrassToGithub();
    return client.pushMessage(event.source.userId!, {
      type: "text",
      text: message
    });
  } else {
    return client.replyMessage(event.replyToken, [
      {
        type: "text",
        text: "よくわかんねぇからオウム返しとくわｗｗ"
      },
      {
        type: "text",
        text: event.message.text + "www"
      }
    ]);
  }
}

async function growGrassToGithub(): Promise<string> {
  try {
    await gitCommitPush({
      token: functions.config().github.api_token,
      owner: "menom018",
      repo: "growgrass",
      file: {
        path: "GrowGlass.md",
        content: `草生やしたったwww ${new Date().toLocaleString()}`
      },
      branch: "master",
      commitMessage: "grow grass for bot"
    });
    console.log("success grow glass");
    return `草生やしたったwww`;
  } catch (error) {
    console.error(error);
    return `草生やすの失敗したったwww`;
  }
}
exports.app = functions.https.onRequest(app);
