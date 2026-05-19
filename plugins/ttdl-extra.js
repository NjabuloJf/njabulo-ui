const { cmd } = require('../command');
const fetch = require('node-fetch');
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
                    body: externalBody || "TikTok Downloader",
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
    pattern: "tiktok2",
    alias: ["tt2", "tiktokdl2", "ttdown2", "tiktokvid2", "ttdl"],
    desc: "Download TikTok videos using a link.",
    category: "downloader",
    filename: __filename
},
async (conn, mek, m, { from, args, quoted, reply, sender, pushname }) => {
    try {
        // Validate input
        if (!args[0]) {
            await sendFormattedMessage(
                conn, 
                from, 
                "📱 *Please provide a TikTok video link*\n\n📌 *Usage:* .tiktok2 https://vm.tiktok.com/xxxxx\n🔍 *Example:* .tt2 https://www.tiktok.com/@user/video/123456789", 
                sender, 
                pushname,
                "TikTok Downloader - Error",
                "No link"
            );
            return;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            "📱 *Fetching video details...*\n\n⏳ Please wait.", 
            sender, 
            pushname,
            "TikTok Downloader",
            "Fetching data"
        );

        const res = await fetch(`https://darkcore-api.onrender.com/api/tiktok?url=${encodeURIComponent(args[0])}`, { timeout: 30000 });
        if (!res.ok) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Unable to fetch data*\n\nPlease try again later.", 
                sender, 
                pushname,
                "TikTok Downloader - Error",
                "Fetch failed"
            );
            return;
        }

        const data = await res.json();
        if (!data.success) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Failed to fetch video*\n\nPlease check the link and try again.\n\n📌 Make sure the video is public.", 
                sender, 
                pushname,
                "TikTok Downloader - Error",
                "Invalid link"
            );
            return;
        }

        const { author, titulo, thumbanail, mp4, mp3 } = data.result;

        const caption = `📱 *TIKTOK DOWNLOADER* 📱

📖 *Title:* ${titulo}
👤 *Author:* ${author}

━━━━━━━━━━━━━━━━

📌 *Reply with your choice:*

1️⃣ *Video* 🎥
2️⃣ *Audio* 🎵

━━━━━━━━━━━━━━━━
✅ *Choose an option above*`;

        const menuMsg = await conn.sendMessage(from, {
            image: { url: thumbanail },
            caption: caption
        }, { quoted: mek });

        // Wait for the user to reply with the option
        conn.ev.on('messages.upsert', async (msgUpdate) => {
            const msg = msgUpdate.messages[0];
            if (!msg.message || !msg.message.extendedTextMessage) return;

            const userReply = msg.message.extendedTextMessage.text.trim();

            // Ensure the user reply references the correct message
            if (msg.message.extendedTextMessage.contextInfo && msg.message.extendedTextMessage.contextInfo.stanzaId === menuMsg.key.id) {
                if (userReply === '1') {
                    await sendFormattedMessage(
                        conn, 
                        from, 
                        "🎥 *Sending video...*\n\n⏳ Please wait!", 
                        sender, 
                        pushname,
                        "TikTok Downloader",
                        "Sending video"
                    );
                    
                    await conn.sendMessage(from, {
                        video: { url: mp4 },
                        caption: "🎥 *Here is your TikTok video!*\n\n✅ Downloaded successfully!"
                    }, { quoted: mek });
                    
                } else if (userReply === '2') {
                    await sendFormattedMessage(
                        conn, 
                        from, 
                        "🎵 *Sending audio...*\n\n⏳ Please wait!", 
                        sender, 
                        pushname,
                        "TikTok Downloader",
                        "Sending audio"
                    );
                    
                    await conn.sendMessage(from, {
                        audio: { url: mp3 },
                        mimetype: 'audio/mpeg',
                        caption: "🎵 *Here is the extracted audio!*\n\n✅ Downloaded successfully!"
                    }, { quoted: mek });
                    
                } else {
                    await sendFormattedMessage(
                        conn, 
                        from, 
                        "❌ *Invalid option*\n\nPlease reply with `1` for video or `2` for audio.", 
                        sender, 
                        pushname,
                        "TikTok Downloader - Error",
                        "Invalid choice"
                    );
                }
            }
        });

    } catch (error) {
        console.error(error);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *An error occurred*\n\n${error.message}\n\nPlease try again later.`, 
            sender, 
            pushname,
            "TikTok Downloader - Error",
            "Request failed"
        );
    }
});
