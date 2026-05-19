const config = require('../config');
const { cmd } = require('../command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');

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
                    body: externalBody || "Media Downloader",
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

// MP4 video download
cmd({ 
    pattern: "mp4", 
    alias: ["video", "ytvideo"], 
    react: "🎥", 
    desc: "Download YouTube video", 
    category: "main", 
    use: '.mp4 < Yt url or Name >', 
    filename: __filename 
}, async (conn, mek, m, { from, prefix, quoted, q, reply, sender, pushname }) => { 
    try { 
        if (!q) {
            await sendFormattedMessage(
                conn, 
                from, 
                "🎥 *Please provide a YouTube URL or video name*\n\n📌 *Usage:* .mp4 Shape of You\n🔍 *Example:* .mp4 https://youtube.com/watch?v=xxxxx", 
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

        const yt = await ytsearch(q);
        if (yt.results.length < 1) {
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
        
        let yts = yt.results[0];  
        let apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(yts.url)}`;
        
        let response = await fetch(apiUrl);
        let data = await response.json();
        
        if (data.status !== 200 || !data.success || !data.result.download_url) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Failed to fetch the video*\n\nPlease try again later.", 
                sender, 
                pushname,
                "Video Downloader - Error",
                "Fetch failed"
            );
            return;
        }

        let ytmsg = `🎥 *VIDEO DOWNLOADER* 🎥

🎬 *Title:* ${yts.title}
⏳ *Duration:* ${yts.timestamp}
👀 *Views:* ${yts.views}
👤 *Author:* ${yts.author.name}

━━━━━━━━━━━━━━━━
✅ *Download complete!*`;

        // Send video directly with caption
        await conn.sendMessage(
            from, 
            { 
                video: { url: data.result.download_url }, 
                caption: ytmsg,
                mimetype: "video/mp4"
            }, 
            { quoted: mek }
        );

        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *Video downloaded successfully!*\n\n🎬 *Title:* ${yts.title}\n\nEnjoy your video!`, 
            sender, 
            pushname,
            "Video Downloader - Success",
            "Video delivered"
        );

    } catch (e) {
        console.log(e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *An error occurred*\n\n${e.message}\n\nPlease try again later.`, 
            sender, 
            pushname,
            "Video Downloader - Error",
            "Request failed"
        );
    }
});

// MP3 song download 
cmd({ 
    pattern: "song", 
    alias: ["play", "mp3", "audio"], 
    react: "🎶", 
    desc: "Download YouTube song", 
    category: "main", 
    use: '.song <query>', 
    filename: __filename 
}, async (conn, mek, m, { from, sender, reply, q, pushname }) => { 
    try {
        if (!q) {
            await sendFormattedMessage(
                conn, 
                from, 
                "🎶 *Please provide a song name or YouTube link*\n\n📌 *Usage:* .song Shape of You\n🔍 *Example:* .song https://youtube.com/watch?v=xxxxx", 
                sender, 
                pushname,
                "Audio Downloader - Error",
                "No query"
            );
            return;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `🎶 *Searching for your song...*\n\n🔍 *Query:* ${q}\n⏳ Please wait!`, 
            sender, 
            pushname,
            "Audio Downloader",
            "Searching"
        );

        const yt = await ytsearch(q);
        if (!yt.results.length) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *No results found*\n\nPlease try a different song name.", 
                sender, 
                pushname,
                "Audio Downloader - Error",
                "No results"
            );
            return;
        }

        const song = yt.results[0];
        
        await sendFormattedMessage(
            conn, 
            from, 
            `📥 *Downloading audio...*\n\n🎤 *Title:* ${song.title}\n⏳ Please wait!`, 
            sender, 
            pushname,
            "Audio Downloader",
            "Downloading"
        );

        const apiUrl = `https://noobs-api.top/dipto/ytDl3?link=${encodeURIComponent(song.url)}`;
        const res = await fetch(apiUrl);
        const data = await res.json();

        if (!data?.result?.downloadUrl) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Download failed*\n\nPlease try again later.", 
                sender, 
                pushname,
                "Audio Downloader - Error",
                "Download failed"
            );
            return;
        }

        await conn.sendMessage(from, {
            audio: { url: data.result.downloadUrl },
            mimetype: "audio/mpeg",
            fileName: `${song.title}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: song.title.length > 25 ? `${song.title.substring(0, 22)}...` : song.title,
                    body: "Audio Downloader",
                    mediaType: 1,
                    thumbnailUrl: song.thumbnail.replace('default.jpg', 'hqdefault.jpg'),
                    sourceUrl: 'https://whatsapp.com/channel/0029VbAhCy8EquiTSb5pMS3t',
                    mediaUrl: 'https://whatsapp.com/channel/0029VbAhCy8EquiTSb5pMS3t',
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });

        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *Audio downloaded successfully!*\n\n🎤 *Title:* ${song.title}\n\nEnjoy your music!`, 
            sender, 
            pushname,
            "Audio Downloader - Success",
            "Audio delivered"
        );

    } catch (error) {
        console.error(error);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *An error occurred*\n\n${error.message}\n\nPlease try again later.`, 
            sender, 
            pushname,
            "Audio Downloader - Error",
            "Request failed"
        );
    }
});
