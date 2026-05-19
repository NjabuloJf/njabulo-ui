const axios = require("axios");
const config = require('../config');
const { cmd } = require('../command');
const yts = require("yt-search");

function replaceYouTubeID(url) {
    const regex = /(?:youtube\.com\/(?:.*v=|.*\/)|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// ==================== PLAY3 COMMAND (Audio - Voice/PTT) ====================
cmd({
    pattern: "play3",
    alias: ["mp3", "ytmp3", "song3"],
    react: "🎵",
    desc: "Download YouTube audio as voice message",
    category: "download",
    use: ".play3 <Text or YT URL>",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, sender, pushname }) => {
    try {
        if (!q) {
            await reply("❌ *Please provide a song name or YouTube URL!*\n\n📌 *Example:* .play3 Shape of You");
            return;
        }

        let videoId = q.startsWith("https://") ? replaceYouTubeID(q) : null;
        let title, artist, duration, views, uploaded, thumbnail, videoUrl;

        if (!videoId) {
            const search = await yts(q);
            if (!search || !search.videos || !search.videos.length) {
                return await reply("❌ *No results found!*");
            }
            const bestMatch = search.videos[0];
            videoId = bestMatch.videoId;
            title = bestMatch.title;
            artist = bestMatch.author?.name || 'Unknown';
            duration = bestMatch.timestamp || 'Unknown';
            views = Number(bestMatch.views).toLocaleString();
            uploaded = bestMatch.ago || 'Unknown';
            thumbnail = bestMatch.thumbnail;
            videoUrl = bestMatch.url;
        } else {
            const search = await yts(`https://youtube.com/watch?v=${videoId}`);
            if (!search || !search.videos || !search.videos.length) {
                return await reply("❌ *Failed to fetch video!*");
            }
            const video = search.videos[0];
            title = video.title;
            artist = video.author?.name || 'Unknown';
            duration = video.timestamp || 'Unknown';
            views = Number(video.views).toLocaleString();
            uploaded = video.ago || 'Unknown';
            thumbnail = video.thumbnail;
            videoUrl = video.url;
        }

        const info = `🎵 *NJABULO UI AUDIO DOWNLOADER* 🎵

━━━━━━━━━━━━━━━━━━━━━━

🎤 *Title:* ${title}
👤 *Artist:* ${artist}
⏱ *Duration:* ${duration}
👁 *Views:* ${views}
📅 *Uploaded:* ${uploaded}

━━━━━━━━━━━━━━━━━━━━━━

🔽 *Reply with your choice:*

1️⃣1️⃣ *Audio Type* 🎵
1️⃣2️⃣ *Document Type* 📁

━━━━━━━━━━━━━━━━━━━━━━
✨ *NJABULO UI*`;

        const sentMsg = await conn.sendMessage(from, { 
            image: { url: thumbnail }, 
            caption: info,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: config.NEWSLETTER,
                    newsletterName: '╭••➤ɴᴊᴀʙᴜʟᴏ ᴜɪ',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });
        
        const messageID = sentMsg.key.id;
        await conn.sendMessage(from, { react: { text: '🎵', key: sentMsg.key } });

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
                
                if (userReply === "1.1" || userReply === "11") {
                    msg = await conn.sendMessage(from, { text: "⏳ Processing audio..." }, { quoted: mek });
                    
                    const apiURL = `https://noobs-api.top/dipto/ytDl3?link=${encodeURIComponent(videoId)}&format=mp3`;
                    const response = await axios.get(apiURL, { timeout: 45000 });
                    
                    let downloadUrl = response.data?.downloadLink;
                    if (!downloadUrl) return await reply("❌ Download link not found!");
                    
                    type = { 
                        audio: { url: downloadUrl }, 
                        mimetype: "audio/mpeg",
                        ptt: true,
                        contextInfo: {
                            externalAdReply: {
                                title: title.length > 40 ? `${title.substring(0, 37)}...` : title,
                                body: `🎵 By ${artist} • ${duration}`,
                                mediaType: 1,
                                thumbnailUrl: thumbnail,
                                sourceUrl: videoUrl,
                            }
                        }
                    };
                    
                } else if (userReply === "1.2" || userReply === "12") {
                    msg = await conn.sendMessage(from, { text: "⏳ Processing document..." }, { quoted: mek });
                    
                    const apiURL = `https://noobs-api.top/dipto/ytDl3?link=${encodeURIComponent(videoId)}&format=mp3`;
                    const response = await axios.get(apiURL, { timeout: 45000 });
                    
                    let downloadUrl = response.data?.downloadLink;
                    if (!downloadUrl) return await reply("❌ Download link not found!");
                    
                    const safeTitle = title.replace(/[\\/:*?"<>|]/g, '');
                    type = { 
                        document: { url: downloadUrl }, 
                        fileName: `${safeTitle} - ${artist}.mp3`, 
                        mimetype: "audio/mpeg", 
                        caption: `📄 *${title}*\n👤 ${artist}\n⏱ ${duration}`,
                        contextInfo: {
                            externalAdReply: {
                                title: title.length > 40 ? `${title.substring(0, 37)}...` : title,
                                body: `🎵 By ${artist} • ${duration}`,
                                mediaType: 1,
                                thumbnailUrl: thumbnail,
                                sourceUrl: videoUrl,
                            }
                        }
                    };
                    
                } else { 
                    return await reply("❌ *Invalid choice!* Reply with 1.1 or 1.2");
                }

                await conn.sendMessage(from, type, { quoted: mek });
                await conn.sendMessage(from, { text: '✅ Media uploaded successfully!', edit: msg.key });

            } catch (error) {
                console.error(error);
                await reply(`❌ *Error:* ${error.message || "Error!"}`);
            }
        });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        await reply(`❌ *Error:* ${error.message || "Error!"}`);
    }
});

