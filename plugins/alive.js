const { cmd } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');
const config = require('../config');

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
                    body: externalBody || "Bot Status",
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
        // Fallback to simple message if formatted fails
        await conn.sendMessage(from, { text: text });
    }
}

cmd({
    pattern: "alive",
    alias: ["status", "online", "a"],
    desc: "Check bot is active or not",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply, pushname }) => {
    try {
        const status = `
╭───〔 *${config.BOT_NAME}* 〕───◉
│✨ *Bot is Active & Online!*
│
│🧠 *Owner:* ${config.OWNER_NAME}
│⚡ *Version:* 5.0.0 Pro
│📝 *Prefix:* ${config.PREFIX}
│📳 *Mode:* ${config.MODE}
│💾 *RAM:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB
│🖥️ *Host:* ${os.hostname()}
│⌛ *Uptime:* ${runtime(process.uptime())}
╰────────────────────◉`;

        // Send formatted message
        await sendFormattedMessage(
            conn, 
            from, 
            status, 
            sender, 
            pushname,
            `${config.BOT_NAME} - Online`,
            "Bot Status Information"
        );

    } catch (e) {
        console.error("Alive Error:", e);
        // Send error as formatted message too
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error:* ${e.message}`, 
            sender, 
            pushname,
            "Bot Error",
            "Something went wrong"
        );
    }
});
