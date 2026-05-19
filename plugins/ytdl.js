const config = require('../config');
const { cmd } = require('../command');
const DY_SCRAP = require('@dark-yasiya/scrap');
const dy_scrap = new DY_SCRAP();

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
                    body: externalBody || "Audio Downloader",
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

function replaceYouTubeID(url) {
    const regex = /(?:youtube\.com\/(?:.*v=|.*\/)|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

cmd({
    pattern: "play3",
    alias: ["mp3", "ytmp3", "song", "audio"],
    react: "🎵",
    desc: "Download Ytmp3",
    category: "download",
    use: ".song <Text or YT URL>",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, sender, pushname }) => {
    try {
        if (!q) {
            await sendFormattedMessage(
                conn, 
                from, 
                "🎵 *Please provide a song name or YouTube URL*\n\n📌 *Usage:* .song Shape of You\n🔍 *Example:* .song https://youtube.com/watch?v=xxxxx", 
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
            `🎵 *Searching for your song...*\n\n🔍 *Query:* ${q}\n⏳ Please wait!`, 
            sender, 
            pushname,
            "Audio Downloader",
            "Searching"
        );

        let id = q.startsWith("https://") ? replaceYouTubeID(q) : null;

        if (!id) {
            const searchResults = await dy_scrap.ytsearch(q);
            if (!searchResults?.results?.length) {
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
            id = searchResults.results[0].videoId;
        }

        const data = await dy_scrap.ytsearch(`https://youtube.com/watch?v=${id}`);
        if (!data?.results?.length) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Failed to fetch video*\n\nPlease try again later.", 
                sender, 
                pushname,
                "Audio Downloader - Error",
                "Fetch failed"
            );
            return;
        }

        const { url, title, image, timestamp, ago, views, author } = data.results[0];

        let info = `🎵 *SONG DOWNLOADER* 🎵

🎤 *Title:* ${title || "Unknown"}
⏳ *Duration:* ${timestamp || "Unknown"}
👀 *Views:* ${views || "Unknown"}
📅 *Release:* ${ago || "Unknown"}
👤 *Artist:* ${author?.name || "Unknown"}

━━━━━━━━━━━━━━━━

📌 *Reply with your choice:*

1.1 🎵 *Audio Type*
1.2 📁 *Document Type*

━━━━━━━━━━━━━━━━
✅ *Choose an option above*`;

        const sentMsg = await conn.sendMessage(from, { image: { url: image }, caption: info }, { quoted: mek });
        const messageID = sentMsg.key.id;
        await conn.sendMessage(from, { react: { text: '🎶', key: sentMsg.key } });

        // Listen for user reply only once!
        conn.ev.on('messages.upsert', async (messageUpdate) => { 
            try {
                const mekInfo = messageUpdate?.messages[0];
                if (!mekInfo?.message) return;

                const messageType = mekInfo?.message?.conversation || mekInfo?.message?.extendedTextMessage?.text;
                const isReplyToSentMsg = mekInfo?.message?.extendedTextMessage?.contextInfo?.stanzaId === messageID;

                if (!isReplyToSentMsg) return;

                let userReply = messageType.trim();
                let msg;
                let type;
                
                if (userReply === "1.1") {
                    msg = await conn.sendMessage(from, { text: "⏳ Processing audio..." }, { quoted: mek });
                    const response = await dy_scrap.ytmp3(`https://youtube.com/watch?v=${id}`);
                    let downloadUrl = response?.result?.download?.url;
                    if (!downloadUrl) {
                        await sendFormattedMessage(
                            conn, 
                            from, 
                            "❌ *Download link not found*\n\nPlease try again later.", 
                            sender, 
                            pushname,
                            "Audio Downloader - Error",
                            "No download URL"
                        );
                        return;
                    }
                    type = { audio: { url: downloadUrl }, mimetype: "audio/mpeg", ptt: false };
                    
                } else if (userReply === "1.2") {
                    msg = await conn.sendMessage(from, { text: "⏳ Processing document..." }, { quoted: mek });
                    const response = await dy_scrap.ytmp3(`https://youtube.com/watch?v=${id}`);
                    let downloadUrl = response?.result?.download?.url;
                    if (!downloadUrl) {
                        await sendFormattedMessage(
                            conn, 
                            from, 
                            "❌ *Download link not found*\n\nPlease try again later.", 
                            sender, 
                            pushname,
                            "Audio Downloader - Error",
                            "No download URL"
                        );
                        return;
                    }
                    type = { document: { url: downloadUrl }, fileName: `${title}.mp3`, mimetype: "audio/mpeg", caption: title };
                    
                } else { 
                    await sendFormattedMessage(
                        conn, 
                        from, 
                        "❌ *Invalid choice*\n\nPlease reply with 1.1 or 1.2", 
                        sender, 
                        pushname,
                        "Audio Downloader - Error",
                        "Invalid option"
                    );
                    return;
                }

                await conn.sendMessage(from, type, { quoted: mek });
                await conn.sendMessage(from, { text: '✅ Media uploaded successfully!', edit: msg.key });

            } catch (error) {
                console.error(error);
                await sendFormattedMessage(
                    conn, 
                    from, 
                    `❌ *An error occurred*\n\n${error.message || "Error!"}`, 
                    sender, 
                    pushname,
                    "Audio Downloader - Error",
                    "Processing failed"
                );
            }
        });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *An error occurred*\n\n${error.message || "Error!"}`, 
            sender, 
            pushname,
            "Audio Downloader - Error",
            "Request failed"
        );
    }
});
