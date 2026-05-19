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
                    body: externalBody || "Report System",
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
    pattern: "report",
    alias: ["ask", "bug", "request", "feedback"],
    desc: "Report a bug or request a feature",
    category: "utility",
    filename: __filename
}, async (conn, mek, m, {
    from, body, command, args, senderNumber, reply, sender, pushname
}) => {
    try {
        const botOwner = conn.user.id.split(":")[0];
        if (senderNumber !== botOwner) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Only the bot owner can use this command.*", 
                sender, 
                pushname,
                "Report - Access Denied",
                "Owner only"
            );
            return;
        }
        
        if (!args.length) {
            await sendFormattedMessage(
                conn, 
                from, 
                `📝 *Please provide a report or request*\n\n📌 *Example:* ${config.PREFIX}report Play command is not working`, 
                sender, 
                pushname,
                "Report - Error",
                "No message"
            );
            return;
        }

        const reportedMessages = {};
        const devNumber = "26777821911";
        const messageId = mek.key.id;

        if (reportedMessages[messageId]) {
            await sendFormattedMessage(
                conn, 
                from, 
                "⚠️ *This report has already been forwarded to the owner.*\n\nPlease wait for a response.", 
                sender, 
                pushname,
                "Report - Warning",
                "Duplicate"
            );
            return;
        }
        
        reportedMessages[messageId] = true;

        await sendFormattedMessage(
            conn, 
            from, 
            "📝 *Forwarding your report to the owner...*\n\n⏳ Please wait!", 
            sender, 
            pushname,
            "Report",
            "Forwarding"
        );

        const reportText = `📝 *REPORT/BUG REPORT* 📝

👤 *User:* @${mek.sender.split("@")[0]}
📋 *Report/Bug:* ${args.join(" ")}

━━━━━━━━━━━━━━━━
⏰ *Report submitted*`;

        await conn.sendMessage(`${devNumber}@s.whatsapp.net`, {
            text: reportText,
            mentions: [mek.sender]
        }, { quoted: mek });

        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *Your request has been forwarded to the owner!*\n\n👤 *User:* ${pushname || "User"}\n📋 *Report:* ${args.join(" ")}\n\nPlease wait for a response.`, 
            sender, 
            pushname,
            "Report - Success",
            "Report sent"
        );
        
    } catch (error) {
        console.error(error);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *An error occurred:* ${error.message}`, 
            sender, 
            pushname,
            "Report - Error",
            "Command failed"
        );
    }
});
