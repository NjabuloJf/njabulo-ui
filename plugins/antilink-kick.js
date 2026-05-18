const { fana } = require('../njabulo');
const config = require("../config");

// Helper function to send formatted messages
async function sendFormattedMessage(conn, from, text, sender, type = 'warning') {
    const userName = sender?.split('@')[0] || "User";
    const bodyText = type === 'success' ? '✅ Success' : type === 'warning' ? '⚠️ Warning' : '❌ Error';
    const externalBody = type === 'warning' ? '🚫 Link Detected' : '📢 System Notification';
    
    await conn.sendMessage(from, {
        text: text,
        contextInfo: {
            isForwarded: true,
            title: "ɴᴊᴀʙᴜʟᴏ ᴜɪ",
            body: bodyText,
            forwardedNewsletterMessageInfo: {
                newsletterJid: config.NEWSLETTER,
                newsletterName: '╭••➤ɴᴊᴀʙᴜʟᴏ ᴜɪ',
                serverMessageId: 143
            },
            forwardingScore: 999,
            externalAdReply: {
                title: "ɴᴊᴀʙᴜʟᴏ ᴜɪ",
                body: externalBody,
                thumbnailUrl: config.FANAIMG,
                sourceUrl: config.NJABULOURL,
                mediaType: 1,
                renderSmallThumbnail: true
            }
        }
    }, { quoted: {
        key: {
            fromMe: false,
            participant: `0@s.whatsapp.net`,
            remoteJid: "status@broadcast"
        },
        message: {
            contactMessage: {
                displayName: userName,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${userName};USER;;;\nFN:${userName}\nitem1.TEL;waid=${sender?.split('@')[0] || '0'}:${sender?.split('@')[0] || '0'}\nitem1.X-ABLabel:User\nEND:VCARD`
            }
        }
    } });
}

// Anti-Link System
const linkPatterns = [
  /https?:\/\/(?:chat\.whatsapp\.com|wa\.me)\/\S+/gi,
  /^https?:\/\/(www\.)?whatsapp\.com\/channel\/([a-zA-Z0-9_-]+)$/,
  /wa\.me\/\S+/gi,
  /https?:\/\/(?:t\.me|telegram\.me)\/\S+/gi,
  /https?:\/\/(?:www\.)?youtube\.com\/\S+/gi,
  /https?:\/\/youtu\.be\/\S+/gi,
  /https?:\/\/(?:www\.)?facebook\.com\/\S+/gi,
  /https?:\/\/fb\.me\/\S+/gi,
  /https?:\/\/(?:www\.)?instagram\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?twitter\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?tiktok\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?linkedin\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?snapchat\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?pinterest\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?reddit\.com\/\S+/gi,
  /https?:\/\/ngl\/\S+/gi,
  /https?:\/\/(?:www\.)?discord\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?twitch\.tv\/\S+/gi,
  /https?:\/\/(?:www\.)?vimeo\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?dailymotion\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?medium\.com\/\S+/gi
];

// Anti-Link - No 'name' property needed because it's an event-based command
fana({
    on: "body",  // Triggers on every message
    fromMe: false,
    filename: __filename
}, async (conn, mek, args, { from, body, sender, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        // Check conditions: is group, user is not admin, bot is admin
        if (!isGroup || isAdmins || !isBotAdmins) {
            return;
        }

        const containsLink = linkPatterns.some(pattern => pattern.test(body));

        if (containsLink && config.ANTI_LINK_KICK === 'true') {
            // Delete the message with link
            await conn.sendMessage(from, { delete: mek.key });
            
            // Send warning message with contextInfo format
            const warningText = `⚠️ *LINKS ARE NOT ALLOWED IN THIS GROUP* ⚠️\n\n📌 @${sender.split('@')[0]} has been removed for sending a link.\n\n🚫 *Reason:* Anti-link protection is enabled.\n\n🔗 *Detected Link:* ${body.substring(0, 100)}...`;
            
            await sendFormattedMessage(conn, from, warningText, sender, 'warning');
            
            // Add reaction
            await conn.sendMessage(from, { react: { text: "🚫", key: mek.key } });
            
            // Remove the user from group
            await conn.groupParticipantsUpdate(from, [sender], "remove");
        }
    } catch (error) {
        console.error("Anti-Link Error:", error);
        const errorText = `❌ An error occurred while processing the anti-link system.\n\n📡 *Error Details:* ${error.message}`;
        await sendFormattedMessage(conn, from, errorText, sender, 'error');
    }
});
