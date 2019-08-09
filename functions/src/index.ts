"use strict";
import * as functions from "firebase-functions";
import * as express from "express";
import * as line from "@line/bot-sdk";

process.env.GITHUB_API_TOKEN = functions.config().github.api_token;
import { gitCommitPush } from "./github";
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
  res.send("receive event");
  Promise.all(req.body.events.map(handleEvent)).catch(e => {
    console.error(e);
  });
});

app.get("/", (req, res) => {
  res.send("ok");
});

const client = new line.Client(clientConfig);
async function handleEvent(event: line.MessageEvent) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  if (event.message.text.includes("草生やす")) {
    // git hub に草生やす
    return client.replyMessage(event.replyToken, [
      {
        type: "text",
        text: await growGrassToGithub()
      }
    ]);
  } else {
    return client.replyMessage(event.replyToken, [
      {
        type: "text",
        text: "よくわかんねぇからオウム返しとくわｗｗ"
      },
      {
        type: "text",
        text: event.message.text + "www" //実際に返信の言葉を入れる箇所
      }
    ]);
  }
}

async function growGrassToGithub(): Promise<string> {
  try {
    await gitCommitPush({
      owner: "menom018",
      repo: "til",
      // commit files
      files: [
        {
          path: "GrowGlass.md",
          content: `草生やしたったwww ${new Date().toLocaleString()}`
        }
      ],
      fullyQualifiedRef: "heads/master",
      commitMessage: "grow grass for bot"
    });
    console.log("success grow glass", res);
    return `草生やしたったwww`;
  } catch (error) {
    console.error(error);
    return `草生やすの失敗したったwww`;
  }
}
exports.app = functions.https.onRequest(app);
