const { cmd } = require('../command');
const axios = require('axios');
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
                    body: externalBody || "Twitter/X Stalker",
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
  pattern: "xstalk",
  alias: ["twitterstalk", "twtstalk", "x", "twitter"],
  desc: "Get details about a Twitter/X user.",
  react: "🔍",
  category: "search",
  filename: __filename
}, async (conn, mek, m, { from, quoted, q, reply, sender, pushname }) => {
  try {
    if (!q) {
      await sendFormattedMessage(
        conn, 
        from, 
        "🔍 *Please provide a Twitter/X username*\n\n📌 *Usage:* .xstalk elonmusk\n🔍 *Example:* .xstalk crissvevo", 
        sender, 
        pushname,
        "Twitter Stalker - Error",
        "No username"
      );
      return;
    }

    await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

    await sendFormattedMessage(
      conn, 
      from, 
      `🔍 *Fetching Twitter/X user details...*\n\n👤 *Username:* @${q}\n⏳ Please wait!`, 
      sender, 
      pushname,
      "Twitter Stalker",
      "Fetching data"
    );

    const apiUrl = `https://delirius-apiofc.vercel.app/tools/xstalk?username=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl, { timeout: 15000 });

    if (!data || !data.status || !data.data) {
      await sendFormattedMessage(
        conn, 
        from, 
        "⚠️ *Failed to fetch Twitter/X user details*\n\nEnsure the username is correct and try again.", 
        sender, 
        pushname,
        "Twitter Stalker - Error",
        "User not found"
      );
      return;
    }

    const user = data.data;
    const verifiedBadge = user.verified ? "✅ Verified" : "❌ Not Verified";

    const caption = `🔍 *TWITTER/X USER INFO* 🔍

👤 *Name:* ${user.name}
🔹 *Username:* @${user.username}
✔️ *Status:* ${verifiedBadge}

👥 *Followers:* ${user.followers_count}
👤 *Following:* ${user.following_count}
📝 *Tweets:* ${user.tweets_count}

📅 *Joined:* ${user.created}
🔗 *Profile:* ${user.url}

━━━━━━━━━━━━━━━━
✅ *Information fetched successfully!*`;

    await conn.sendMessage(from, {
      image: { url: user.avatar },
      caption: caption
    }, { quoted: mek });

    await sendFormattedMessage(
      conn, 
      from, 
      `✅ *User info retrieved!*\n\n👤 *${user.name}* (@${user.username})\n👥 *Followers:* ${user.followers_count}\n📝 *Tweets:* ${user.tweets_count}`, 
      sender, 
      pushname,
      "Twitter Stalker - Success",
      "Info delivered"
    );

  } catch (error) {
    console.error("Error:", error);
    await sendFormattedMessage(
      conn, 
      from, 
      `❌ *An error occurred*\n\n${error.message}\n\nPlease try again later.`, 
      sender, 
      pushname,
      "Twitter Stalker - Error",
      "Request failed"
    );
  }
});
