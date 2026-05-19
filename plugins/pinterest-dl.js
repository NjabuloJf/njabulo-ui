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
                    body: externalBody || "Pinterest Downloader",
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
    pattern: "pindl",
    alias: ["pinterestdl", "pin", "pins", "pindownload", "pinterest"],
    desc: "Download media from Pinterest",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { args, quoted, from, reply, sender, pushname }) => {
    try {
        // Make sure the user provided the Pinterest URL
        if (args.length < 1) {
            await sendFormattedMessage(
                conn, 
                from, 
                "📌 *Please provide a Pinterest URL*\n\n📌 *Usage:* .pindl https://pin.it/xxxxx\n🔍 *Example:* .pindl https://www.pinterest.com/pin/123456789", 
                sender, 
                pushname,
                "Pinterest Downloader - Error",
                "No URL"
            );
            return;
        }

        const pinterestUrl = args[0];

        await sendFormattedMessage(
            conn, 
            from, 
            `📌 *Fetching Pinterest media...*\n\n🔗 *URL:* ${pinterestUrl.substring(0, 50)}...\n⏳ Please wait!`, 
            sender, 
            pushname,
            "Pinterest Downloader",
            "Fetching media"
        );

        // Call your Pinterest download API
        const response = await axios.get(`https://api.giftedtech.web.id/api/download/pinterestdl?apikey=gifted&url=${encodeURIComponent(pinterestUrl)}`, { timeout: 30000 });

        if (!response.data.success) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Failed to fetch data from Pinterest*\n\nPlease check the URL and try again.", 
                sender, 
                pushname,
                "Pinterest Downloader - Error",
                "Fetch failed"
            );
            return;
        }

        const media = response.data.result.media;
        const description = response.data.result.description || 'No description';
        const title = response.data.result.title || 'No title';

        // Find the best quality video or image
        const videoUrl = media.find(item => item.type && (item.type.includes('720p') || item.type.includes('1080p')))?.download_url || media.find(item => item.download_url)?.download_url;
        
        // Find thumbnail image
        const thumbnailUrl = media.find(item => item.type === 'Thumbnail')?.download_url || null;

        const infoMessage = `📌 *PINTEREST DOWNLOADER* 📌

📖 *Title:* ${title}
📷 *Media Type:* ${media[0]?.type || 'Unknown'}

━━━━━━━━━━━━━━━━
📥 *Downloading media...*`;

        await sendFormattedMessage(
            conn, 
            from, 
            infoMessage, 
            sender, 
            pushname,
            "Pinterest Downloader",
            `Downloading: ${title.substring(0, 30)}`
        );

        // Send the media (video or image) to the user
        if (videoUrl && (media[0]?.type?.includes('video') || media[0]?.type?.includes('mp4'))) {
            // If it's a video, send the video
            await conn.sendMessage(from, { 
                video: { url: videoUrl }, 
                caption: `📌 *${title}*\n\n✅ Downloaded from Pinterest`
            }, { quoted: mek });
        } else {
            // If it's an image, send the image
            const imageUrl = thumbnailUrl || videoUrl || media[0]?.download_url;
            if (imageUrl) {
                await conn.sendMessage(from, { 
                    image: { url: imageUrl }, 
                    caption: `📌 *${title}*\n\n✅ Downloaded from Pinterest`
                }, { quoted: mek });
            } else {
                await sendFormattedMessage(
                    conn, 
                    from, 
                    "❌ *No valid media found*\n\nPlease try a different Pinterest link.", 
                    sender, 
                    pushname,
                    "Pinterest Downloader - Error",
                    "No media"
                );
                return;
            }
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *Media downloaded successfully!*\n\n📖 *Title:* ${title}\n📷 *Type:* ${media[0]?.type || 'Unknown'}\n\nEnjoy your Pinterest media!`, 
            sender, 
            pushname,
            "Pinterest Downloader - Success",
            "Media delivered"
        );

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *An error occurred*\n\n${e.message}\n\nPlease try again later.`, 
            sender, 
            pushname,
            "Pinterest Downloader - Error",
            "Request failed"
        );
    }
});
