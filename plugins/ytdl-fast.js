const axios = require("axios");
const yts = require("yt-search");
const config = require('../config');
const { cmd } = require('../command');

cmd({
    pattern: "play",
    alias: ["song", "music", "audio"],
    desc: "Search and play songs from YouTube",
    category: "download",
    react: "🎵",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, sender, pushname }) => {
    try {
        if (!args[0]) {
            const errorMsg = `🎵 *NJABULO UI MUSIC PLAYER* 🎵

━━━━━━━━━━━━━━━━━━━━━━
📌 *Please provide a song name*

📝 *Example:* .play Shape of You
🔍 *Usage:* .play <song name>

━━━━━━━━━━━━━━━━━━━━━━
✨ *NJABULO UI*`;

            await conn.sendMessage(from, {
                text: errorMsg,
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
            return;
        }

        const query = args.join(' ');
        
        await conn.sendMessage(from, {
            text: `🎵 *Searching for:* "${query}"\n\n⏳ Please wait...`,
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

        const search = await yts(query);
        
        if (!search || !search.videos || !search.videos.length) {
            await conn.sendMessage(from, {
                text: `❌ *No results found for:* "${query}"\n\nPlease try a different song name.`,
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
            return;
        }

        // Get the best match (first result)
        const bestMatch = search.videos[0];
        
        // Format duration
        let duration = bestMatch.timestamp || 'Unknown';
        
        // Format views
        let views = Number(bestMatch.views).toLocaleString() || 'Unknown';
        
        // Format uploaded time
        let uploaded = bestMatch.ago || 'Unknown';
        
        // Get artist/channel name
        let artist = bestMatch.author?.name || 'Unknown Artist';
        
        // Get video title
        let title = bestMatch.title || 'Unknown Title';
        
        // Get thumbnail (best quality)
        let thumbnail = bestMatch.thumbnail || 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';
        
        // Create beautiful song info message with image
        const songInfo = `🎵 *NJABULO UI MUSIC PLAYER* 🎵

━━━━━━━━━━━━━━━━━━━━━━

🎤 *TITLE:* 
${title}

👤 *ARTIST:* 
${artist}

⏱ *DURATION:* 
${duration}

👁 *VIEWS:* 
${views}

📅 *UPLOADED:* 
${uploaded}

🔗 *WATCH ON YOUTUBE:*
https://youtu.be/${bestMatch.videoId}

━━━━━━━━━━━━━━━━━━━━━━
📥 *Downloading your song...*

✨ *NJABULO UI*`;

        // Send image with song info
        await conn.sendMessage(from, {
            image: { url: thumbnail },
            caption: songInfo,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: config.NEWSLETTER,
                    newsletterName: '╭••➤ɴᴊᴀʙᴜʟᴏ ᴜɪ',
                    serverMessageId: 143
                },
                externalAdReply: {
                    title: title.length > 35 ? `${title.substring(0, 32)}...` : title,
                    body: `🎵 By ${artist}`,
                    mediaType: 1,
                    thumbnailUrl: thumbnail,
                    sourceUrl: `https://youtu.be/${bestMatch.videoId}`,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });

        // Send random reaction
        const reactionEmojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🎵', '🎶'];
        const randomReaction = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
        await conn.sendMessage(from, { react: { text: randomReaction, key: mek.key } });

        // Download the audio
        const apiURL = `https://noobs-api.top/dipto/ytDl3?link=${encodeURIComponent(bestMatch.videoId)}&format=mp3`;
        
        try {
            const response = await axios.get(apiURL, { timeout: 30000 });
            
            if (response.status !== 200 || !response.data?.downloadLink) {
                await conn.sendMessage(from, {
                    text: "❌ *Failed to retrieve download link*\n\nPlease try again later.",
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
                return;
            }

            const downloadUrl = response.data.downloadLink;
            const safeTitle = title.replace(/[\\/:*?"<>|]/g, '');
            const fileName = `${safeTitle} - ${artist}.mp3`;

            // Send the audio file
            await conn.sendMessage(from, {
                audio: { url: downloadUrl },
                mimetype: 'audio/mpeg',
                fileName: fileName,
                contextInfo: {
                    externalAdReply: {
                        title: title.length > 40 ? `${title.substring(0, 37)}...` : title,
                        body: `🎵 By ${artist} • ${duration}`,
                        mediaType: 1,
                        previewType: 0,
                        thumbnailUrl: thumbnail,
                        renderLargerThumbnail: true,
                        sourceUrl: `https://youtu.be/${bestMatch.videoId}`,
                    }
                }
            }, { quoted: mek });

            const successMsg = `✅ *SONG DOWNLOADED!* ✅

━━━━━━━━━━━━━━━━━━━━━━

🎤 *TITLE:* ${title}
👤 *ARTIST:* ${artist}
⏱ *DURATION:* ${duration}
👁 *VIEWS:* ${views}
📅 *UPLOADED:* ${uploaded}

━━━━━━━━━━━━━━━━━━━━━━
🎵 *File saved as:* 
${fileName}

━━━━━━━━━━━━━━━━━━━━━━
✨ *Enjoy your music!* ✨`;

            await conn.sendMessage(from, {
                text: successMsg,
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

        } catch (err) {
            console.error('[PLAY] API Error:', err);
            await conn.sendMessage(from, {
                text: `❌ *An error occurred*\n\n${err.message}\n\nPlease try again later.`,
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
        }

    } catch (err) {
        console.error('[PLAY] Error:', err);
        await conn.sendMessage(from, {
            text: `❌ *An error occurred*\n\n${err.message}\n\nPlease try again later.`,
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
    }
});
