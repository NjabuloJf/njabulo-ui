const { cmd } = require("../command");
const fetch = require("node-fetch");
const axios = require("axios");
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
                    body: externalBody || "URL Shortener",
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
    pattern: "tiny",
    alias: ['short', 'shorturl', 'shorten'],
    react: "🫧",
    desc: "Makes URL tiny.",
    category: "convert",
    use: "<url>",
    filename: __filename,
},
async (conn, mek, m, { from, quoted, isOwner, isAdmins, reply, args, sender, pushname }) => {
    try {
        if (!args[0]) {
            await sendFormattedMessage(
                conn, 
                from, 
                "🔗 *Please provide a URL to shorten*\n\n📌 *Usage:* .tiny https://example.com\n🔍 *Example:* .tiny https://www.google.com", 
                sender, 
                pushname,
                "URL Shortener - Error",
                "No URL"
            );
            return;
        }

        const link = args[0];
        
        // Validate URL format
        if (!link.match(/^https?:\/\//i)) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Invalid URL format*\n\nURL must start with http:// or https://", 
                sender, 
                pushname,
                "URL Shortener - Error",
                "Invalid URL"
            );
            return;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `🔗 *Shortening URL...*\n\n🌐 *Original:* ${link}\n⏳ Please wait!`, 
            sender, 
            pushname,
            "URL Shortener",
            "Shortening"
        );

        const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(link)}`, { timeout: 10000 });
        const shortenedUrl = response.data;

        const message = `🔗 *SHORTENED URL* 🔗

🌐 *Original URL:* ${link}

🫧 *Shortened URL:*
${shortenedUrl}

━━━━━━━━━━━━━━━━
✅ *URL shortened successfully!*`;

        await sendFormattedMessage(
            conn, 
            from, 
            message, 
            sender, 
            pushname,
            "URL Shortener",
            "Link shortened"
        );

    } catch (e) {
        console.error("Error shortening URL:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *An error occurred while shortening the URL*\n\nPlease try again later.", 
            sender, 
            pushname,
            "URL Shortener - Error",
            "Request failed"
        );
    }
});
