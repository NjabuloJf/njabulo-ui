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
                    body: externalBody || "Dictionary System",
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
    pattern: "define",
    desc: "📖 Get the definition of a word",
    react: "🔍",
    category: "search",
    filename: __filename
},
async (conn, mek, m, { from, q, reply, sender, pushname }) => {
    try {
        if (!q) {
            await sendFormattedMessage(
                conn, 
                from, 
                "📖 *Please provide a word to define*\n\n📌 *Usage:* .define [word]\n\n🔍 *Example:* .define love", 
                sender, 
                pushname,
                "Dictionary - Missing Word",
                "No word provided"
            );
            return;
        }

        const word = q.trim();
        const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

        const response = await axios.get(url, { timeout: 10000 });
        const definitionData = response.data[0];

        const definition = definitionData.meanings[0].definitions[0].definition;
        const example = definitionData.meanings[0].definitions[0].example || '❌ No example available';
        const synonyms = definitionData.meanings[0].definitions[0].synonyms.join(', ') || '❌ No synonyms available';
        const phonetics = definitionData.phonetics[0]?.text || '🔇 No phonetics available';
        const audio = definitionData.phonetics[0]?.audio || null;

        const wordInfo = `📖 *WORD DEFINITION* 📖

🔤 *Word:* ${definitionData.word}
🗣️ *Pronunciation:* ${phonetics}

📚 *Definition:*
${definition}

✍️ *Example:*
${example}

📝 *Synonyms:*
${synonyms}

🔗 *Powered by NJABULO UI*`;

        if (audio) {
            await conn.sendMessage(from, { 
                audio: { url: audio }, 
                mimetype: 'audio/mpeg' 
            }, { quoted: mek });
        }

        await sendFormattedMessage(
            conn, 
            from, 
            wordInfo, 
            sender, 
            pushname,
            "Dictionary Definition",
            `Definition of: ${definitionData.word}`
        );
        
    } catch (e) {
        console.error("❌ Error:", e);
        if (e.response && e.response.status === 404) {
            await sendFormattedMessage(
                conn, 
                from, 
                "🚫 *Word not found*\n\nPlease check the spelling and try again.\n\n🔍 *Example:* .define happiness", 
                sender, 
                pushname,
                "Dictionary - Not Found",
                "Word doesn't exist"
            );
        } else if (e.code === 'ECONNABORTED') {
            await sendFormattedMessage(
                conn, 
                from, 
                "⏰ *Request timeout*\n\nPlease try again in a few moments.", 
                sender, 
                pushname,
                "Dictionary - Timeout",
                "API took too long"
            );
        } else {
            await sendFormattedMessage(
                conn, 
                from, 
                "⚠️ *An error occurred*\n\nPlease try again later.\n\n🔍 Error: " + e.message, 
                sender, 
                pushname,
                "Dictionary - Error",
                "Request failed"
            );
        }
    }
});
