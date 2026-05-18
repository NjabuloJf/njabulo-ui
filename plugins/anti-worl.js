const { fana } = require('../njabulo');
const config = require("../config");

// Helper function to send formatted messages
async function sendFormattedMessage(conn, from, text, sender, type = 'warning') {
    const userName = sender.split('@')[0] || "User";
    const bodyText = type === 'warning' ? '⚠️ Warning Message' : '📢 System Message';
    const externalBody = type === 'warning' ? '🚫 Bad Words Not Allowed' : '📢 System Notification';
    
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
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${userName};USER;;;\nFN:${userName}\nitem1.TEL;waid=${sender.split('@')[0]}:${sender.split('@')[0]}\nitem1.X-ABLabel:User\nEND:VCARD`
            }
        }
    } });
}

// Anti-Bad Words System
fana({
    name: "antiword",
    on: "body",
    fromMe: false,
    filename: __filename
}, async (conn, mek, args, { from, body, isGroup, isAdmins, isBotAdmins, reply, sender }) => {
    try {
        const badWords = ["wtf", "mia", "xxx", "fuck", "sex", "huththa", "pakaya", "ponnaya", "hutto", "bitch", "shit", "asshole", "damn"];

        // Check conditions
        if (!isGroup || isAdmins || !isBotAdmins) {
            return;
        }

        const messageText = body.toLowerCase();
        const containsBadWord = badWords.some(word => messageText.includes(word));

        if (containsBadWord && config.ANTI_BAD_WORD === "true") {
            // Delete the bad word message
            await conn.sendMessage(from, { delete: mek.key });
            
            // Send warning message with contextInfo format
            const warningText = `🚫 *⚠️ BAD WORDS NOT ALLOWED ⚠️* 🚫\n\n📌 *Warning:* Using inappropriate language is prohibited in this group.\n\n👮 Your message has been deleted. Please maintain a respectful environment.`;
            await sendFormattedMessage(conn, from, warningText, sender, 'warning');
            
            // Optional: Send a reaction
            await conn.sendMessage(from, { react: { text: "🚫", key: mek.key } });
        }
    } catch (error) {
        console.error("Anti-Bad Words Error:", error);
        const errorText = `❌ An error occurred while processing the anti-bad word system.\n\n📡 *Error Details:* ${error.message}`;
        await sendFormattedMessage(conn, from, errorText, sender, 'warning');
    }
}); 
