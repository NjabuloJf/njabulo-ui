const axios = require("axios");
const { cmd } = require("../command");
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
                    body: externalBody || "Facebook Downloader",
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
  pattern: "fb",
  alias: ["facebook", "fbdl"],
  desc: "Download Facebook videos",
  category: "download",
  filename: __filename,
  use: "<Facebook URL>",
}, async (conn, mek, m, { from, args, q, reply, sender, pushname }) => {
  try {
    // Check if a URL is provided
    if (!q || !q.startsWith("http")) {
      await sendFormattedMessage(
        conn, 
        from, 
        "📱 *Need a valid Facebook URL*\n\n📌 *Usage:* .fb https://www.facebook.com/...\n\n🔍 *Example:* .fb https://www.facebook.com/watch/?v=123456789", 
        sender, 
        pushname,
        "Facebook Downloader - Error",
        "No URL provided"
      );
      return;
    }

    // Add a loading react
    await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

    // Send processing message
    await sendFormattedMessage(
      conn, 
      from, 
      "📥 *Processing Facebook video...*\n\n⏳ Please wait while we fetch your video.", 
      sender, 
      pushname,
      "Facebook Downloader",
      "Fetching video..."
    );

    // Fetch video URL from the API
    const apiUrl = `https://www.velyn.biz.id/api/downloader/facebookdl?url=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl, { timeout: 30000 });

    // Check if the API response is valid
    if (!data.status || !data.data || !data.data.url) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *Failed to fetch the video*\n\nPlease try another link or check if the video is accessible.\n\n🔗 *Your URL:* " + q, 
        sender, 
        pushname,
        "Facebook Downloader - Error",
        "Video not found"
      );
      return;
    }

    // Send the video to the user
    const videoUrl = data.data.url;
    await conn.sendMessage(from, {
      video: { url: videoUrl },
      caption: "📥 *Facebook Video Downloaded*\n\n✅ Successfully fetched your video!\n\nɴᴊᴀʙᴜʟᴏ ᴜɪ",
    }, { quoted: mek });

    // Send success message
    await sendFormattedMessage(
      conn, 
      from, 
      "✅ *Video sent successfully!*\n\n📱 Enjoy your downloaded Facebook video.\n\nɴᴊᴀʙᴜʟᴏ ᴜɪ", 
      sender, 
      pushname,
      "Facebook Downloader - Success",
      "Video delivered"
    );

  } catch (error) {
    console.error("Error:", error);
    await sendFormattedMessage(
      conn, 
      from, 
      `❌ *Error fetching the video*\n\n⚠️ ${error.message || "Please try again later."}\n\n📌 Make sure the URL is valid and the video is public.\n\nɴᴊᴀʙᴜʟᴏ ᴜɪ`, 
      sender, 
      pushname,
      "Facebook Downloader - Error",
      "Request failed"
    );
  }
});
