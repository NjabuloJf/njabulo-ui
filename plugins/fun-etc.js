const axios = require("axios");
const { cmd } = require("../command");
const { fetchGif, gifToVideo } = require("../lib/fetchGif");
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
                    body: externalBody || "Wedding System",
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
  pattern: "marige",
  alias: ["shadi", "marriage", "wedding", "marry"],
  desc: "Randomly pairs two users for marriage with a wedding GIF",
  react: "💍",
  category: "fun",
  filename: __filename
}, async (conn, mek, store, { isGroup, groupMetadata, reply, sender, pushname, from }) => {
  try {
    if (!isGroup) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *This command can only be used in groups!*", 
        sender, 
        pushname,
        "Marriage - Error",
        "Not a group"
      );
      return;
    }

    const participants = groupMetadata.participants.map(user => user.id);
    
    // Filter out the sender and bot number
    const eligibleParticipants = participants.filter(id => id !== sender && !id.includes(conn.user.id.split('@')[0]));
    
    if (eligibleParticipants.length < 1) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *Not enough participants to perform a marriage!*\n\nNeed at least one other person in the group.", 
        sender, 
        pushname,
        "Marriage - Error",
        "Not enough members"
      );
      return;
    }

    // Select random pair
    const randomIndex = Math.floor(Math.random() * eligibleParticipants.length);
    const randomPair = eligibleParticipants[randomIndex];

    await sendFormattedMessage(
      conn, 
      from, 
      `💍 *Finding a match...* 💍\n\nMatching @${sender.split('@')[0]} with someone special...\n\n⏳ Please wait!`, 
      sender, 
      pushname,
      "Marriage Matchmaking",
      "Finding partner"
    );

    // Fetch wedding GIF
    const apiUrl = "https://api.waifu.pics/sfw/kiss";
    let res = await axios.get(apiUrl, { timeout: 15000 });
    let gifUrl = res.data.url;

    let gifBuffer = await fetchGif(gifUrl);
    let videoBuffer = await gifToVideo(gifBuffer);

    const message = `💍 *SHAADI MUBARAK!* 💒

👰 *Bride:* @${sender.split('@')[0]}
🤵 *Groom:* @${randomPair.split('@')[0]}

💖 *May you both live happily ever after!*

✨ *NJABULO UI*`;

    await conn.sendMessage(
      from,
      { 
        video: videoBuffer, 
        caption: message, 
        gifPlayback: true, 
        mentions: [sender, randomPair] 
      },
      { quoted: mek }
    );

    await sendFormattedMessage(
      conn, 
      from, 
      `✅ *Wedding completed successfully!*\n\n💍 Congratulations @${sender.split('@')[0]} and @${randomPair.split('@')[0]}!\n\n💖 May your bond grow stronger!`, 
      sender, 
      pushname,
      "Wedding Complete",
      "Marriage confirmed"
    );

  } catch (error) {
    console.error("❌ Error in .marige command:", error);
    await sendFormattedMessage(
      conn, 
      from, 
      `❌ *Error:* ${error.message}\n\nPlease try again later.`, 
      sender, 
      pushname,
      "Marriage - Error",
      "Command failed"
    );
  }
});
