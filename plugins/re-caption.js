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
                    body: externalBody || "Caption Editor",
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
  pattern: "caption",
  alias: ["cap", "recaption", "c", "editcaption"],
  react: '✏️',
  desc: "Add or change caption of media/document",
  category: "utility",
  filename: __filename
}, async (conn, mek, m, { from, sender, pushname }) => {
  try {
    if (!mek.quoted) {
      await sendFormattedMessage(
        conn, 
        from, 
        "✏️ *Please reply to a media message to add caption*\n\n📌 *Usage:*\n• Reply to media with .caption [your text]\n• Example: .caption This is my beautiful image\n\n📝 *Supported formats:* Image, Video, Document, Audio", 
        sender, 
        pushname,
        "Caption Editor - Error",
        "No media"
      );
      return;
    }

    const quotedMsg = mek.quoted;
    if (!quotedMsg || !quotedMsg.download) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *The quoted message is not valid media*", 
        sender, 
        pushname,
        "Caption Editor - Error",
        "Invalid media"
      );
      return;
    }

    await sendFormattedMessage(
      conn, 
      from, 
      `✏️ *Processing media...*\n\n⏳ Please wait!`, 
      sender, 
      pushname,
      "Caption Editor",
      "Processing"
    );

    const buffer = await quotedMsg.download();
    const mtype = quotedMsg.mtype;
    
    // Get the caption text (everything after the command)
    const cmdText = mek.body.split(' ')[0].toLowerCase();
    const newCaption = mek.body.slice(cmdText.length).trim();

    if (!buffer) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *Failed to download the media*\n\nPlease try again later.", 
        sender, 
        pushname,
        "Caption Editor - Error",
        "Download failed"
      );
      return;
    }

    // Create the base message content
    const messageContent = {
      caption: newCaption || "📎 Media",
      mimetype: quotedMsg.mimetype
    };

    // Add the appropriate media property based on type
    switch (mtype) {
      case "imageMessage":
        messageContent.image = buffer;
        messageContent.mimetype = messageContent.mimetype || "image/jpeg";
        break;
      case "videoMessage":
        messageContent.video = buffer;
        messageContent.mimetype = messageContent.mimetype || "video/mp4";
        break;
      case "documentMessage":
        messageContent.document = buffer;
        messageContent.mimetype = messageContent.mimetype || "application/octet-stream";
        break;
      case "audioMessage":
        messageContent.audio = buffer;
        messageContent.mimetype = messageContent.mimetype || "audio/mp4";
        messageContent.ptt = quotedMsg.ptt || false;
        break;
      default:
        await sendFormattedMessage(
          conn, 
          from, 
          "❌ *Unsupported media type*\n\nOnly image, video, document and audio messages can be recaptioned.", 
          sender, 
          pushname,
          "Caption Editor - Error",
          "Unsupported type"
        );
        return;
    }

    // Send the message with media and caption
    await conn.sendMessage(from, messageContent, { quoted: mek });

    await sendFormattedMessage(
      conn, 
      from, 
      `✅ *Caption added successfully!*\n\n✏️ New caption: ${newCaption || "📎 Media"}\n\nMedia resent with updated caption.`, 
      sender, 
      pushname,
      "Caption Editor - Success",
      "Caption updated"
    );

  } catch (error) {
    console.error("Caption Error:", error);
    await sendFormattedMessage(
      conn, 
      from, 
      `❌ *Error adding caption*\n\n${error.message || error.toString()}`, 
      sender, 
      pushname,
      "Caption Editor - Error",
      "Request failed"
    );
  }
});
