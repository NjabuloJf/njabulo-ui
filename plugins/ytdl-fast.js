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
                }
            }
        }, { quoted: mek });

        // Send random reaction
        const reactionEmojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🎵', '🎶'];
        const randomReaction = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
        await conn.sendMessage(from, { react: { text: randomReaction, key: mek.key } });

        // Try multiple APIs for audio download
        let downloadUrl = null;
        let apiError = null;
        
        // API 1: noobs-api
        try {
            const apiURL1 = `https://noobs-api.top/dipto/ytDl3?link=${encodeURIComponent(bestMatch.videoId)}&format=mp3`;
            const response1 = await axios.get(apiURL1, { timeout: 20000 });
            if (response1.status === 200 && response1.data?.downloadLink) {
                downloadUrl = response1.data.downloadLink;
            }
        } catch (err) {
            console.log('API 1 failed:', err.message);
            apiError = err;
        }
        
        // API 2: Alternative API if first fails
        if (!downloadUrl) {
            try {
                const apiURL2 = `https://api.davidcyriltech.my.id/download/ytmp3?url=https://youtu.be/${bestMatch.videoId}`;
                const response2 = await axios.get(apiURL2, { timeout: 20000 });
                if (response2.data?.success && response2.data?.result?.download_url) {
                    downloadUrl = response2.data.result.download_url;
                }
            } catch (err) {
                console.log('API 2 failed:', err.message);
            }
        }
        
        // API 3: Another alternative
        if (!downloadUrl) {
            try {
                const apiURL3 = `https://api.siputzx.my.id/api/download/ytmp3?url=https://youtu.be/${bestMatch.videoId}`;
                const response3 = await axios.get(apiURL3, { timeout: 20000 });
                if (response3.data?.status && response3.data?.data?.download) {
                    downloadUrl = response3.data.data.download;
                }
            } catch (err) {
                console.log('API 3 failed:', err.message);
            }
        }
        
        if (!downloadUrl) {
            await conn.sendMessage(from, {
                text: `❌ *Failed to download audio*\n\nPlease try again later or try a different song.\n\nError: ${apiError?.message || 'All APIs failed'}`,
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
        console.error('[PLAY] Error:', err);
        
        let errorMessage = `❌ *An error occurred*\n\n`;
        
        if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
            errorMessage += `⏰ *Request timeout*\n\nThe server took too long to respond.\n\nPlease try again in a few moments.`;
        } else if (err.response?.status === 404) {
            errorMessage += `🔍 *Song not found*\n\nPlease try a different song name.`;
        } else {
            errorMessage += `${err.message}\n\nPlease try again later.`;
        }
        
        await conn.sendMessage(from, {
            text: errorMessage,
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
