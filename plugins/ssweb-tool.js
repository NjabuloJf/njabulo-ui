const axios = require("axios");
const config = require('../config');
const { cmd } = require('../command');

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
                    body: externalBody || "Web Screenshot",
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
  pattern: "sss",
  alias: ["ssweb", "screenshot", "capture"],
  react: "💫",
  desc: "Download screenshot of a given link.",
  category: "other",
  use: ".ss <link>",
  filename: __filename,
}, 
async (conn, mek, m, {
  from, l, quoted, body, isCmd, command, args, q, isGroup, sender, 
  senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, 
  groupMetadata, groupName, participants, isItzcp, groupAdmins, 
  isBotAdmins, isAdmins, reply 
}) => {
  if (!q) {
    await sendFormattedMessage(
      conn, 
      from, 
      "💫 *Please provide a URL to capture a screenshot*\n\n📌 *Usage:* .ss https://example.com\n🔍 *Example:* .ss https://google.com", 
      sender, 
      pushname,
      "Web Screenshot - Error",
      "No URL"
    );
    return;
  }

  try {
    await sendFormattedMessage(
      conn, 
      from, 
      `💫 *Capturing screenshot...*\n\n🔗 *URL:* ${q}\n⏳ Please wait!`, 
      sender, 
      pushname,
      "Web Screenshot",
      "Capturing"
    );

    const response = await axios.get(`https://api.davidcyriltech.my.id/ssweb?url=${q}`, { timeout: 30000 });
    const screenshotUrl = response.data.screenshotUrl;

    const imageMessage = {
      image: { url: screenshotUrl },
      caption: `💫 *WEB SCREENSHOT* 💫

🔗 *URL:* ${q}

✅ *Screenshot captured successfully!*`
    };

    await conn.sendMessage(from, imageMessage, { quoted: mek });

    await sendFormattedMessage(
      conn, 
      from, 
      `✅ *Screenshot delivered!*\n\n🔗 *URL:* ${q}\n\nEnjoy your screenshot.`, 
      sender, 
      pushname,
      "Web Screenshot - Success",
      "Image delivered"
    );

  } catch (error) {
    console.error(error);
    await sendFormattedMessage(
      conn, 
      from, 
      "❌ *Failed to capture the screenshot*\n\nPlease check the URL and try again.", 
      sender, 
      pushname,
      "Web Screenshot - Error",
      "Capture failed"
    );
  }
});
