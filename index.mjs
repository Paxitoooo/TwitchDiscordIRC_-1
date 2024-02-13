import fs from 'fs'
import path from 'path'
import Database from './MySQL/Database.js'
import { fileURLToPath } from 'url'
import { StaticAuthProvider } from '@twurple/auth'
import { Bot } from '@twurple/easy-bot'
import * as tmi from 'tmi.js'
import * as eris from 'eris'
import * as dotenv from 'dotenv'
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const defaultJsonPath = path.join(__dirname, 'config', 'default.json')
const readFile = async (file) => {
  const rawData = await fs.promises.readFile(file, 'utf-8')
  return JSON.parse(rawData)
};

const config = await readFile(defaultJsonPath)

// twurple
const clientId = (process.env.CLIENT_ID)
const accessToken = (process.env.ACCESS_TOKEN)
const authProvider = new StaticAuthProvider(clientId, accessToken)


const twur = new Bot({
	authProvider,
	channels: ['AnthonyZ', 'Broxah', 'Ssaab', 'xQc', 'aikobliss', 'uhSnow', 'Drututt', 'Crystalst', 
  'ripoozi', 'Posty', 'pokelawls', 'Kyedae', 's0mcs', 'Jankos', '4HEAD', 'kiittwy', 'RATIRL', 'evelone2004'
  , 'skain', 'BanduraCartel'],
})

const bot = new eris.Client(process.env.DISCORD_TOKEN);
bot.connect()

const client = new tmi.Client(config);
client.connect()


var ChannelFollow = '1204856415391326258'
var ChannelMessages = '1205995714493284432'
var ChannelSubs = '1205995735905083462'
var ChannelModActions = '1205996069322891354'


// Startup log.
  bot.on('ready', () => {
    console.log("Discord 🟢")
  });
  client.on("connected", () => {
    console.log("Twitch 🟢")
})

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
}

const db = new Database(dbConfig);
db.connect()

// Sub Event
twur.onSub(({ broadcasterName, userDisplayName, months }) => {
  db.saveSubscription(broadcasterName, userDisplayName, months, (err, results) => {
    if (err) {
      console.error('Error saving subscription:', err);
      return;
    }
    console.log('Subscription saved successfully:', results);

    // After saving the subscription, send a message
    bot.createMessage(ChannelSubs, {
      embed: {
        author: {
          name: `Sub Event`,
          url: "", // Twitch Broadcaster Channel
          icon_url: ""
        },
        title: `${broadcasterName}`,
        color: 15698175,
        fields: [
          {
            name: `Viewer: ${userDisplayName}`,
            value: `${months}`,
            inline: true
          }
        ],
        footer: {
          "text": "S-Talk",
          "icon_url": "https://i.imgur.com/bahg37j.png"
        }
      }
    });
  });
});

// Re-Sub Event
twur.onResub(({ broadcasterName, userDisplayName, months }) => {
  db.saveSubscription(broadcasterName, userDisplayName, months, (err, results) => {
    if (err) {
      console.error('Error saving subscription:', err);
      return;
    }
    console.log('Subscription saved successfully:', results);

    // After saving the subscription, send a message
    bot.createMessage(ChannelSubs, {
      embed: {
        author: {
          name: `Sub Event`,
          url: "", // Twitch Broadcaster Channel
          icon_url: ""
        },
        title: `${broadcasterName}`,
        color: 15698175,
        fields: [
          {
            name: `Viewer: ${userDisplayName}`,
            value: `${months}`,
            inline: true
          }
        ],
        footer: {
          "text": "S-Talk",
          "icon_url": "https://i.imgur.com/bahg37j.png"
        }
      }
    });
  });
});

twur.onSubGift(({ broadcasterName, userDisplayName, months }) => {
  db.saveSubscription(broadcasterName, userDisplayName, months, (err, results) => {
    if (err) {
      console.error('Error saving subscription:', err);
      return;
    }
    console.log('Subscription saved successfully:', results);

    // After saving the subscription, send a message
    bot.createMessage(ChannelSubs, {
      embed: {
        author: {
          name: `Sub Event`,
          url: "", // Twitch Broadcaster Channel
          icon_url: ""
        },
        title: `${broadcasterName}`,
        color: 15698175,
        fields: [
          {
            name: `Viewer: ${userDisplayName}`,
            value: `${months}`,
            inline: true
          }
        ],
        footer: {
          "text": "S-Talk",
          "icon_url": "https://i.imgur.com/bahg37j.png"
        }
      }
    });
  });
});

// Moderator Timeout Action
twur.onTimeout(({ broadcasterName, userName, duration, }) => {
  (bot.createMessage(ChannelModActions, {embed: {
    author: {
      name: `Moderator Timeout Action`,
      url: "", // Twitch Broadcaster Channel
      icon_url: "" // Twitch Moderator Image Profle
    },
    title: `${broadcasterName}`,
    color: 15698175,
    fields: [
      {
        name: `Viewer : ${userName}`,
        value: `${duration} Seconds Timeout`,
        inline: true
      }
    ],
    footer: {
      "text": "S-Talk",
      "icon_url": "https://i.imgur.com/bahg37j.png"
    }
  }}))
  console.log(`${duration} seconds timeout for ${userName}`)
})

twur.onBan(({ broadcasterName, userName, reason }) => {
  (bot.createMessage(ChannelModActions, {embed: {
    author: {
      name: `Moderator Ban Action`,
      url: "", // Twitch Broadcaster Channel
      icon_url: "" // Twitch Moderator Image Profle
    },
    title: `${broadcasterName}`,
    color: 15698175,
    fields: [
      {
        name: `Viewer : ${userName}`,
        value: `${reason}`,
        inline: true
      }
    ],
    footer: {
      "text": "S-Talk",
      "icon_url": "https://i.imgur.com/bahg37j.png"
    }
  }}))
  console.log(`Viewer: ${userName} got banned for ${reason}`);
})