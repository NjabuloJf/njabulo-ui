const axios = require('axios');
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
                    body: externalBody || "TempMail Service",
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
    pattern: "tempmail",
    alias: ["genmail", "tempemail", "tempmailgen"],
    desc: "Generate a new temporary email address",
    category: "utility",
    react: "📧",
    filename: __filename
},
async (conn, mek, m, { from, reply, prefix, sender, pushname }) => {
    try {
        await sendFormattedMessage(
            conn, 
            from, 
            "📧 *Generating temporary email...*\n\n⏳ Please wait!", 
            sender, 
            pushname,
            "TempMail",
            "Generating email"
        );

        const response = await axios.get('https://apis.davidcyriltech.my.id/temp-mail', { timeout: 15000 });
        const { email, session_id, expires_at } = response.data;

        const expiresDate = new Date(expires_at);
        const timeString = expiresDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        const dateString = expiresDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const message = `📧 *TEMPORARY EMAIL GENERATED*

✉️ *Email Address:*
${email}

⏳ *Expires:*
${timeString} • ${dateString}

🔑 *Session ID:*
${session_id}

📥 *To check inbox:*
.inbox ${session_id}

━━━━━━━━━━━━━━━━
⚠️ *Email will expire after 24 hours*`;

        await sendFormattedMessage(
            conn, 
            from, 
            message, 
            sender, 
            pushname,
            "TempMail",
            email
        );

    } catch (e) {
        console.error('TempMail error:', e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error:* ${e.message}`, 
            sender, 
            pushname,
            "TempMail - Error",
            "Generation failed"
        );
    }
});

cmd({
    pattern: "checkmail",
    alias: ["inbox", "tmail", "mailinbox", "checkinbox"],
    desc: "Check your temporary email inbox",
    category: "utility",
    react: "📬",
    filename: __filename
},
async (conn, mek, m, { from, reply, args, sender, pushname }) => {
    try {
        const sessionId = args[0];
        if (!sessionId) {
            await sendFormattedMessage(
                conn, 
                from, 
                "📬 *Please provide your session ID*\n\n📌 *Usage:* .inbox YOUR_SESSION_ID\n\n💡 *Get a session ID from .tempmail first*", 
                sender, 
                pushname,
                "Check Mail - Error",
                "No session ID"
            );
            return;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            "📬 *Checking inbox...*\n\n⏳ Please wait!", 
            sender, 
            pushname,
            "Check Mail",
            "Fetching messages"
        );

        const inboxUrl = `https://apis.davidcyriltech.my.id/temp-mail/inbox?id=${encodeURIComponent(sessionId)}`;
        const response = await axios.get(inboxUrl, { timeout: 15000 });

        if (!response.data.success) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Invalid session ID or expired email*\n\nPlease generate a new temporary email with .tempmail", 
                sender, 
                pushname,
                "Check Mail - Error",
                "Invalid session"
            );
            return;
        }

        const { inbox_count, messages } = response.data;

        if (inbox_count === 0) {
            await sendFormattedMessage(
                conn, 
                from, 
                "📭 *Your inbox is empty*\n\nNo messages found. Check again later.", 
                sender, 
                pushname,
                "Check Mail",
                "Empty inbox"
            );
            return;
        }

        let messageList = `📬 *INBOX (${inbox_count} messages)* 📬\n\n`;
        
        for (let i = 0; i < Math.min(messages.length, 5); i++) {
            const msg = messages[i];
            messageList += `📌 *Message ${i + 1}*
👤 *From:* ${msg.from}
📝 *Subject:* ${msg.subject}
⏰ *Date:* ${new Date(msg.date).toLocaleString()}

📄 *Content:*
${msg.body.substring(0, 500)}${msg.body.length > 500 ? '...' : ''}

━━━━━━━━━━━━━━━━\n\n`;
        }

        if (messages.length > 5) {
            messageList += `⚠️ *Showing first 5 of ${inbox_count} messages*`;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            messageList, 
            sender, 
            pushname,
            "TempMail Inbox",
            `${inbox_count} messages`
        );

    } catch (e) {
        console.error('CheckMail error:', e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error checking inbox:* ${e.response?.data?.message || e.message}`, 
            sender, 
            pushname,
            "Check Mail - Error",
            "Request failed"
        );
    }
});
