import fs from "fs"
import path from "path"
import Database from "./MySQL/Database.js"
import { fileURLToPath } from "url"
import { StaticAuthProvider } from "@twurple/auth"
import { Bot } from "@twurple/easy-bot"
import * as tmi from "tmi.js"
import * as eris from "eris"
import * as dotenv from "dotenv"
dotenv.config();

////////////////////////////////

import * as Sentry from "@sentry/node"
import { ProfilingIntegration } from "@sentry/profiling-node"
import express from "express";

const app = express()

Sentry.init({
  dsn: "https://71fb760f959e4a02fa630b10d0255626@o4506773084045312.ingest.sentry.io/4506773086404608",
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
    new ProfilingIntegration(),
  ],
  tracesSampleRate: 1.0, 
  profilesSampleRate: 1.0,
});


app.use(Sentry.Handlers.requestHandler())
app.use(Sentry.Handlers.tracingHandler())
app.get("/", function rootHandler(req, res) {
  res.end()
});

app.use(Sentry.Handlers.errorHandler());

app.use(function onError(err, req, res, next) {
  res.statusCode = 500;
  res.end(res.sentry + "\n")
});

app.listen(3000)

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!")
})

////////////////////////////////


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultJsonPath = path.join(__dirname, "config", "default.json");
const readFile = async (file) => {
  const rawData = await fs.promises.readFile(file, "utf-8");
  return JSON.parse(rawData);
};

const config = await readFile(defaultJsonPath);

// twurple
const clientId = process.env.CLIENT_ID;
const accessToken = process.env.ACCESS_TOKEN;
const authProvider = new StaticAuthProvider(clientId, accessToken);

const twur = new Bot({
  authProvider,
  channels: ["Broxah", "Posty", "trausi", "Crystalst", "uhSnow"],
});

twur.onConnect(() => {
  console.log("Bot is listening in the following channels:", twur.channels);
});


const bot = new eris.Client(process.env.DISCORD_TOKEN);
const client = new tmi.Client(config);

bot.connect();
client.connect();

var ChannelFollow = "1204856415391326258";
var ChannelMessages = "1205995714493284432";
var ChannelSubs = "1205995735905083462";
var ChannelModActions = "1205996069322891354";
let subscriptionCount = 0;

// Startup log.
bot.on("ready", () => {
  console.log("Discord 🟢");
});
client.on("connected", () => {
  console.log("Twitch 🟢");
});

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

const db = new Database(dbConfig);
db.connect();

// Sub Event
  twur.onSub(({ broadcasterName, userDisplayName, months }) => {
    subscriptionCount++
    db.saveSubscription(
      broadcasterName,
      userDisplayName,
      months,
      (err) => {
        if (err) {
          console.error("Error saving subscription:", err);
          return;
        }
        bot.createMessage(ChannelSubs, {
          embed: {
            author: {
              name: `Sub Event`,
              url: "", // Twitch Broadcaster Channel
              icon_url: "",
            },
            title: `${broadcasterName}`,
            color: 15698175,
            fields: [
              {
                name: `Viewer: ${userDisplayName}`,
                value: `${months}`,
                inline: true,
              },
            ],
            footer: {
              text: "S-Talk",
              icon_url: "https://i.imgur.com/bahg37j.png",
            },
          },
        });
      }
    );
  });

