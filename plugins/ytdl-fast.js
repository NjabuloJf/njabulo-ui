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

        // Send top 5 search results as text
        let resultText = `🔍 *SEARCH RESULTS* 🔍

📝 *Query:* ${query}
━━━━━━━━━━━━━━━━━━━━━━\n`;

        for (let i = 0; i < Math.min(search.videos.length, 5); i++) {
            const video = search.videos[i];
            resultText += `\n${i + 1}. 🎵 *${video.title}*\n`;
            resultText += `   ⏱ Duration: ${video.timestamp}\n`;
            resultText += `   👁 Views: ${Number(video.views).toLocaleString()}\n`;
            resultText += `   👤 Channel: ${video.author?.name || 'Unknown'}\n`;
        }

        resultText += `\n━━━━━━━━━━━━━━━━━━━━━━
📌 *Reply with the number to download*
⏳ *Example:* Reply with "1" for the first song`;

        await conn.sendMessage(from, {
            text: resultText,
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
        const reactionEmojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥'];
        const randomReaction = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
        await conn.sendMessage(from, { react: { text: randomReaction, key: mek.key } });

        // Set up message handler for user selection
        const messageID = mek.key.id;
        
        const selectionHandler = async (msgData) => {
            const receivedMsg = msgData.messages[0];
            if (!receivedMsg?.message || !receivedMsg.key?.remoteJid) return;

            const receivedText = receivedMsg.message.conversation || 
                              receivedMsg.message.extendedTextMessage?.text;
            
            const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;
            
            if (isReplyToBot && receivedMsg.key.remoteJid === from) {
                const selectedNum = parseInt(receivedText);
                if (selectedNum >= 1 && selectedNum <= Math.min(search.videos.length, 5)) {
                    const selectedVideo = search.videos[selectedNum - 1];
                    
                    await conn.sendMessage(from, {
                        text: `📥 *Downloading:* ${selectedVideo.title}\n\n⏳ Please wait...`
                    }, { quoted: receivedMsg });

                    const apiURL = `https://noobs-api.top/dipto/ytDl3?link=${encodeURIComponent(selectedVideo.videoId)}&format=mp3`;
                    
                    try {
                        const response = await axios.get(apiURL, { timeout: 30000 });
                        
                        if (response.status !== 200 || !response.data?.downloadLink) {
                            await conn.sendMessage(from, {
                                text: "❌ *Failed to retrieve download link*\n\nPlease try again later."
                            }, { quoted: receivedMsg });
                            return;
                        }

                        const downloadUrl = response.data.downloadLink;
                        const safeTitle = selectedVideo.title.replace(/[\\/:*?"<>|]/g, '');
                        const fileName = `${safeTitle}.mp3`;

                        await conn.sendMessage(from, {
                            audio: { url: downloadUrl },
                            mimetype: 'audio/mpeg',
                            fileName: fileName,
                            contextInfo: {
                                externalAdReply: {
                                    title: selectedVideo.title.length > 40 ? `${selectedVideo.title.substring(0, 37)}...` : selectedVideo.title,
                                    body: `🎵 ${selectedVideo.timestamp} • ${Number(selectedVideo.views).toLocaleString()} views`,
                                    mediaType: 1,
                                    previewType: 0,
                                    thumbnailUrl: selectedVideo.thumbnail,
                                    renderLargerThumbnail: true,
                                    sourceUrl: `https://youtu.be/${selectedVideo.videoId}`,
                                }
                            }
                        }, { quoted: receivedMsg });

                        await conn.sendMessage(from, {
                            text: `✅ *Song sent successfully!*\n\n🎤 *Title:* ${selectedVideo.title}\n⏱ *Duration:* ${selectedVideo.timestamp}\n\n✨ *Enjoy your music!* ✨`
                        }, { quoted: receivedMsg });

                        // Remove handler after successful download
                        conn.ev.off("messages.upsert", selectionHandler);
                        
                    } catch (err) {
                        console.error('[PLAY] API Error:', err);
                        await conn.sendMessage(from, {
                            text: `❌ *An error occurred*\n\n${err.message}\n\nPlease try again later.`
                        }, { quoted: receivedMsg });
                    }
                } else {
                    await conn.sendMessage(from, {
                        text: `❌ *Invalid selection*\n\nPlease reply with a number between 1 and ${Math.min(search.videos.length, 5)}`
                    }, { quoted: receivedMsg });
                }
                // Remove handler after any selection
                conn.ev.off("messages.upsert", selectionHandler);
            }
        };

        conn.ev.on("messages.upsert", selectionHandler);
        
        // Remove handler after 60 seconds
        setTimeout(() => {
            conn.ev.off("messages.upsert", selectionHandler);
        }, 60000);

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
