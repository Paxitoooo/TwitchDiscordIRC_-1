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
  channels: ["mg13gr", "gn_gortz1la"],
});


const bot = new eris.Client(process.env.DISCORD_TOKEN);
const ctmi = new tmi.Client(config);

bot.connect();
ctmi.connect();

var ChannelFollow = "1204856415391326258";
var ChannelMessages = "1205995714493284432";
var ChannelSubs = "1205995735905083462";
var ChannelModActions = "1205996069322891354";
let subscriptionCount = 0;

// Startup log.
bot.on("ready", () => {
  console.log("Discord 🟢");
});
ctmi.on("connected", () => {
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
  if (msg.content.startsWith("^user")) {
    try {
      const commandParts = msg.content.split(" ");
      const username = commandParts[1];

      db.getLatestSubscriptionByUser(username, (error, latestSubscription) => {
        if (error) {
          console.error("Error fetching subscription data:", error);
          bot.createMessage(msg.channel.id, "An error occurred while fetching subscription data.");
          return;
        }
        if (!latestSubscription) {
          bot.createMessage(msg.channel.id, `No subscription data found for user ${username}.`);
          return;
        }
        const { userDisplayName, months, timestamp, broadcasterName } = latestSubscription;
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

        bot.createMessage(msg.channel.id, response);
      });
    } catch (error) {
      console.error("Error fetching subscription data:", error);
      bot.createMessage(msg.channel.id, "An error occurred while fetching subscription data.");
    }
  }
});

bot.on("messageCreate", async (msg) => {
  if (msg.content.startsWith("^subscribers")) {
    try {
      db.countSubscribers((error, subscriberCount) => {
        if (error) {
          console.error("Error fetching subscriber count:", error);
          bot.createMessage(msg.channel.id, "An error occurred while fetching subscriber count.");
          return;
        }
        const response = `The number of subscribers to the broadcaster is: ${subscriberCount}`;
        bot.createMessage(msg.channel.id, response);
      });
    } catch (error) {
      console.error("Error fetching subscriber count:", error);
      bot.createMessage(msg.channel.id, "An error occurred while fetching subscriber count.");
    }
  }
});

bot.on("messageCreate", async (msg) => {
  if (msg.content.startsWith("^subscriberlist")) {
    try {
      db.getSubscribers((error, subscribers) => {
        if (error) {
          console.error("Error fetching subscriber list:", error);
          bot.createMessage(msg.channel.id, "An error occurred while fetching subscriber list.");
          return;
        }
        
        const embed = {
          embed: {
            title: "List of Subscribers",
            color: 0x00ff00, // Green color
            description: "Here is the list of subscribers:",
            fields: subscribers.map((subscriber, index) => ({
              name: `${index + 1}.`,
              value: subscriber.userDisplayName,
              inline: true
            }))
          }
        };
        bot.createMessage(msg.channel.id, embed);
      });
    } catch (error) {
      console.error("Error fetching subscriber list:", error);
      bot.createMessage(msg.channel.id, "An error occurred while fetching subscriber list.");
    }
  }
});