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
                    body: externalBody || "YouTube Stalker",
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
  pattern: "ytstalk",
  alias: ["ytinfo", "youtube", "channelinfo"],
  desc: "Get details about a YouTube channel.",
  react: "🔍",
  category: "search",
  filename: __filename
}, async (conn, mek, m, { from, quoted, q, reply, sender, pushname }) => {
  try {
    if (!q) {
      await sendFormattedMessage(
        conn, 
        from, 
        "🔍 *Please provide a YouTube channel username or ID*\n\n📌 *Usage:* .ytstalk MrBeast\n🔍 *Example:* .ytstalk PewDiePie", 
        sender, 
        pushname,
        "YouTube Stalker - Error",
        "No channel"
      );
      return;
    }

    await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

    await sendFormattedMessage(
      conn, 
      from, 
      `🔍 *Fetching YouTube channel details...*\n\n📺 *Channel:* ${q}\n⏳ Please wait!`, 
      sender, 
      pushname,
      "YouTube Stalker",
      "Searching"
    );

    const apiUrl = `https://delirius-apiofc.vercel.app/tools/ytstalk?channel=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl, { timeout: 15000 });

    if (!data || !data.status || !data.data) {
      await sendFormattedMessage(
        conn, 
        from, 
        "⚠️ *Failed to fetch YouTube channel details*\n\nEnsure the username or ID is correct and try again.", 
        sender, 
        pushname,
        "YouTube Stalker - Error",
        "Channel not found"
      );
      return;
    }

    const yt = data.data;
    
    const caption = `🔍 *YOUTUBE CHANNEL INFO* 🔍

📺 *Channel Name:* ${yt.username}
👤 *Channel ID:* ${yt.channel_id || "N/A"}
📊 *Subscribers:* ${yt.subscriber_count || "N/A"}
🎥 *Videos:* ${yt.video_count || "N/A"}
🔗 *Channel Link:* ${yt.channel}

━━━━━━━━━━━━━━━━
✅ *Information fetched successfully!*`;

    await conn.sendMessage(from, {
      image: { url: yt.avatar },
      caption: caption
    }, { quoted: mek });

    await sendFormattedMessage(
      conn, 
      from, 
      `✅ *Channel info retrieved!*\n\n📺 *Channel:* ${yt.username}\n👥 *Subscribers:* ${yt.subscriber_count}\n🎥 *Total Videos:* ${yt.video_count}`, 
      sender, 
      pushname,
      "YouTube Stalker - Success",
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
      "YouTube Stalker - Error",
      "Request failed"
    );
  }
});