// ==================== VIDEO3 COMMAND (Video as MP4) ====================
cmd({
    pattern: "video3",
    alias: ["mp4", "ytmp4", "vid3"],
    react: "🎥",
    desc: "Download YouTube video as MP4",
    category: "download",
    use: ".video3 <Text or YT URL>",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, sender, pushname }) => {
    try {
        if (!q) {
            await reply("❌ *Please provide a video name or YouTube URL!*\n\n📌 *Example:* .video3 Cat Videos");
            return;
        }

        let videoId = q.startsWith("https://") ? replaceYouTubeID(q) : null;
        let title, artist, duration, views, uploaded, thumbnail, videoUrl;

        if (!videoId) {
            const search = await yts(q);
            if (!search || !search.videos || !search.videos.length) {
                return await reply("❌ *No results found!*");
            }
            const bestMatch = search.videos[0];
            videoId = bestMatch.videoId;
            title = bestMatch.title;
            artist = bestMatch.author?.name || 'Unknown';
            duration = bestMatch.timestamp || 'Unknown';
            views = Number(bestMatch.views).toLocaleString();
            uploaded = bestMatch.ago || 'Unknown';
            thumbnail = bestMatch.thumbnail;
            videoUrl = bestMatch.url;
        } else {
            const search = await yts(`https://youtube.com/watch?v=${videoId}`);
            if (!search || !search.videos || !search.videos.length) {
                return await reply("❌ *Failed to fetch video!*");
            }
            const video = search.videos[0];
            title = video.title;
            artist = video.author?.name || 'Unknown';
            duration = video.timestamp || 'Unknown';
            views = Number(video.views).toLocaleString();
            uploaded = video.ago || 'Unknown';
            thumbnail = video.thumbnail;
            videoUrl = video.url;
        }

        const info = `🎥 *NJABULO UI VIDEO DOWNLOADER* 🎥

━━━━━━━━━━━━━━━━━━━━━━

🎬 *Title:* ${title}
👤 *Channel:* ${artist}
⏱ *Duration:* ${duration}
👁 *Views:* ${views}
📅 *Uploaded:* ${uploaded}

━━━━━━━━━━━━━━━━━━━━━━

🔽 *Reply with your choice:*

2️⃣1️⃣ *Video Type* 🎥
2️⃣2️⃣ *Document Type* 📁

━━━━━━━━━━━━━━━━━━━━━━
✨ *NJABULO UI*`;

        const sentMsg = await conn.sendMessage(from, { 
            image: { url: thumbnail }, 
            caption: info,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: config.NEWSLETTER,
                    newsletterName: '╭••➤ɴᴊᴀʙᴜʟᴏ ᴜɪ',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });
        
        const messageID = sentMsg.key.id;
        await conn.sendMessage(from, { react: { text: '🎥', key: sentMsg.key } });

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
                
                if (userReply === "2.1" || userReply === "21") {
                    msg = await conn.sendMessage(from, { text: "⏳ Processing video..." }, { quoted: mek });
                    
                    const apiURL = `https://noobs-api.top/dipto/ytDl3?link=${encodeURIComponent(videoId)}&format=mp4`;
                    const response = await axios.get(apiURL, { timeout: 45000 });
                    
                    let downloadUrl = response.data?.downloadLink;
                    if (!downloadUrl) return await reply("❌ Download link not found!");
                    
                    type = { 
                        video: { url: downloadUrl }, 
                        mimetype: "video/mp4",
                        caption: `🎥 *${title}*\n👤 ${artist}\n⏱ ${duration}`,
                        contextInfo: {
                            externalAdReply: {
                                title: title.length > 40 ? `${title.substring(0, 37)}...` : title,
                                body: `🎥 By ${artist} • ${duration}`,
                                mediaType: 1,
                                thumbnailUrl: thumbnail,
                                sourceUrl: videoUrl,
                            }
                        }
                    };
                    
                } else if (userReply === "2.2" || userReply === "22") {
                    msg = await conn.sendMessage(from, { text: "⏳ Processing document..." }, { quoted: mek });
                    
                    const apiURL = `https://noobs-api.top/dipto/ytDl3?link=${encodeURIComponent(videoId)}&format=mp4`;
                    const response = await axios.get(apiURL, { timeout: 45000 });
                    
                    let downloadUrl = response.data?.downloadLink;
                    if (!downloadUrl) return await reply("❌ Download link not found!");
                    
                    const safeTitle = title.replace(/[\\/:*?"<>|]/g, '');
                    type = { 
                        document: { url: downloadUrl }, 
                        fileName: `${safeTitle}.mp4`, 
                        mimetype: "video/mp4", 
                        caption: `📁 *${title}*\n👤 ${artist}\n⏱ ${duration}`,
                        contextInfo: {
                            externalAdReply: {
                                title: title.length > 40 ? `${title.substring(0, 37)}...` : title,
                                body: `🎥 By ${artist} • ${duration}`,
                                mediaType: 1,
                                thumbnailUrl: thumbnail,
                                sourceUrl: videoUrl,
                            }
                        }
                    };
                    
                } else { 
                    return await reply("❌ *Invalid choice!* Reply with 2.1 or 2.2");
                }

                await conn.sendMessage(from, type, { quoted: mek });
                await conn.sendMessage(from, { text: '✅ Media uploaded successfully!', edit: msg.key });

            } catch (error) {
                console.error(error);
                await reply(`❌ *Error:* ${error.message || "Error!"}`);
            }
        });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        await reply(`❌ *Error:* ${error.message || "Error!"}`);
    }
});

