

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
                    body: externalBody || "Bulk Forwarder",
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

// Safety Configuration
const SAFETY = {
  MAX_JIDS: 20,
  BASE_DELAY: 2000,
  EXTRA_DELAY: 4000,
};

cmd({
  pattern: "forward",
  alias: ["fwd", "bulkforward"],
  desc: "Bulk forward media to groups",
  category: "owner",
  filename: __filename
}, async (conn, mek, m, { from, isOwner, reply, sender, pushname }) => {
  try {
    // Owner check
    if (!isOwner) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *Owner Only Command*", 
        sender, 
        pushname,
        "Forward - Access Denied",
        "Owner only"
      );
      return;
    }
    
    // Quoted message check
    if (!mek.quoted) {
      await sendFormattedMessage(
        conn, 
        from, 
        "📤 *Please reply to a message to forward*\n\n📌 *Usage:* .forward 1234567890@g.us,0987654321@g.us", 
        sender, 
        pushname,
        "Forward - Error",
        "No message"
      );
      return;
    }

    // ===== [BULLETPROOF JID PROCESSING] ===== //
    let jidInput = "";
    
    // Handle all possible match formats
    const match = mek.body?.replace(/^\.forward\s*/i, '') || "";
    if (typeof match === "string") {
      jidInput = match.trim();
    } else if (Array.isArray(match)) {
      jidInput = match.join(" ").trim();
    } else if (match && typeof match === "object") {
      jidInput = match.text || "";
    }
    
    // Extract JIDs (supports comma or space separated)
    const rawJids = jidInput.split(/[\s,]+/).filter(jid => jid.trim().length > 0);
    
    // Process JIDs (accepts with or without @g.us)
    const validJids = rawJids
      .map(jid => {
        // Remove existing @g.us if present
        const cleanJid = jid.replace(/@g\.us$/i, "");
        // Only keep if it's all numbers
        return /^\d+$/.test(cleanJid) ? `${cleanJid}@g.us` : null;
      })
      .filter(jid => jid !== null)
      .slice(0, SAFETY.MAX_JIDS);

    if (validJids.length === 0) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *No valid group JIDs found*\n\n📌 *Examples:*\n.fwd 120363411055156472@g.us,120363333939099948@g.us\n.fwd 120363411055156472 120363333939099948", 
        sender, 
        pushname,
        "Forward - Error",
        "Invalid JIDs"
      );
      return;
    }

    await sendFormattedMessage(
      conn, 
      from, 
      `📤 *Preparing to forward to ${validJids.length} groups...*\n\n⏳ Please wait!`, 
      sender, 
      pushname,
      "Bulk Forward",
      `Target: ${validJids.length} groups`
    );

    // ===== [ENHANCED MEDIA HANDLING - ALL TYPES] ===== //
    let messageContent = {};
    const mtype = mek.quoted.mtype;
    
    // For media messages (image, video, audio, sticker, document)
    if (["imageMessage", "videoMessage", "audioMessage", "stickerMessage", "documentMessage"].includes(mtype)) {
      const buffer = await mek.quoted.download();
      
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
            mimetype: mek.quoted.mimetype || "audio/mp4",
            ptt: mek.quoted.ptt || false
          };
          break;
        case "stickerMessage":
          messageContent = {
            sticker: buffer,
            mimetype: mek.quoted.mimetype || "image/webp"
          };
          break;
        case "documentMessage":
          messageContent = {
            document: buffer,
            mimetype: mek.quoted.mimetype || "application/octet-stream",
            fileName: mek.quoted.fileName || "document"
          };
          break;
      }
    } 
    // For text messages
    else if (mtype === "extendedTextMessage" || mtype === "conversation") {
      messageContent = {
        text: mek.quoted.text
      };
    } 
    // For other message types (forwarding as-is)
    else {
      try {
        messageContent = mek.quoted;
      } catch (e) {
        await sendFormattedMessage(
          conn, 
          from, 
          "❌ *Unsupported message type*", 
          sender, 
          pushname,
          "Forward - Error",
          "Unsupported"
        );
        return;
      }
    }

    // ===== [OPTIMIZED SENDING WITH PROGRESS] ===== //
    let successCount = 0;
    const failedJids = [];
    
    for (const [index, jid] of validJids.entries()) {
      try {
        await conn.sendMessage(jid, messageContent);
        successCount++;
        
        // Progress update (every 10 groups)
        if ((index + 1) % 10 === 0) {
          await sendFormattedMessage(
            conn, 
            from, 
            `🔄 *Progress:* ${index + 1}/${validJids.length} groups...`, 
            sender, 
            pushname,
            "Bulk Forward",
            `${index + 1}/${validJids.length}`
          );
        }
        
        // Apply reduced delay
        const delayTime = (index + 1) % 10 === 0 ? SAFETY.EXTRA_DELAY : SAFETY.BASE_DELAY;
        await new Promise(resolve => setTimeout(resolve, delayTime));
        
      } catch (error) {
        failedJids.push(jid.replace('@g.us', ''));
        await new Promise(resolve => setTimeout(resolve, SAFETY.BASE_DELAY));
      }
    }

    // ===== [COMPREHENSIVE REPORT] ===== //
    let report = `📤 *FORWARD COMPLETE* 📤

✅ *Success:* ${successCount}/${validJids.length}
📦 *Type:* ${mtype.replace('Message', '') || 'text'}`;
    
    if (failedJids.length > 0) {
      report += `\n\n❌ *Failed (${failedJids.length}):* ${failedJids.slice(0, 5).join(', ')}`;
      if (failedJids.length > 5) report += ` +${failedJids.length - 5} more`;
    }
    
    if (rawJids.length > SAFETY.MAX_JIDS) {
      report += `\n\n⚠️ *Note:* Limited to first ${SAFETY.MAX_JIDS} JIDs`;
    }

    await sendFormattedMessage(
      conn, 
      from, 
      report, 
      sender, 
      pushname,
      "Bulk Forward",
      `${successCount}/${validJids.length} successful`
    );

  } catch (error) {
    console.error("Forward Error:", error);
    await sendFormattedMessage(
      conn, 
      from, 
      `💢 *Error:* ${error.message.substring(0, 100)}\n\nPlease try again and check:\n1. JID formatting\n2. Media type support\n3. Bot permissions`, 
      sender, 
      pushname,
      "Forward - Error",
      "Request failed"
    );
  }
});
