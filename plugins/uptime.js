const { cmd } = require('../command');
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
                    body: externalBody || "Bot Uptime",
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
    pattern: "uptime",
    alias: ["runtime", "up", "alive"],
    desc: "Show bot uptime with stylish formats",
    category: "main",
    react: "⏱️",
    filename: __filename
},
async (conn, mek, m, { from, reply, sender, pushname }) => {
    try {
        const uptime = runtime(process.uptime());
        const startTime = new Date(Date.now() - process.uptime() * 1000);
        
        // Style 1: Clean Emoji
        const style1 = `⏱️ *BOT UPTIME* ⏱️

🟢 Online for: ${uptime}
📅 Started: ${startTime.toLocaleString()}

✅ *Bot is running smoothly!*`;

        // Style 2: Simple Info
        const style2 = `⏱️ *UPTIME STATUS* ⏱️

⏳ Runtime: ${uptime}
🕒 Since: ${startTime.toLocaleTimeString()}
📅 Date: ${startTime.toLocaleDateString()}

✅ *All systems operational*`;

        // Style 3: Minimal
        const style3 = `⏱️ *UPTIME* ⏱️

${uptime}

Started: ${startTime.toLocaleString()}

✅ *Active and ready!*`;

        // Style 4: Clean Box
        const style4 = `⏱️ *UPTIME INFORMATION* ⏱️

⚡ Status: Online
🕐 Runtime: ${uptime}
🚀 Started: ${startTime.toLocaleString()}
📊 Stability: 100%

✅ *Bot is active!*`;

        // Style 5: Professional
        const style5 = `⏱️ *UPTIME REPORT* ⏱️

◈ Duration: ${uptime}
◈ Start Time: ${startTime.toLocaleString()}
◈ Stability: 100%

✅ *Bot is running perfectly!*`;

        // Style 6: Social Media Style
        const style6 = `⏱️ *Uptime Update* ⏱️

🟢 Online for: ${uptime}
📅 Since: ${startTime.toLocaleString()}

✅ *Enjoying the service!*`;

        // Style 7: Minimalist
        const style7 = `⏱️ *RUNTIME* ⏱️

${uptime}

Started: ${startTime.toLocaleDateString()}

✅ *Active and ready!*`;

        // Style 8: Clean and Simple
        const style8 = `⏱️ *UPTIME STATUS* ⏱️

🔹 Runtime: ${uptime}
🔹 Started: ${startTime.toLocaleString()}

✅ *Bot is online!*`;

        // Style 9: Modern
        const style9 = `⏱️ *BOT STATUS* ⏱️

✨ Uptime: ${uptime}
✨ Since: ${startTime.toLocaleString()}

✅ *All systems go!*`;

        // Style 10: Friendly
        const style10 = `⏱️ *UPTIME* ⏱️

🎯 Online: ${uptime}
🎯 Since: ${startTime.toLocaleString()}

✅ *Bot is active and waiting for commands!*`;

        const styles = [style1, style2, style3, style4, style5, style6, style7, style8, style9, style10];
        const selectedStyle = styles[Math.floor(Math.random() * styles.length)];

        await sendFormattedMessage(
            conn, 
            from, 
            selectedStyle, 
            sender, 
            pushname,
            "Bot Uptime",
            uptime
        );

    } catch (e) {
        console.error("Uptime Error:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error:* ${e.message}`, 
            sender, 
            pushname,
            "Uptime - Error",
            "Something went wrong"
        );
    }
});
