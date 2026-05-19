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
                    body: externalBody || "Message Forwarder",
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
  pattern: "send",
  alias: ["sendme", 'save', 'forward'],
  react: '📤',
  desc: "Forwards quoted message back to user",
  category: "utility",
  filename: __filename
}, async (conn, mek, m, { from, sender, pushname }) => {
  try {
    if (!mek.quoted) {
      await sendFormattedMessage(
        conn, 
        from, 
        "📤 *Please reply to a message to forward*\n\n📌 *Usage:* Reply to an image/video/audio with .send", 
        sender, 
        pushname,
        "Forward Message - Error",
        "No message"
      );
      return;
    }

    const buffer = await mek.quoted.download();
    const mtype = mek.quoted.mtype;

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
          "❌ *Unsupported message type*\n\nOnly image, video, and audio messages can be forwarded.", 
          sender, 
          pushname,
          "Forward Message - Error",
          "Unsupported type"
        );
        return;
    }

    await conn.sendMessage(from, messageContent, { quoted: mek });

    await sendFormattedMessage(
      conn, 
      from, 
      "✅ *Message forwarded successfully!*", 
      sender, 
      pushname,
      "Forward Message - Success",
      "Message delivered"
    );

  } catch (error) {
    console.error("Forward Error:", error);
    await sendFormattedMessage(
      conn, 
      from, 
      `❌ *Error forwarding message:*\n${error.message}`, 
      sender, 
      pushname,
      "Forward Message - Error",
      "Forward failed"
    );
  }
});
