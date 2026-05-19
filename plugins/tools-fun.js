const axios = require("axios");
const fetch = require("node-fetch");
const { sleep } = require('../lib/functions');
const { cmd, commands } = require("../command");
const config = require("../config");

// Formatted message function
async function sendFormattedMessage(conn, from, text, sender, userName, externalBody = '', bodyText = '') {
    try {
        await conn.sendMessage(from, {
            text: text,
            contextInfo: {
                isForwarded: true,
                title: "ɴᴊᴀʙᴜʟᴏ ᴜɪ",
                body: bodyText || text,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: config.NEWSLETTER,
                    newsletterName: '╭••➤ɴᴊᴀʙᴜʟᴏ ᴜɪ',
                    serverMessageId: 143
                },
                forwardingScore: 999,
                externalAdReply: {
                    title: "ɴᴊᴀʙᴜʟᴏ ᴜɪ",
                    body: externalBody || "Fun Commands",
                    thumbnailUrl: config.FANAIMG,
                    sourceUrl: config.NJABULOURL,
                    mediaType: 1,
                    renderSmallThumbnail: true
                }
            }
        }, { 
            quoted: {
                key: {
                    fromMe: false,
                    participant: `0@s.whatsapp.net`,
                    remoteJid: "status@broadcast"
                },
                message: {
                    contactMessage: {
                        displayName: userName || "User",
                        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${userName || "User"};USER;;;\nFN:${userName || "User"}\nitem1.TEL;waid=${sender?.split('@')[0] || '0'}:${sender?.split('@')[0] || '0'}\nitem1.X-ABLabel:User\nEND:VCARD`
                    }
                }
            }
        });
    } catch (err) {
        console.error("Error in sendFormattedMessage:", err);
        await conn.sendMessage(from, { text: text });
    }
}

// joke command
cmd({
  pattern: "joke",
  alias: ["pun", "funny"],
  desc: "😂 Get a random joke",
  react: "🤣",
  category: "fun",
  filename: __filename
}, async (conn, mek, m, { from, reply, sender, pushname }) => {
  try {
    await sendFormattedMessage(
      conn, 
      from, 
      "🤣 *Fetching a joke for you...* ⏳", 
      sender, 
      pushname,
      "Joke Generator",
      "Loading joke"
    );

    const response = await axios.get("https://official-joke-api.appspot.com/random_joke", { timeout: 10000 });
    const joke = response.data;

    if (!joke || !joke.setup || !joke.punchline) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *Failed to fetch a joke. Please try again.*", 
        sender, 
        pushname,
        "Joke - Error",
        "Fetch failed"
      );
      return;
    }

    const jokeMessage = `🤣 *RANDOM JOKE* 🤣

📝 *Setup:* ${joke.setup}

🎯 *Punchline:* ${joke.punchline} 😆

━━━━━━━━━━━━━━━━
✅ *Enjoy your laugh!*`;

    await sendFormattedMessage(
      conn, 
      from, 
      jokeMessage, 
      sender, 
      pushname,
      "Random Joke",
      "Joke delivered"
    );
  } catch (error) {
    console.error("❌ Error in joke command:", error);
    await sendFormattedMessage(
      conn, 
      from, 
      "⚠️ *An error occurred while fetching the joke. Please try again.*", 
      sender, 
      pushname,
      "Joke - Error",
      "Request failed"
    );
  }
});

// flirt command
cmd({
    pattern: "flirt",
    alias: ["masom", "line", "flirtline"],
    desc: "Get a random flirt or pickup line.",
    react: "💘",
    category: "fun",
    filename: __filename,
}, 
async (conn, mek, m, { from, reply, sender, pushname }) => {
    try {
        await sendFormattedMessage(
          conn, 
          from, 
          "💘 *Finding a flirt line for you...* ⏳", 
          sender, 
          pushname,
          "Flirt Generator",
          "Loading"
        );

        const shizokeys = 'shizo';
        const apiUrl = `https://shizoapi.onrender.com/api/texts/flirt?apikey=${shizokeys}`;
        const res = await fetch(apiUrl, { timeout: 10000 });
        
        if (!res.ok) {
            throw new Error(`API error: ${await res.text()}`);
        }
        
        const json = await res.json();
        if (!json.result) {
            throw new Error("Invalid response from API.");
        }

        const flirtMessage = `💘 *FLIRT LINE* 💘

${json.result}

━━━━━━━━━━━━━━━━
✨ *Try this one!*`;

        await sendFormattedMessage(
          conn, 
          from, 
          flirtMessage, 
          sender, 
          pushname,
          "Flirt Line",
          "Flirt delivered"
        );

    } catch (error) {
        console.error("Error in flirt command:", error);
        await sendFormattedMessage(
          conn, 
          from, 
          "❌ *Sorry, something went wrong. Please try again later.*", 
          sender, 
          pushname,
          "Flirt - Error",
          "Request failed"
        );
    }
});

// truth command
cmd({
    pattern: "truth",
    alias: ["truthquestion", "truths"],
    desc: "Get a random truth question from the API.",
    react: "❓",
    category: "fun",
    filename: __filename,
}, 
async (conn, mek, m, { from, reply, sender, pushname }) => {
    try {
        await sendFormattedMessage(
          conn, 
          from, 
          "❓ *Finding a truth question for you...* ⏳", 
          sender, 
          pushname,
          "Truth Generator",
          "Loading"
        );

        const shizokeys = 'shizo';
        const res = await fetch(`https://shizoapi.onrender.com/api/texts/truth?apikey=${shizokeys}`, { timeout: 10000 });
        
        if (!res.ok) {
            throw new Error(`API request failed with status ${res.status}`);
        }

        const json = await res.json();

        if (!json.result) {
            throw new Error("Invalid API response: No 'result' field found.");
        }

        const truthMessage = `❓ *TRUTH QUESTION* ❓

${json.result}

━━━━━━━━━━━━━━━━
💬 *Answer honestly!*`;

        await sendFormattedMessage(
          conn, 
          from, 
          truthMessage, 
          sender, 
          pushname,
          "Truth Question",
          "Truth delivered"
        );

    } catch (error) {
        console.error("Error in truth command:", error);
        await sendFormattedMessage(
          conn, 
          from, 
          "❌ *Sorry, something went wrong. Please try again later.*", 
          sender, 
          pushname,
          "Truth - Error",
          "Request failed"
        );
    }
});

// dare command
cmd({
    pattern: "dare",
    alias: ["truthordare", "dares"],
    desc: "Get a random dare from the API.",
    react: "🎯",
    category: "fun",
    filename: __filename,
}, 
async (conn, mek, m, { from, reply, sender, pushname }) => {
    try {
        await sendFormattedMessage(
          conn, 
          from, 
          "🎯 *Finding a dare for you...* ⏳", 
          sender, 
          pushname,
          "Dare Generator",
          "Loading"
        );

        const shizokeys = 'shizo';
        const res = await fetch(`https://shizoapi.onrender.com/api/texts/dare?apikey=${shizokeys}`, { timeout: 10000 });
        
        if (!res.ok) {
            throw new Error(`API request failed with status ${res.status}`);
        }

        const json = await res.json();

        if (!json.result) {
            throw new Error("Invalid API response: No 'result' field found.");
        }

        const dareMessage = `🎯 *DARE CHALLENGE* 🎯

${json.result}

━━━━━━━━━━━━━━━━
🔥 *Are you brave enough?*`;

        await sendFormattedMessage(
          conn, 
          from, 
          dareMessage, 
          sender, 
          pushname,
          "Dare Challenge",
          "Dare delivered"
        );

    } catch (error) {
        console.error("Error in dare command:", error);
        await sendFormattedMessage(
          conn, 
          from, 
          "❌ *Sorry, something went wrong. Please try again later.*", 
          sender, 
          pushname,
          "Dare - Error",
          "Request failed"
        );
    }
});

// fact command
cmd({
  pattern: "fact",
  alias: ["funfact", "didyouknow"],
  desc: "🧠 Get a random fun fact",
  react: "🧠",
  category: "fun",
  filename: __filename
}, async (conn, mek, m, { from, reply, sender, pushname }) => {
  try {
    await sendFormattedMessage(
      conn, 
      from, 
      "🧠 *Fetching a fun fact...* ⏳", 
      sender, 
      pushname,
      "Fun Fact Generator",
      "Loading fact"
    );

    const response = await axios.get("https://uselessfacts.jsph.pl/random.json?language=en", { timeout: 10000 });
    const fact = response.data.text;

    if (!fact) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *Failed to fetch a fun fact. Please try again.*", 
        sender, 
        pushname,
        "Fun Fact - Error",
        "Fetch failed"
      );
      return;
    }

    const factMessage = `🧠 *RANDOM FUN FACT* 🧠

📖 ${fact}

━━━━━━━━━━━━━━━━
✨ *Isn't that interesting?* 😄`;

    await sendFormattedMessage(
      conn, 
      from, 
      factMessage, 
      sender, 
      pushname,
      "Fun Fact",
      "Fact delivered"
    );
  } catch (error) {
    console.error("❌ Error in fact command:", error);
    await sendFormattedMessage(
      conn, 
      from, 
      "⚠️ *An error occurred while fetching a fun fact. Please try again later.*", 
      sender, 
      pushname,
      "Fun Fact - Error",
      "Request failed"
    );
  }
});

// pickup line command
cmd({
    pattern: "pickupline",
    alias: ["pickup", "pline"],
    desc: "Get a random pickup line from the API.",
    react: "💬",
    category: "fun",
    filename: __filename,
}, 
async (conn, mek, m, { from, reply, sender, pushname }) => {
    try {
        await sendFormattedMessage(
          conn, 
          from, 
          "💬 *Finding a pickup line...* ⏳", 
          sender, 
          pushname,
          "Pickup Line Generator",
          "Loading"
        );

        const res = await fetch('https://api.popcat.xyz/pickuplines', { timeout: 10000 });
        
        if (!res.ok) {
            throw new Error(`API request failed with status ${res.status}`);
        }

        const json = await res.json();

        const pickupMessage = `💬 *PICKUP LINE* 💬

"${json.pickupline}"

━━━━━━━━━━━━━━━━
💝 *Try this one!*`;

        await sendFormattedMessage(
          conn, 
          from, 
          pickupMessage, 
          sender, 
          pushname,
          "Pickup Line",
          "Pickup line delivered"
        );

    } catch (error) {
        console.error("Error in pickupline command:", error);
        await sendFormattedMessage(
          conn, 
          from, 
          "❌ *Sorry, something went wrong. Please try again later.*", 
          sender, 
          pushname,
          "Pickup Line - Error",
          "Request failed"
        );
    }
});

// character command
cmd({
    pattern: "character",
    alias: ["char", "personality"],
    desc: "Check the character of a mentioned user.",
    react: "🔥",
    category: "fun",
    filename: __filename,
}, 
async (conn, mek, m, { from, isGroup, text, reply, sender, pushname }) => {
    try {
        if (!isGroup) {
            await sendFormattedMessage(
              conn, 
              from, 
              "❌ *This command can only be used in groups.*", 
              sender, 
              pushname,
              "Character Check - Error",
              "Not a group"
            );
            return;
        }

        const mentionedUser = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!mentionedUser) {
            await sendFormattedMessage(
              conn, 
              from, 
              "🔥 *Please mention a user whose character you want to check.*\n\n📌 *Usage:* .character @user", 
              sender, 
              pushname,
              "Character Check - Error",
              "No user"
            );
            return;
        }

        const userChar = [
            "Sigma", "Generous", "Grumpy", "Overconfident", "Obedient",
            "Good", "Simp", "Kind", "Patient", "Pervert", "Cool",
            "Helpful", "Brilliant", "Sexy", "Hot", "Gorgeous", "Cute"
        ];

        const userCharacterSelection = userChar[Math.floor(Math.random() * userChar.length)];

        const message = `🔥 *CHARACTER CHECK* 🔥

👤 @${mentionedUser.split("@")[0]}

📊 *Personality:* ${userCharacterSelection}

━━━━━━━━━━━━━━━━
✨ *Based on random analysis*`;

        await sendFormattedMessage(
          conn, 
          from, 
          message, 
          sender, 
          pushname,
          "Character Analysis",
          `${userCharacterSelection}`
        );

    } catch (e) {
        console.error("Error in character command:", e);
        await sendFormattedMessage(
          conn, 
          from, 
          "❌ *An error occurred. Please try again.*", 
          sender, 
          pushname,
          "Character Check - Error",
          "Request failed"
        );
    }
});

