const config = require('../config');
const { cmd } = require('../command');
const yts = require('yt-search');

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
                    body: externalBody || "Video Downloader",
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
    pattern: "video2",
    alias: ["mp4", "ytvideo", "ytmp4"],
    react: "🎥",
    desc: "Download video from YouTube",
    category: "download",
    use: ".video <query or url>",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, sender, pushname }) => {
    try {
        if (!q) {
            await sendFormattedMessage(
                conn, 
                from, 
                "🎥 *Please provide a video name or YouTube URL*\n\n📌 *Usage:* .video Shape of You\n🔍 *Example:* .video https://youtube.com/watch?v=xxxxx", 
                sender, 
                pushname,
                "Video Downloader - Error",
                "No query"
            );
            return;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `🎥 *Searching for your video...*\n\n🔍 *Query:* ${q}\n⏳ Please wait!`, 
            sender, 
            pushname,
            "Video Downloader",
            "Searching"
        );

        let videoUrl, title;
        
        // Check if it's a URL
        if (q.match(/(youtube\.com|youtu\.be)/)) {
            const videoId = q.split(/[=/]/).pop();
            const videoInfo = await yts({ videoId });
            videoUrl = q;
            title = videoInfo.title;
        } else {
            // Search YouTube
            const search = await yts(q);
            if (!search.videos.length) {
                await sendFormattedMessage(
                    conn, 
                    from, 
                    "❌ *No results found*\n\nPlease try a different video name.", 
                    sender, 
                    pushname,
                    "Video Downloader - Error",
                    "No results"
                );
                return;
            }
            videoUrl = search.videos[0].url;
            title = search.videos[0].title;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `📥 *Downloading video...*\n\n🎤 *Title:* ${title}\n⏳ Please wait!`, 
            sender, 
            pushname,
            "Video Downloader",
            "Downloading"
        );

        // Use API to get video
        const apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(videoUrl)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.success) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Failed to download video*\n\nPlease try again later.", 
                sender, 
                pushname,
                "Video Downloader - Error",
                "Download failed"
            );
            return;
        }

        await conn.sendMessage(from, {
            video: { url: data.result.download_url },
            mimetype: 'video/mp4',
            caption: `🎥 *${title}*\n\n✅ Downloaded successfully!`
        }, { quoted: mek });

        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *Video downloaded successfully!*\n\n🎤 *Title:* ${title}\n\nEnjoy your video!`, 
            sender, 
            pushname,
            "Video Downloader - Success",
            "Video delivered"
        );

    } catch (error) {
        console.error(error);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error downloading video*\n\n${error.message}\n\nPlease try again later.`, 
            sender, 
            pushname,
            "Video Downloader - Error",
            "Request failed"
        );
    }
});