// ==================== VIDEODOC3 COMMAND (Video as Document Only) ====================
cmd({
    pattern: "videodoc3",
    alias: ["mp4doc3", "viddoc3"],
    react: "📁",
    desc: "Download YouTube video as document file",
    category: "download",
    use: ".videodoc3 <Text or YT URL>",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, sender, pushname }) => {
    try {
        if (!q) {
            await reply("❌ *Please provide a video name or YouTube URL!*\n\n📌 *Example:* .videodoc3 Cat Videos");
            return;
        }

        let videoId = q.startsWith("https://") ? replaceYouTubeID(q) : null;
        let title, artist, duration, views, uploaded, thumbnail, videoUrl;

        if (!videoId) {
            const search = await yts(q);
            if (!search || !search.videos || !search.videos.length) {
                return await reply("❌ *No results found!*");
            }
            const bestMatch = search.videos[0];
            videoId = bestMatch.videoId;
            title = bestMatch.title;
            artist = bestMatch.author?.name || 'Unknown';
            duration = bestMatch.timestamp || 'Unknown';
            views = Number(bestMatch.views).toLocaleString();
            uploaded = bestMatch.ago || 'Unknown';
            thumbnail = bestMatch.thumbnail;
            videoUrl = bestMatch.url;
        } else {
            const search = await yts(`https://youtube.com/watch?v=${videoId}`);
            if (!search || !search.videos || !search.videos.length) {
                return await reply("❌ *Failed to fetch video!*");
            }
            const video = search.videos[0];
            title = video.title;
            artist = video.author?.name || 'Unknown';
            duration = video.timestamp || 'Unknown';
            views = Number(video.views).toLocaleString();
            uploaded = video.ago || 'Unknown';
            thumbnail = video.thumbnail;
            videoUrl = video.url;
        }

        const info = `📁 *NJABULO UI VIDEO DOCUMENT DOWNLOADER* 📁

━━━━━━━━━━━━━━━━━━━━━━

🎬 *Title:* ${title}
👤 *Channel:* ${artist}
⏱ *Duration:* ${duration}
👁 *Views:* ${views}
📅 *Uploaded:* ${uploaded}

━━━━━━━━━━━━━━━━━━━━━━

🔽 *Send the video as a document file?*

✅ *Reply with "yes" to download*

━━━━━━━━━━━━━━━━━━━━━━
✨ *NJABULO UI*`;

        const sentMsg = await conn.sendMessage(from, { 
            image: { url: thumbnail }, 
            caption: info,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: config.NEWSLETTER,
                    newsletterName: '╭••➤ɴᴊᴀʙᴜʟᴏ ᴜɪ',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });
        
        const messageID = sentMsg.key.id;
        await conn.sendMessage(from, { react: { text: '📁', key: sentMsg.key } });

        conn.ev.on('messages.upsert', async (messageUpdate) => { 
            try {
                const mekInfo = messageUpdate?.messages[0];
                if (!mekInfo?.message) return;

                const messageType = mekInfo?.message?.conversation || mekInfo?.message?.extendedTextMessage?.text;
                const isReplyToSentMsg = mekInfo?.message?.extendedTextMessage?.contextInfo?.stanzaId === messageID;

                if (!isReplyToSentMsg) return;

                let userReply = messageType.trim().toLowerCase();
                
                if (userReply === "yes") {
                    const msg = await conn.sendMessage(from, { text: "⏳ Processing video document..." }, { quoted: mek });
                    
                    const apiURL = `https://noobs-api.top/dipto/ytDl3?link=${encodeURIComponent(videoId)}&format=mp4`;
                    const response = await axios.get(apiURL, { timeout: 45000 });
                    
                    let downloadUrl = response.data?.downloadLink;
                    if (!downloadUrl) return await reply("❌ Download link not found!");
                    
                    const safeTitle = title.replace(/[\\/:*?"<>|]/g, '');
                    const type = { 
                        document: { url: downloadUrl }, 
                        fileName: `${safeTitle}.mp4`, 
                        mimetype: "video/mp4", 
                        caption: `📁 *${title}*\n👤 ${artist}\n⏱ ${duration}`,
                        contextInfo: {
                            externalAdReply: {
                                title: title.length > 40 ? `${title.substring(0, 37)}...` : title,
                                body: `🎥 By ${artist} • ${duration}`,
                                mediaType: 1,
                                thumbnailUrl: thumbnail,
                                sourceUrl: videoUrl,
                            }
                        }
                    };

                    await conn.sendMessage(from, type, { quoted: mek });
                    await conn.sendMessage(from, { text: '✅ Document uploaded successfully!', edit: msg.key });

                } else { 
                    return await reply("❌ *Invalid choice!* Reply with 'yes' to download.");
                }

            } catch (error) {
                console.error(error);
                await reply(`❌ *Error:* ${error.message || "Error!"}`);
            }
        });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        await reply(`❌ *Error:* ${error.message || "Error!"}`);
    }
});