// repeat command
cmd({
  pattern: "repeat",
  alias: ["rp", "rpm", "repeats"],
  desc: "Repeat a message a specified number of times.",
  category: "fun",
  filename: __filename
}, async (conn, mek, m, { from, args, reply, sender, pushname }) => {
  try {
    if (!args[0]) {
      await sendFormattedMessage(
        conn, 
        from, 
        "🔄 *Use this command like:*\n\n📌 *Example:* .repeat 10,I love you\n\n_Repeat a message multiple times_", 
        sender, 
        pushname,
        "Repeat - Error",
        "Invalid usage"
      );
      return;
    }

    const [countStr, ...messageParts] = args.join(" ").split(",");
    const count = parseInt(countStr.trim());
    const message = messageParts.join(",").trim();

    if (isNaN(count) || count <= 0 || count > 300) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *Invalid number*\n\nPlease specify a valid number between 1 and 300.", 
        sender, 
        pushname,
        "Repeat - Error",
        "Invalid count"
      );
      return;
    }

    if (!message) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *Please provide a message to repeat.*", 
        sender, 
        pushname,
        "Repeat - Error",
        "No message"
      );
      return;
    }

    const repeatedMessage = Array(count).fill(message).join("\n");

    await sendFormattedMessage(
      conn, 
      from, 
      `🔄 *REPEATED ${count} TIMES* 🔄\n\n${repeatedMessage}`, 
      sender, 
      pushname,
      "Repeat Command",
      `${count} repetitions`
    );
  } catch (error) {
    console.error("❌ Error in repeat command:", error);
    await sendFormattedMessage(
      conn, 
      from, 
      "❌ *An error occurred while processing your request.*", 
      sender, 
      pushname,
      "Repeat - Error",
      "Request failed"
    );
  }
});

