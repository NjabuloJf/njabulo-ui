const { cmd } = require('../command');
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
                    body: externalBody || "Anti-Link System",
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
  'on': "body"
}, async (conn, m, store, {
  from,
  body,
  sender,
  isGroup,
  isAdmins,
  isBotAdmins,
  reply,
  pushname
}) => {
  try {
    // Initialize warnings if not exists
    if (!global.warnings) {
      global.warnings = {};
    }

    // Only act in groups where bot is admin and sender isn't admin
    if (!isGroup || isAdmins || !isBotAdmins) {
      return;
    }

    // Check if anti-link is enabled
    if (config.ANTI_LINK !== 'true') {
      return;
    }

    // List of link patterns to detect
    const linkPatterns = [
      /https?:\/\/(?:chat\.whatsapp\.com|wa\.me)\/\S+/gi, // WhatsApp links
      /https?:\/\/(?:api\.whatsapp\.com|wa\.me)\/\S+/gi,  // WhatsApp API links
      /wa\.me\/\S+/gi,                                    // WhatsApp.me links
      /https?:\/\/(?:t\.me|telegram\.me)\/\S+/gi,         // Telegram links
      /https?:\/\/(?:www\.)?youtube\.com\/\S+/gi,         // YouTube links
      /https?:\/\/youtu\.be\/\S+/gi,                      // YouTube short links
      /https?:\/\/(?:www\.)?facebook\.com\/\S+/gi,        // Facebook links
      /https?:\/\/fb\.me\/\S+/gi,                         // Facebook short links
      /https?:\/\/(?:www\.)?instagram\.com\/\S+/gi,       // Instagram links
      /https?:\/\/(?:www\.)?twitter\.com\/\S+/gi,         // Twitter links
      /https?:\/\/(?:www\.)?linkedin\.com\/\S+/gi,        // LinkedIn links
      /https?:\/\/(?:www\.)?tiktok\.com\/\S+/gi,          // TikTok links
      /https?:\/\/(?:www\.)?reddit\.com\/\S+/gi,          // Reddit links
      /https?:\/\/(?:www\.)?discord\.com\/\S+/gi,         // Discord links
      /https?:\/\/(?:www\.)?twitch\.tv\/\S+/gi,           // Twitch links
      /https?:\/\/(?:www\.)?vimeo\.com\/\S+/gi,           // Vimeo links
      /https?:\/\/(?:www\.)?dailymotion\.com\/\S+/gi,     // Dailymotion links
      /https?:\/\/(?:www\.)?medium\.com\/\S+/gi,          // Medium links
      /https?:\/\/(?:www\.)?pinterest\.com\/\S+/gi,       // Pinterest links
      /https?:\/\/(?:www\.)?spotify\.com\/\S+/gi,         // Spotify links
      /https?:\/\/spoti\.fi\/\S+/gi,                      // Spotify short links
      /https?:\/\/(?:www\.)?netflix\.com\/\S+/gi,         // Netflix links
      /https?:\/\/(?:www\.)?whatsapp\.com\/channel\/\S+/gi // WhatsApp Channel links
    ];

    // Check if message contains any forbidden links
    const containsLink = linkPatterns.some(pattern => pattern.test(body));

    if (containsLink) {
      console.log(`Link detected from ${sender}: ${body}`);

      // Try to delete the message
      try {
        await conn.sendMessage(from, {
          delete: m.key
        });
        console.log(`Message deleted: ${m.key.id}`);
      } catch (error) {
        console.error("Failed to delete message:", error);
      }

      // Update warning count for user
      global.warnings[sender] = (global.warnings[sender] || 0) + 1;
      const warningCount = global.warnings[sender];
      const warningLimit = 3; // 3 warnings before removal

      // Handle warnings
      if (warningCount < warningLimit) {
        // Send formatted warning message
        const warningMessage = `⚠️ *LINKS ARE NOT ALLOWED* ⚠️

╭───〔 *WARNING* 〕───◉
│
├▢ *USER:* @${sender.split('@')[0]}
├▢ *COUNT:* ${warningCount}/${warningLimit}
├▢ *REASON:* Link detected
├▢ *NEXT ACTION:* ${warningCount === warningLimit - 1 ? 'Removal' : 'Warning'}
│
╰──────────────────◉

*Please avoid sending links in this group!* 🔇`;

        await sendFormattedMessage(
          conn, 
          from, 
          warningMessage, 
          sender, 
          pushname || "User",
          "Anti-Link System",
          `Warning ${warningCount}/${warningLimit}`
        );
      } else {
        // Send removal message and remove user
        const removalMessage = `🚫 *USER REMOVED* 🚫

╭───〔 *ACTION TAKEN* 〕───◉
│
├▢ *USER:* @${sender.split('@')[0]}
├▢ *REASON:* Warning limit exceeded
├▢ *WARNINGS:* ${warningCount}/${warningLimit}
├▢ *ACTION:* Removed from group
│
╰──────────────────◉

*@${sender.split('@')[0]} has been removed for repeatedly sending links!*`;

        await sendFormattedMessage(
          conn, 
          from, 
          removalMessage, 
          sender, 
          pushname || "User",
          "Anti-Link System",
          "User Removed - Warning Limit Exceeded"
        );
        
        // Remove user from group
        await conn.groupParticipantsUpdate(from, [sender], "remove");
        
        // Reset warnings for removed user
        delete global.warnings[sender];
      }
    }
  } catch (error) {
    console.error("Anti-link error:", error);
    await sendFormattedMessage(
      conn, 
      from, 
      `❌ *Error:* ${error.message}`, 
      sender, 
      pushname,
      "Anti-Link System Error",
      "Something went wrong"
    );
  }
});
