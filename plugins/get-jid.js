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
                    body: externalBody || "JID Viewer",
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
    pattern: "jid",
    alias: ["id", "chatid", "gjid", "getjid"],  
    desc: "Get full JID of current chat/user (Creator Only)",
    react: "🆔",
    category: "utility",
    filename: __filename,
}, async (conn, mek, m, { 
    from, isGroup, isCreator, reply, sender, pushname 
}) => {
    try {
        if (!isCreator) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Command Restricted*\n\nOnly my creator can use this command.", 
                sender, 
                pushname,
                "JID Viewer - Access Denied",
                "Owner only command"
            );
            return;
        }

        if (isGroup) {
            const groupJID = from.includes('@g.us') ? from : `${from}@g.us`;
            const message = `🆔 *GROUP JID INFORMATION* 🆔

📌 *Type:* Group Chat
🆔 *JID:* 
\`${groupJID}\`

💡 *Usage:* Use this JID for group-specific operations

✅ *Copy the JID above to use in other commands*`;

            await sendFormattedMessage(
                conn, 
                from, 
                message, 
                sender, 
                pushname,
                "Group JID Viewer",
                "Group ID fetched"
            );
        } else {
            const userJID = sender.includes('@s.whatsapp.net') ? sender : `${sender}@s.whatsapp.net`;
            const message = `🆔 *USER JID INFORMATION* 🆔

📌 *Type:* Private Chat
👤 *User:* ${pushname || sender.split('@')[0]}
🆔 *JID:* 
\`${userJID}\`

💡 *Usage:* Use this JID for user-specific operations

✅ *Copy the JID above to use in other commands*`;

            await sendFormattedMessage(
                conn, 
                from, 
                message, 
                sender, 
                pushname,
                "User JID Viewer",
                "User ID fetched"
            );
        }

    } catch (e) {
        console.error("JID Error:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            `⚠️ *Error fetching JID*\n\n${e.message}\n\nPlease try again later.`, 
            sender, 
            pushname,
            "JID Viewer - Error",
            "Request failed"
        );
    }
});