// Re-Sub Event
  twur.onResub(({ broadcasterName, userDisplayName, months }) => {
    subscriptionCount++
    db.saveSubscription(
      broadcasterName,
      userDisplayName,
      months,
      (err, results) => {
        if (err) {
          console.error("Error saving subscription:", err);
          return;
        }
        bot.createMessage(ChannelSubs, {
          embed: {
            author: {
              name: `Sub Event`,
              url: "", // Twitch Broadcaster Channel
              icon_url: "",
            },
            title: `${broadcasterName}`,
            color: 15698175,
            fields: [
              {
                name: `Viewer: ${userDisplayName}`,
                value: `${months}`,
                inline: true,
              },
            ],
            footer: {
              text: "S-Talk",
              icon_url: "https://i.imgur.com/bahg37j.png",
            },
          },
        });
      }
    );
  });

  twur.onSubGift(({ broadcasterName, userDisplayName, months }) => {
    subscriptionCount++
    db.saveSubscription(
      broadcasterName,
      userDisplayName,
      months,
      (err) => {
        if (err) {
          console.error("Error saving subscription:", err);
          return;
        }
        bot.createMessage(ChannelSubs, {
          embed: {
            author: {
              name: `Sub Event`,
              url: "", // Twitch Broadcaster Channel
              icon_url: "",
            },
            title: `${broadcasterName}`,
            color: 15698175,
            fields: [
              {
                name: `Viewer: ${userDisplayName}`,
                value: `${months}`,
                inline: true,
              },
            ],
            footer: {
              text: "S-Talk",
              icon_url: "https://i.imgur.com/bahg37j.png",
            },
          },
        });
      }
    );
  });

  // Moderator Timeout Action
  twur.onTimeout(({ broadcasterName, userName, duration }) => {
    bot.createMessage(ChannelModActions, {
      embed: {
        author: {
          name: `Moderator Timeout Action`,
          url: "", // Twitch Broadcaster Channel
          icon_url: "", // Twitch Moderator Image Profle
        },
        title: `${broadcasterName}`,
        color: 15698175,
        fields: [
          {
            name: `Viewer : ${userName}`,
            value: `${duration} Seconds Timeout`,
            inline: true,
          },
        ],
        footer: {
          text: "S-Talk",
          icon_url: "https://i.imgur.com/bahg37j.png",
        },
      },
    });
  });

  twur.onBan(({ broadcasterName, userName, reason }) => {
    bot.createMessage(ChannelModActions, {
      embed: {
        author: {
          name: `Moderator Ban Action`,
          url: "", // Twitch Broadcaster Channel
          icon_url: "", // Twitch Moderator Image Profle
        },
        title: `${broadcasterName}`,
        color: 15698175,
        fields: [
          {
            name: `Viewer : ${userName}`,
            value: `${reason}`,
            inline: true,
          },
        ],
        footer: {
          text: "S-Talk",
          icon_url: "https://i.imgur.com/bahg37j.png",
        },
      },
  });
})


bot.on("messageCreate", async (msg) => {
  // Check if the message content starts with "^user"
  if (msg.content.startsWith("^user")) {
    try {
      // Extract the username from the command
      const commandParts = msg.content.split(" ");
      const username = commandParts[1]; // Assuming the username is the second part of the command

      // Query the database to get the latest subscription information for the specified user
      db.getLatestSubscriptionByUser(username, (error, latestSubscription) => {
        if (error) {
          console.error("Error fetching subscription data:", error);
          bot.createMessage(msg.channel.id, "An error occurred while fetching subscription data.");
          return;
        }

        // If there is no subscription data, inform the user
        if (!latestSubscription) {
          bot.createMessage(msg.channel.id, `No subscription data found for user ${username}.`);
          return;
        }

        // Extract userDisplayName, months, timestamp, and broadcasterName from the latest subscription
        const { userDisplayName, months, timestamp, broadcasterName } = latestSubscription;

        // Construct the response message in a similar format as the example provided
        const response = {
          embed: {
            author: {
              name: "Latest Subscription",
              url: "", // Twitch Broadcaster Channel
              icon_url: "", // Twitch Moderator Image Profile
            },
            title: `${username}`,
            color: 15698175,
            fields: [
              {
                name: "Broadcaster Name",
                value: `${broadcasterName}`,
                inline: true,
              },
              {
                name: "User Display Name",
                value: `${userDisplayName}`,
                inline: true,
              },
              {
                name: "Months",
                value: `${months}`,
                inline: true,
              },
              {
                name: "Timestamp",
                value: `${timestamp}`,
                inline: true,
              },
            ],
            footer: {
              text: "S-Talk",
              icon_url: "https://i.imgur.com/bahg37j.png",
            },
          },
        };

        // Send the response message
        bot.createMessage(msg.channel.id, response);
      });
    } catch (error) {
      console.error("Error fetching subscription data:", error);
      bot.createMessage(msg.channel.id, "An error occurred while fetching subscription data.");
    }
  }
});
