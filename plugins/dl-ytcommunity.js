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
                    body: externalBody || "YouTube Community Downloader",
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
    pattern: "ytpost",
    alias: ["ytcommunity", "ytc"],
    desc: "Download a YouTube community post",
    category: "downloader",
    react: "🎥",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react, sender, pushname }) => {
    try {
        if (!q) {
            await sendFormattedMessage(
                conn, 
                from, 
                "📢 *Please provide a YouTube community post URL*\n\n📌 *Usage:* .ytpost <url>\n🔍 *Example:* .ytpost https://www.youtube.com/post/xxxx", 
                sender, 
                pushname,
                "YouTube Post - Missing URL",
                "No URL provided"
            );
            return;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            "📥 *Fetching YouTube community post...*\n\n⏳ Please wait while we download the post content.", 
            sender, 
            pushname,
            "YouTube Post Downloader",
            "Fetching post..."
        );

        const apiUrl = `https://api.siputzx.my.id/api/d/ytpost?url=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl, { timeout: 20000 });

        if (!data.status || !data.data) {
            await react("❌");
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Failed to fetch community post*\n\nPlease check the URL and try again.\n\n📌 Make sure the post is public.", 
                sender, 
                pushname,
                "YouTube Post - Error",
                "Post not found"
            );
            return;
        }

        const post = data.data;
        
        let caption = `📢 *YOUTUBE COMMUNITY POST* 📢

📜 *Content:*
${post.content}

━━━━━━━━━━━━━━━━
✅ *Post fetched successfully*`;

        if (post.images && post.images.length > 0) {
            for (let i = 0; i < post.images.length; i++) {
                const img = post.images[i];
                if (i === 0) {
                    await conn.sendMessage(from, { 
                        image: { url: img }, 
                        caption: caption 
                    }, { quoted: mek });
                } else {
                    await conn.sendMessage(from, { 
                        image: { url: img }, 
                        caption: `📸 *Image ${i+1}/${post.images.length}*`
                    }, { quoted: mek });
                }
                // Add delay between images
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } else {
            await conn.sendMessage(from, { text: caption }, { quoted: mek });
        }

        await react("✅");
        
        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *Post sent successfully!*\n\n📢 Content downloaded and sent to chat.`, 
            sender, 
            pushname,
            "YouTube Post - Complete",
            "Post delivered"
        );
        
    } catch (e) {
        console.error("Error in ytpost command:", e);
        await react("❌");
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *An error occurred*\n\n⚠️ ${e.message || "Failed to fetch YouTube community post"}\n\nPlease try again later.`, 
            sender, 
            pushname,
            "YouTube Post - Error",
            "Request failed"
        );
    }
});
