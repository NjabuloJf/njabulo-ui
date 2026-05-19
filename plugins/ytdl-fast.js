const axios = require("axios");
const yts = require("yt-search");
const config = require('../config');
const { cmd } = require('../command');

// ==================== PLAY COMMAND (Audio as Voice/PTT) ====================
cmd({
    pattern: "play",
    alias: ["song", "music", "audio"],
    desc: "Search and play songs from YouTube (Voice Message)",
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

        const bestMatch = search.videos[0];
        let duration = bestMatch.timestamp || 'Unknown';
        let views = Number(bestMatch.views).toLocaleString() || 'Unknown';
        let uploaded = bestMatch.ago || 'Unknown';
        let artist = bestMatch.author?.name || 'Unknown Artist';
        let title = bestMatch.title || 'Unknown Title';
        let thumbnail = bestMatch.thumbnail || 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';
        
        const songInfo = `🎵 *NJABULO UI MUSIC PLAYER* 🎵

━━━━━━━━━━━━━━━━━━━━━━

🎤 *TITLE:* ${title}
👤 *ARTIST:* ${artist}
⏱ *DURATION:* ${duration}
👁 *VIEWS:* ${views}
📅 *UPLOADED:* ${uploaded}

━━━━━━━━━━━━━━━━━━━━━━
📥 *Downloading your song...*`;

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

        const reactionEmojis = ['🔥', '⚡', '🚀', '🎵', '🎶'];
        const randomReaction = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
        await conn.sendMessage(from, { react: { text: randomReaction, key: mek.key } });

        const apiURL = `https://noobs-api.top/dipto/ytDl3?link=${encodeURIComponent(bestMatch.videoId)}&format=mp3`;
        
        try {
            const response = await axios.get(apiURL, { timeout: 45000 });
            
            if (response.status !== 200 || !response.data?.downloadLink) {
                await conn.sendMessage(from, {
                    text: `❌ *Failed to download audio*\n\n🎤 *Song:* ${title}\n👤 *Artist:* ${artist}\n\n🔗 *Watch on YouTube:* ${bestMatch.url}`,
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

            await conn.sendMessage(from, {
                audio: { url: downloadUrl },
                mimetype: 'audio/mpeg',
                ptt: true,
                fileName: fileName,
                contextInfo: {
                    externalAdReply: {
                        title: title.length > 40 ? `${title.substring(0, 37)}...` : title,
                        body: `🎵 By ${artist} • ${duration}`,
                        mediaType: 1,
                        thumbnailUrl: thumbnail,
                        sourceUrl: bestMatch.url,
                    }
                }
            }, { quoted: mek });

        } catch (err) {
            await conn.sendMessage(from, {
                text: `❌ *Error:* ${err.message}\n\n🔗 *Watch on YouTube:* ${bestMatch.url}`,
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
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${err.message}`,
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

// ==================== VIDEO COMMAND (Video as MP4) ====================
cmd({
    pattern: "video",
    alias: ["mp4", "ytvideo"],
    desc: "Search and download videos from YouTube",
    category: "download",
    react: "🎥",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, sender, pushname }) => {
    try {
        if (!args[0]) {
            const errorMsg = `🎥 *NJABULO UI VIDEO DOWNLOADER* 🎥

━━━━━━━━━━━━━━━━━━━━━━
📌 *Please provide a video name*

📝 *Example:* .video Cat Videos
🔍 *Usage:* .video <video name>

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
            text: `🎥 *Searching for:* "${query}"\n\n⏳ Please wait...`,
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
                text: `❌ *No results found for:* "${query}"\n\nPlease try a different video name.`,
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

        const bestMatch = search.videos[0];
        let duration = bestMatch.timestamp || 'Unknown';
        let views = Number(bestMatch.views).toLocaleString() || 'Unknown';
        let uploaded = bestMatch.ago || 'Unknown';
        let artist = bestMatch.author?.name || 'Unknown Channel';
        let title = bestMatch.title || 'Unknown Title';
        let thumbnail = bestMatch.thumbnail || 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';
        
        const videoInfo = `🎥 *NJABULO UI VIDEO DOWNLOADER* 🎥

━━━━━━━━━━━━━━━━━━━━━━

🎬 *TITLE:* ${title}
👤 *CHANNEL:* ${artist}
⏱ *DURATION:* ${duration}
👁 *VIEWS:* ${views}
📅 *UPLOADED:* ${uploaded}

━━━━━━━━━━━━━━━━━━━━━━
📥 *Downloading your video...*`;

        await conn.sendMessage(from, {
            image: { url: thumbnail },
            caption: videoInfo,
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

        const reactionEmojis = ['🔥', '⚡', '🚀', '🎥', '📹'];
        const randomReaction = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
        await conn.sendMessage(from, { react: { text: randomReaction, key: mek.key } });

        const apiURL = `https://noobs-api.top/dipto/ytDl3?link=${encodeURIComponent(bestMatch.videoId)}&format=mp4`;
        
        try {
            const response = await axios.get(apiURL, { timeout: 45000 });
            
            if (response.status !== 200 || !response.data?.downloadLink) {
                await conn.sendMessage(from, {
                    text: `❌ *Failed to download video*\n\n🎬 *Video:* ${title}\n\n🔗 *Watch on YouTube:* ${bestMatch.url}`,
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
            const fileName = `${safeTitle}.mp4`;

            await conn.sendMessage(from, {
                video: { url: downloadUrl },
                mimetype: 'video/mp4',
                fileName: fileName,
                caption: `🎥 *${title}*\n👤 ${artist}\n⏱ ${duration}`,
                contextInfo: {
                    externalAdReply: {
                        title: title.length > 40 ? `${title.substring(0, 37)}...` : title,
                        body: `🎥 By ${artist} • ${duration}`,
                        mediaType: 1,
                        thumbnailUrl: thumbnail,
                        sourceUrl: bestMatch.url,
                    }
                }
            }, { quoted: mek });

        } catch (err) {
            await conn.sendMessage(from, {
                text: `❌ *Error:* ${err.message}\n\n🔗 *Watch on YouTube:* ${bestMatch.url}`,
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
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${err.message}`,
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

// ==================== SONG DOC COMMAND (Audio as Document) ====================
cmd({
    pattern: "songdoc",
    alias: ["audiodoc", "musicdoc"],
    desc: "Download songs as document file",
    category: "download",
    react: "📄",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, sender, pushname }) => {
    try {
        if (!args[0]) {
            const errorMsg = `📄 *NJABULO UI SONG DOCUMENT* 📄

━━━━━━━━━━━━━━━━━━━━━━
📌 *Please provide a song name*

📝 *Example:* .songdoc Shape of You
🔍 *Usage:* .songdoc <song name>

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
            text: `📄 *Searching for:* "${query}"\n\n⏳ Please wait...`,
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

        const bestMatch = search.videos[0];
        let duration = bestMatch.timestamp || 'Unknown';
        let views = Number(bestMatch.views).toLocaleString() || 'Unknown';
        let uploaded = bestMatch.ago || 'Unknown';
        let artist = bestMatch.author?.name || 'Unknown Artist';
        let title = bestMatch.title || 'Unknown Title';
        let thumbnail = bestMatch.thumbnail || 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';
        
        const songInfo = `📄 *NJABULO UI SONG DOCUMENT* 📄

━━━━━━━━━━━━━━━━━━━━━━

🎤 *TITLE:* ${title}
👤 *ARTIST:* ${artist}
⏱ *DURATION:* ${duration}
👁 *VIEWS:* ${views}
📅 *UPLOADED:* ${uploaded}

━━━━━━━━━━━━━━━━━━━━━━
📥 *Downloading your song as document...*`;

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

        const apiURL = `https://noobs-api.top/dipto/ytDl3?link=${encodeURIComponent(bestMatch.videoId)}&format=mp3`;
        
        try {
            const response = await axios.get(apiURL, { timeout: 45000 });
            
            if (response.status !== 200 || !response.data?.downloadLink) {
                await conn.sendMessage(from, {
                    text: `❌ *Failed to download song*\n\n🎤 *Song:* ${title}\n👤 *Artist:* ${artist}\n\n🔗 *Listen on YouTube:* ${bestMatch.url}`,
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

            await conn.sendMessage(from, {
                document: { url: downloadUrl },
                mimetype: 'audio/mpeg',
                fileName: fileName,
                caption: `📄 *${title}*\n👤 ${artist}\n⏱ ${duration}`,
                contextInfo: {
                    externalAdReply: {
                        title: title.length > 40 ? `${title.substring(0, 37)}...` : title,
                        body: `🎵 By ${artist} • ${duration}`,
                        mediaType: 1,
                        thumbnailUrl: thumbnail,
                        sourceUrl: bestMatch.url,
                    }
                }
            }, { quoted: mek });

        } catch (err) {
            await conn.sendMessage(from, {
                text: `❌ *Error:* ${err.message}\n\n🔗 *Listen on YouTube:* ${bestMatch.url}`,
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
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${err.message}`,
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

// ==================== VIDEO DOC COMMAND (Video as Document) ====================
cmd({
    pattern: "videodoc",
    alias: ["mp4doc", "videofile"],
    desc: "Download videos as document file",
    category: "download",
    react: "📁",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, sender, pushname }) => {
    try {
        if (!args[0]) {
            const errorMsg = `📁 *NJABULO UI VIDEO DOCUMENT* 📁

━━━━━━━━━━━━━━━━━━━━━━
📌 *Please provide a video name*

📝 *Example:* .videodoc Cat Videos
🔍 *Usage:* .videodoc <video name>

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
            text: `📁 *Searching for:* "${query}"\n\n⏳ Please wait...`,
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
                text: `❌ *No results found for:* "${query}"\n\nPlease try a different video name.`,
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

        const bestMatch = search.videos[0];
        let duration = bestMatch.timestamp || 'Unknown';
        let views = Number(bestMatch.views).toLocaleString() || 'Unknown';
        let uploaded = bestMatch.ago || 'Unknown';
        let artist = bestMatch.author?.name || 'Unknown Channel';
        let title = bestMatch.title || 'Unknown Title';
        let thumbnail = bestMatch.thumbnail || 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';
        
        const videoInfo = `📁 *NJABULO UI VIDEO DOCUMENT* 📁

━━━━━━━━━━━━━━━━━━━━━━

🎬 *TITLE:* ${title}
👤 *CHANNEL:* ${artist}
⏱ *DURATION:* ${duration}
👁 *VIEWS:* ${views}
📅 *UPLOADED:* ${uploaded}

━━━━━━━━━━━━━━━━━━━━━━
📥 *Downloading your video as document...*`;

        await conn.sendMessage(from, {
            image: { url: thumbnail },
            caption: videoInfo,
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

        const apiURL = `https://noobs-api.top/dipto/ytDl3?link=${encodeURIComponent(bestMatch.videoId)}&format=mp4`;
        
        try {
            const response = await axios.get(apiURL, { timeout: 45000 });
            
            if (response.status !== 200 || !response.data?.downloadLink) {
                await conn.sendMessage(from, {
                    text: `❌ *Failed to download video*\n\n🎬 *Video:* ${title}\n\n🔗 *Watch on YouTube:* ${bestMatch.url}`,
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
            const fileName = `${safeTitle}.mp4`;

            await conn.sendMessage(from, {
                document: { url: downloadUrl },
                mimetype: 'video/mp4',
                fileName: fileName,
                caption: `📁 *${title}*\n👤 ${artist}\n⏱ ${duration}`,
                contextInfo: {
                    externalAdReply: {
                        title: title.length > 40 ? `${title.substring(0, 37)}...` : title,
                        body: `🎥 By ${artist} • ${duration}`,
                        mediaType: 1,
                        thumbnailUrl: thumbnail,
                        sourceUrl: bestMatch.url,
                    }
                }
            }, { quoted: mek });

        } catch (err) {
            await conn.sendMessage(from, {
                text: `❌ *Error:* ${err.message}\n\n🔗 *Watch on YouTube:* ${bestMatch.url}`,
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
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${err.message}`,
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
