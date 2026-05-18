const axios = require("axios");
const { cmd, commands } = require("../command");
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
                    body: externalBody || "Ringtone Downloader",
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
    pattern: "ringtone",
    alias: ["ringtones", "ring"],
    desc: "Get a random ringtone from the API.",
    react: "🎵",
    category: "fun",
    filename: __filename,
},
async (conn, mek, m, { from, reply, args, sender, pushname }) => {
    try {
        const query = args.join(" ");
        if (!query) {
            await sendFormattedMessage(
                conn, 
                from, 
                "🎵 *Please provide a search query*\n\n📌 *Usage:* .ringtone Suna\n🔍 *Example:* .ringtone boss", 
                sender, 
                pushname,
                "Ringtone - Missing Query",
                "No keyword provided"
            );
            return;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `🎵 *Searching for ringtones:* "${query}"\n\n⏳ Please wait while we find the best ringtone for you.`, 
            sender, 
            pushname,
            "Ringtone Search",
            `Searching: ${query}`
        );

        const { data } = await axios.get(`https://www.dark-yasiya-api.site/download/ringtone?text=${encodeURIComponent(query)}`, { timeout: 15000 });

        if (!data.status || !data.result || data.result.length === 0) {
            await sendFormattedMessage(
                conn, 
                from, 
                `❌ *No ringtones found*\n\nNo results for "${query}".\n\nPlease try a different keyword.\n\n📌 *Example:* .ringtone boss`, 
                sender, 
                pushname,
                "Ringtone - Not Found",
                "No results"
            );
            return;
        }

        const randomRingtone = data.result[Math.floor(Math.random() * data.result.length)];

        await sendFormattedMessage(
            conn, 
            from, 
            `🎵 *Ringtone Found!*\n\n📌 *Title:* ${randomRingtone.title}\n\n📥 Sending your ringtone...`, 
            sender, 
            pushname,
            "Ringtone Ready",
            randomRingtone.title
        );

        await conn.sendMessage(
            from,
            {
                audio: { url: randomRingtone.dl_link },
                mimetype: "audio/mpeg",
                fileName: `${randomRingtone.title}.mp3`,
            },
            { quoted: mek }
        );

        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *Ringtone sent successfully!*\n\n🎵 *Title:* ${randomRingtone.title}\n🔍 *Search:* "${query}"\n\nEnjoy your ringtone!`, 
            sender, 
            pushname,
            "Ringtone - Complete",
            "Audio delivered"
        );

    } catch (error) {
        console.error("Error in ringtone command:", error);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Something went wrong*\n\n⚠️ ${error.message || "Failed to fetch ringtone"}\n\nPlease try again later.`, 
            sender, 
            pushname,
            "Ringtone - Error",
            "Request failed"
        );
    }
});
