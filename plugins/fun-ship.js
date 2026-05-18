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
                    body: externalBody || "Love Matcher",
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

cmd({
  pattern: "ship",
  alias: ["match", "love", "couple"],
  desc: "Randomly pairs the command user with another group member.",
  react: "❤️",
  category: "fun",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, groupMetadata, reply, sender, pushname }) => {
  try {
    if (!isGroup) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *This command can only be used in groups.*", 
        sender, 
        pushname,
        "Ship - Error",
        "Not a group"
      );
      return;
    }

    const specialNumber = config.DEV ? `${config.DEV}@s.whatsapp.net` : null;
    const participants = groupMetadata.participants.map(user => user.id);
    
    // Filter out bot
    const eligibleParticipants = participants.filter(id => !id.includes(conn.user.id.split('@')[0]));
    
    if (eligibleParticipants.length < 1) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *Not enough participants to make a match!*\n\nNeed at least one other person in the group.", 
        sender, 
        pushname,
        "Ship - Error",
        "No members"
      );
      return;
    }

    await sendFormattedMessage(
      conn, 
      from, 
      `💘 *Finding your perfect match...* 💘\n\n❤️ @${sender.split("@")[0]} is looking for love!\n\n⏳ Please wait!`, 
      sender, 
      pushname,
      "Love Matcher",
      "Searching for match"
    );

    let randomPair;

    if (specialNumber && eligibleParticipants.includes(specialNumber) && sender !== specialNumber) {
      randomPair = specialNumber;
    } else {
      do {
        randomPair = eligibleParticipants[Math.floor(Math.random() * eligibleParticipants.length)];
      } while (randomPair === sender);
    }

    // Calculate love percentage
    const lovePercent = Math.floor(Math.random() * 100) + 1;
    
    let loveMessage = "";
    if (lovePercent >= 90) loveMessage = "💖 *Perfect match!* Soulmates detected!";
    else if (lovePercent >= 70) loveMessage = "😍 *Strong connection!* This could be real!";
    else if (lovePercent >= 50) loveMessage = "😊 *Good chemistry!* Worth exploring!";
    else if (lovePercent >= 30) loveMessage = "🤔 *It's complicated!* Needs time!";
    else loveMessage = "💔 *Not the best match!* Maybe just friends!";

    const message = `💘 *MATCH FOUND!* 💘

❤️ *Cupid's Choice:* @${sender.split("@")[0]} + @${randomPair.split("@")[0]}

📊 *Love Score:* ${lovePercent}%

💬 *Verdict:* ${loveMessage}

🎉 *Congratulations! May this bond grow stronger!* ✨

⚡ *NJABULO UI*`;

    await sendFormattedMessage(
      conn, 
      from, 
      message, 
      sender, 
      pushname,
      "Love Match",
      `${lovePercent}% compatible`
    );

  } catch (error) {
    console.error("❌ Error in ship command:", error);
    await sendFormattedMessage(
      conn, 
      from, 
      `⚠️ *An error occurred*\n\n❌ ${error.message}\n\nPlease try again later.`, 
      sender, 
      pushname,
      "Ship - Error",
      "Command failed"
    );
  }
});