// send command (owner only)
cmd({
  pattern: "send",
  alias: ["masssend", "bulksend"],
  desc: "Send a message multiple times, one by one.",
  category: "fun",
  filename: __filename
}, async (conn, mek, m, { from, args, reply, senderNumber, sender, pushname }) => {
  try {
    const botOwner = conn.user.id.split(":")[0];

    if (senderNumber !== botOwner) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *Only the bot owner can use this command.*", 
        sender, 
        pushname,
        "Mass Send - Access Denied",
        "Owner only"
      );
      return;
    }

    if (!args[0]) {
      await sendFormattedMessage(
        conn, 
        from, 
        "📤 *Use this command like:*\n\n📌 *Example:* .send 10,Hello\n\n_Sends a message multiple times_", 
        sender, 
        pushname,
        "Mass Send - Error",
        "Invalid usage"
      );
      return;
    }

    const [countStr, ...messageParts] = args.join(" ").split(",");
    const count = parseInt(countStr.trim());
    const message = messageParts.join(",").trim();

    if (isNaN(count) || count <= 0 || count > 100) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *Invalid number*\n\nPlease specify a valid number between 1 and 100.", 
        sender, 
        pushname,
        "Mass Send - Error",
        "Invalid count"
      );
      return;
    }

    if (!message) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *Please provide a message to send.*", 
        sender, 
        pushname,
        "Mass Send - Error",
        "No message"
      );
      return;
    }

    await sendFormattedMessage(
      conn, 
      from, 
      `📤 *Sending "${message}" ${count} times*\n\n⏳ This may take a while...`, 
      sender, 
      pushname,
      "Mass Send",
      `Sending ${count} messages`
    );

    for (let i = 0; i < count; i++) {
      await conn.sendMessage(from, { text: message }, { quoted: mek });
      await sleep(1000);
    }

    await sendFormattedMessage(
      conn, 
      from, 
      `✅ *Successfully sent the message ${count} times.*`, 
      sender, 
      pushname,
      "Mass Send - Success",
      `${count} messages sent`
    );
  } catch (error) {
    console.error("❌ Error in send command:", error);
    await sendFormattedMessage(
      conn, 
      from, 
      "❌ *An error occurred while processing your request.*", 
      sender, 
      pushname,
      "Mass Send - Error",
      "Request failed"
    );
  }
});

// readmore command
cmd({
  pattern: "readmore",
  alias: ["rm", "rmore", "readm", "more"],
  desc: "Generate a Read More message.",
  category: "convert",
  use: ".readmore <text>",
  react: "📝",
  filename: __filename
}, async (conn, mek, m, { from, args, reply, sender, pushname }) => {
  try {
    const inputText = args.join(" ") || "No text provided.";
    const readMore = String.fromCharCode(8206).repeat(4000);
    const message = `${inputText} ${readMore} Continue Reading...`;

    await conn.sendMessage(from, { text: message }, { quoted: mek });
  } catch (error) {
    console.error("❌ Error in readmore command:", error);
    await sendFormattedMessage(
      conn, 
      from, 
      `❌ *Error:* ${error.message}`, 
      sender, 
      pushname,
      "Read More - Error",
      "Command failed"
    );
  }
});
