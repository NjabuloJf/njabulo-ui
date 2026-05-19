const axios = require('axios');
const { cmd } = require('../command');
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
                    body: externalBody || "Movie Info",
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
    pattern: "movie",
    alias: ["imdb", "film", "cinema"],
    desc: "Fetch detailed information about a movie.",
    category: "utility",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, { from, reply, sender, args, pushname }) => {
    try {
        // Properly extract the movie name from arguments
        const movieName = args.length > 0 ? args.join(' ') : '';
        
        if (!movieName) {
            await sendFormattedMessage(
                conn, 
                from, 
                "🎬 *Please provide the name of the movie*\n\n📌 *Usage:* .movie Iron Man\n🔍 *Example:* .movie Inception", 
                sender, 
                pushname,
                "Movie Info - Error",
                "No movie name"
            );
            return;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `🎬 *Searching for movie...*\n\n📽️ *Movie:* ${movieName}\n⏳ Please wait!`, 
            sender, 
            pushname,
            "Movie Info",
            "Searching"
        );

        const apiUrl = `https://apis.davidcyriltech.my.id/imdb?query=${encodeURIComponent(movieName)}`;
        const response = await axios.get(apiUrl, { timeout: 15000 });

        if (!response.data.status || !response.data.movie) {
            await sendFormattedMessage(
                conn, 
                from, 
                `🚫 *Movie not found*\n\n"${movieName}" could not be found.\n\nPlease check the spelling and try again.`, 
                sender, 
                pushname,
                "Movie Info - Error",
                "Movie not found"
            );
            return;
        }

        const movie = response.data.movie;
        
        // Get Rotten Tomatoes rating
        const rtRating = movie.ratings?.find(r => r.source === 'Rotten Tomatoes')?.value || 'N/A';
        
        // Format the caption
        const dec = `🎬 *MOVIE INFORMATION* 🎬

📽️ *Title:* ${movie.title} (${movie.year}) ${movie.rated || ''}

⭐ *IMDb Rating:* ${movie.imdbRating || 'N/A'}
🍅 *Rotten Tomatoes:* ${rtRating}
💰 *Box Office:* ${movie.boxoffice || 'N/A'}

📅 *Released:* ${movie.released ? new Date(movie.released).toLocaleDateString() : 'N/A'}
⏳ *Runtime:* ${movie.runtime || 'N/A'}
🎭 *Genre:* ${movie.genres || 'N/A'}

📝 *Plot:*
${movie.plot || 'No plot available'}

🎥 *Director:* ${movie.director || 'N/A'}
✍️ *Writer:* ${movie.writer || 'N/A'}
🌟 *Actors:* ${movie.actors || 'N/A'}

🌍 *Country:* ${movie.country || 'N/A'}
🗣️ *Language:* ${movie.languages || 'N/A'}
🏆 *Awards:* ${movie.awards || 'None'}

🔗 *IMDb Link:* ${movie.imdbUrl || 'N/A'}

━━━━━━━━━━━━━━━━
✅ *Movie info fetched!*`;

        // Get poster image URL
        const posterUrl = movie.poster && movie.poster !== 'N/A' ? movie.poster : 'https://files.catbox.moe/4ggu0a.jpg';

        await conn.sendMessage(from, {
            image: { url: posterUrl },
            caption: dec
        }, { quoted: mek });

        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *Movie information retrieved!*\n\n🎬 *${movie.title}* (${movie.year})\n⭐ *Rating:* ${movie.imdbRating || 'N/A'}/10`, 
            sender, 
            pushname,
            "Movie Info - Success",
            `${movie.title} (${movie.year})`
        );

    } catch (e) {
        console.error('Movie command error:', e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error:* ${e.message}`, 
            sender, 
            pushname,
            "Movie Info - Error",
            "Request failed"
        );
    }
});
