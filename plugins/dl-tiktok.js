const { cmd } = require('../command');
const axios = require('axios');
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
    pattern: "tiktok",
    alias: ["ttdl", "tt", "tiktokdl"],
    desc: "Download TikTok video without watermark",
    category: "downloader",
    react: "🎵",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, sender, pushname }) => {
    try {
        if (!q) {
            await sendFormattedMessage(
                conn, 
                from, 
                "📱 *Please provide a TikTok video link*\n\n📌 *Usage:* .tiktok https://vm.tiktok.com/xxxx\n\n🔍 *Example:* .tiktok https://www.tiktok.com/@user/video/123456789", 
                sender, 
                pushname,
                "TikTok Downloader - Missing Link",
                "No URL provided"
            );
            return;
        }
        
        if (!q.includes("tiktok.com")) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Invalid TikTok link*\n\nPlease provide a valid TikTok video link.\n\n📌 *Example:* .tiktok https://vm.tiktok.com/xxxx", 
                sender, 
                pushname,
                "TikTok Downloader - Invalid Link",
                "Not a TikTok URL"
            );
            return;
        }
        
        await sendFormattedMessage(
            conn, 
            from, 
            "📥 *Downloading TikTok video...*\n\n⏳ Please wait while we fetch your video.\n\n🎵 *No watermark video incoming!*", 
            sender, 
            pushname,
            "TikTok Downloader",
            "Processing video..."
        );
        
        const apiUrl = `https://delirius-apiofc.vercel.app/download/tiktok?url=${q}`;
        const { data } = await axios.get(apiUrl, { timeout: 30000 });
        
        if (!data.status || !data.data) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Failed to fetch TikTok video*\n\nPlease check the link or try again later.\n\n📌 Make sure the video is public.", 
                sender, 
                pushname,
                "TikTok Downloader - Error",
                "Video not found"
            );
            return;
        }
        
        const { title, like, comment, share, author, meta } = data.data;
        const videoUrl = meta.media.find(v => v.type === "video").org;
        
        const caption = `🎵 *TIKTOK VIDEO* 🎵

👤 *User:* ${author.nickname} (@${author.username})

📖 *Title:* ${title}

👍 *Likes:* ${like}
💬 *Comments:* ${comment}
🔁 *Shares:* ${share}

━━━━━━━━━━━━━━━━
✅ *No Watermark Video*`;

        await conn.sendMessage(from, {
            video: { url: videoUrl },
            caption: caption,
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: mek });
        
        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *Video sent successfully!*\n\n🎵 *Title:* ${title}\n👤 *Author:* @${author.username}\n\nEnjoy your TikTok video!`, 
            sender, 
            pushname,
            "TikTok Downloader - Complete",
            "Video delivered"
        );
        
    } catch (e) {
        console.error("Error in TikTok downloader command:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *An error occurred*\n\n⚠️ ${e.message || "Failed to download TikTok video"}\n\nPlease try again later.`, 
            sender, 
            pushname,
            "TikTok Downloader - Error",
            "Request failed"
        );
    }
});
