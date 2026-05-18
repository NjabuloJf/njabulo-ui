const { fana } = require('../njabulo');
const config = require("../config");

// Initialize warnings if not exists
if (!global.warnings) {
    global.warnings = {};
}

// Helper function to send formatted messages
async function sendFormattedMessage(conn, from, text, sender, type = 'warning', warningCount = 0) {
    const userName = sender?.split('@')[0] || "User";
    const bodyText = type === 'warning' ? `⚠️ Warning ${warningCount}/3` : type === 'success' ? '✅ Success' : '❌ Error';
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

// List of link patterns to detect
const linkPatterns = [
    /https?:\/\/(?:chat\.whatsapp\.com|wa\.me)\/\S+/gi,
    /https?:\/\/(?:api\.whatsapp\.com|wa\.me)\/\S+/gi,
    /wa\.me\/\S+/gi,
    /https?:\/\/(?:t\.me|telegram\.me)\/\S+/gi,
    /https?:\/\/(?:www\.)?\.com\/\S+/gi,
    /https?:\/\/(?:www\.)?twitter\.com\/\S+/gi,
    /https?:\/\/(?:www\.)?linkedin\.com\/\S+/gi,
    /https?:\/\/(?:whatsapp\.com|channel\.me)\/\S+/gi,
    /https?:\/\/(?:www\.)?reddit\.com\/\S+/gi,
    /https?:\/\/(?:www\.)?discord\.com\/\S+/gi,
    /https?:\/\/(?:www\.)?twitch\.tv\/\S+/gi,
    /https?:\/\/(?:www\.)?vimeo\.com\/\S+/gi,
    /https?:\/\/(?:www\.)?dailymotion\.com\/\S+/gi,
    /https?:\/\/(?:www\.)?medium\.com\/\S+/gi,
    /https?:\/\/(?:www\.)?youtube\.com\/\S+/gi,
    /https?:\/\/youtu\.be\/\S+/gi,
    /https?:\/\/(?:www\.)?facebook\.com\/\S+/gi,
    /https?:\/\/fb\.me\/\S+/gi,
    /https?:\/\/(?:www\.)?instagram\.com\/\S+/gi,
    /https?:\/\/(?:www\.)?tiktok\.com\/\S+/gi,
    /https?:\/\/(?:www\.)?pinterest\.com\/\S+/gi,
    /https?:\/\/ngl\/\S+/gi
];

// Anti-Link System with Warnings
fana({
    on: "body",
    fromMe: false,
    filename: __filename
}, async (conn, mek, args, { from, body, sender, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        // Only act in groups where bot is admin and sender isn't admin
        if (!isGroup || isAdmins || !isBotAdmins) {
            return;
        }

        // Check if message contains any forbidden links
        const containsLink = linkPatterns.some(pattern => pattern.test(body));

        // Only proceed if anti-link is enabled and link is detected
        if (containsLink && config.ANTI_LINK === 'true') {
            console.log(`Link detected from ${sender}: ${body}`);

            // Add reaction
            await conn.sendMessage(from, { react: { text: "🚫", key: mek.key } });

            // Try to delete the message
            try {
                await conn.sendMessage(from, { delete: mek.key });
                console.log(`Message deleted: ${mek.key.id}`);
            } catch (error) {
                console.error("Failed to delete message:", error);
            }

            // Update warning count for user
            global.warnings[sender] = (global.warnings[sender] || 0) + 1;
            const warningCount = global.warnings[sender];
            const maxWarnings = 3;

            // Handle warnings
            if (warningCount < maxWarnings) {
                // Send warning message with contextInfo format
                const warningText = `⚠️ *LINKS ARE NOT ALLOWED* ⚠️\n\n` +
                    `👤 *User:* @${sender.split('@')[0]}\n` +
                    `⚠️ *Warning:* ${warningCount}/${maxWarnings}\n` +
                    `📌 *Reason:* Sending links\n` +
                    `🔗 *Detected Link:* ${body.substring(0, 80)}${body.length > 80 ? '...' : ''}\n\n` +
                    `❌ *Next violation will result in removal from the group!*`;
                
                await sendFormattedMessage(conn, from, warningText, sender, 'warning', warningCount);
                
            } else {
                // Remove user if they exceed warning limit
                const kickText = `🚫 *USER REMOVED FROM GROUP* 🚫\n\n` +
                    `👤 @${sender.split('@')[0]} *has been removed*\n` +
                    `⚠️ *Reason:* Warning limit exceeded (${maxWarnings}/3)\n` +
                    `📌 *Final Violation:* Link detected\n\n` +
                    `🔒 *Anti-link protection is active in this group*`;
                
                await sendFormattedMessage(conn, from, kickText, sender, 'error');
                
                // Remove user from group
                await conn.groupParticipantsUpdate(from, [sender], "remove");
                
                // Clear warnings for this user
                delete global.warnings[sender];
                
                // Add kick reaction
                await conn.sendMessage(from, { react: { text: "👋", key: mek.key } });
            }
        }
    } catch (error) {
        console.error("Anti-link error:", error);
        const errorText = `❌ An error occurred while processing the anti-link system.\n\n📡 *Error Details:* ${error.message}`;
        await sendFormattedMessage(conn, from, errorText, sender, 'error');
    }
});
