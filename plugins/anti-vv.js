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
                    body: externalBody || "VV System",
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
  pattern: "vv",
  alias: ["viewonce", 'retrive'],
  react: '🐳',
  desc: "Owner Only - retrieve quoted message back to user",
  category: "owner",
  filename: __filename
}, async (conn, mek, m, { from, isCreator, sender, pushname, reply }) => {
  try {
    // Check if user is owner
    if (!isCreator) {
      await sendFormattedMessage(
        conn, 
        from, 
        "*📛 This is an owner command.*\nOnly the bot owner can use this feature.", 
        sender, 
        pushname,
        "VV System - Access Denied",
        "Owner only command"
      );
      return;
    }

    // Check if a message is quoted/replied
    if (!mek.quoted) {
      await sendFormattedMessage(
        conn, 
        from, 
        "*🍁 Please reply to a view once message!*\n\nExample: Reply to a view-once image/video with .vv", 
        sender, 
        pushname,
        "VV System - Error",
        "No quoted message found"
      );
      return;
    }

    // Download the quoted message
    const buffer = await mek.quoted.download();
    const mtype = mek.quoted.mtype;
    const options = { quoted: mek };

    let messageContent = {};
    
    switch (mtype) {
      case "imageMessage":
        messageContent = {
          image: buffer,
          caption: mek.quoted.text || '',
          mimetype: mek.quoted.mimetype || "image/jpeg"
        };
        break;
        
      case "videoMessage":
        messageContent = {
          video: buffer,
          caption: mek.quoted.text || '',
          mimetype: mek.quoted.mimetype || "video/mp4"
        };
        break;
        
      case "audioMessage":
        messageContent = {
          audio: buffer,
          mimetype: "audio/mp4",
          ptt: mek.quoted.ptt || false
        };
        break;
        
      default:
        await sendFormattedMessage(
          conn, 
          from, 
          "❌ *Only image, video, and audio messages are supported*", 
          sender, 
          pushname,
          "VV System - Error",
          "Unsupported media type"
        );
        return;
    }

    // Send the retrieved media to the group
    await conn.sendMessage(from, messageContent, options);
    
    // Send success notification
    await sendFormattedMessage(
      conn, 
      from, 
      "✅ *View Once message retrieved successfully!*", 
      sender, 
      pushname,
      "VV System - Success",
      "Media retrieved"
    );
    
  } catch (error) {
    console.error("VV Error:", error);
    await sendFormattedMessage(
      conn, 
      from, 
      `❌ *Error fetching view-once message:*\n${error.message}`, 
      sender, 
      pushname,
      "VV System - Error",
      "Failed to retrieve media"
    );
  }
});
