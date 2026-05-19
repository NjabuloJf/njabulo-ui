const { cmd, commands } = require('../command');
const { fetchJson } = require('../lib/functions');
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
                    body: externalBody || "API Fetcher",
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
    pattern: "fetch",
    alias: ["get", "api", "apifetch"],
    desc: "Fetch data from a provided URL or API",
    category: "main",
    react: "🌐",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, args, reply, sender, pushname }) => {
    try {
        const q = args.join(' ').trim();
        if (!q) {
            await sendFormattedMessage(
                conn, 
                from, 
                "🌐 *Please provide a valid URL or API endpoint*\n\n📌 *Usage:* .fetch https://api.example.com/data\n🔍 *Example:* .fetch https://api.github.com/users/NjabuloJf", 
                sender, 
                pushname,
                "API Fetcher - Error",
                "No URL"
            );
            return;
        }

        if (!/^https?:\/\//.test(q)) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *URL must start with http:// or https://*", 
                sender, 
                pushname,
                "API Fetcher - Error",
                "Invalid URL"
            );
            return;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `🌐 *Fetching data from URL...*\n\n🔗 *URL:* ${q}\n⏳ Please wait!`, 
            sender, 
            pushname,
            "API Fetcher",
            "Fetching"
        );

        const data = await fetchJson(q);
        const content = JSON.stringify(data, null, 2);
        
        // Truncate if too long
        let truncatedContent = content;
        let truncated = false;
        if (truncatedContent.length > 3500) {
            truncatedContent = content.substring(0, 3000) + "\n\n... [Data truncated - too large]";
            truncated = true;
        }

        const message = `🌐 *API RESPONSE* 🌐

🔗 *URL:* ${q}
📦 *Data Size:* ${(content.length / 1024).toFixed(2)} KB
${truncated ? "⚠️ *Preview truncated* (response too large)\n\n" : "\n"}\`\`\`json
${truncatedContent}
\`\`\`

✅ *Data fetched successfully!*`;

        await sendFormattedMessage(
            conn, 
            from, 
            message, 
            sender, 
            pushname,
            "API Response",
            `${(content.length / 1024).toFixed(2)} KB`
        );

    } catch (e) {
        console.error("Error in fetch command:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *An error occurred:*\n\n${e.message}`, 
            sender, 
            pushname,
            "API Fetcher - Error",
            "Request failed"
        );
    }
});
