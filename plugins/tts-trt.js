const axios = require('axios');
const config = require('../config')
const {cmd , commands} = require('../command')
const googleTTS = require('google-tts-api')

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
                    body: externalBody || "Translator/TTS",
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
    pattern: "trt",
    alias: ["translate", "trans", "tl"],
    desc: "🌍 Translate text between languages",
    react: "⚡",
    category: "other",
    filename: __filename
},
async (conn, mek, m, { from, q, reply, sender, pushname }) => {
    try {
        const args = q.split(' ');
        if (args.length < 2) {
            await sendFormattedMessage(
                conn, 
                from, 
                "🌍 *Please provide a language code and text*\n\n📌 *Usage:* .translate es Hello\n🔍 *Example:* .trt fr Bonjour\n\n📝 *Language codes:* en, es, fr, de, hi, ar, ru, zh, ja, etc.", 
                sender, 
                pushname,
                "Translator - Error",
                "Missing parameters"
            );
            return;
        }

        const targetLang = args[0];
        const textToTranslate = args.slice(1).join(' ');

        await sendFormattedMessage(
            conn, 
            from, 
            `🌍 *Translating...*\n\n🔤 *Text:* ${textToTranslate}\n🌐 *Target Language:* ${targetLang.toUpperCase()}\n⏳ Please wait!`, 
            sender, 
            pushname,
            "Translator",
            "Processing"
        );

        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=en|${targetLang}`;
        const response = await axios.get(url, { timeout: 15000 });
        const translation = response.data.responseData.translatedText;

        const translationMessage = `🌍 *TRANSLATION RESULT* 🌍

🔤 *Original Text:*
${textToTranslate}

🔠 *Translated Text:*
${translation}

🌐 *Target Language:* ${targetLang.toUpperCase()}

━━━━━━━━━━━━━━━━
✅ *Translation completed!*`;

        await sendFormattedMessage(
            conn, 
            from, 
            translationMessage, 
            sender, 
            pushname,
            "Translation Result",
            `${targetLang.toUpperCase()} translation`
        );
        
    } catch (e) {
        console.log(e);
        await sendFormattedMessage(
            conn, 
            from, 
            "⚠️ *An error occurred while translating your text*\n\nPlease try again later.", 
            sender, 
            pushname,
            "Translator - Error",
            "Translation failed"
        );
    }
});

// TTS - Text To Speech
cmd({
    pattern: "tts",
    alias: ["speak", "voice"],
    desc: "Convert text to speech",
    category: "download",
    react: "👧",
    filename: __filename
},
async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
    if(!q) {
        await sendFormattedMessage(
            conn, 
            from, 
            "🔊 *Please provide some text to convert to speech*\n\n📌 *Usage:* .tts Hello world\n🔍 *Example:* .tts Good morning everyone", 
            sender, 
            pushname,
            "TTS - Error",
            "No text"
        );
        return;
    }

    await sendFormattedMessage(
        conn, 
        from, 
        `🔊 *Converting text to speech...*\n\n📝 *Text:* ${q.substring(0, 50)}${q.length > 50 ? '...' : ''}\n⏳ Please wait!`, 
        sender, 
        pushname,
            "TTS",
        "Generating audio"
    );

    const url = googleTTS.getAudioUrl(q, {
        lang: 'hi-IN',
        slow: false,
        host: 'https://translate.google.com',
    })
    
    await conn.sendMessage(from, { 
        audio: { url: url }, 
        mimetype: 'audio/mpeg', 
        ptt: true 
    }, { quoted: mek })

    await sendFormattedMessage(
        conn, 
        from, 
        `✅ *Audio generated successfully!*\n\n📝 *Text:* ${q.substring(0, 50)}${q.length > 50 ? '...' : ''}\n\nEnjoy your voice message!`, 
        sender, 
        pushname,
        "TTS - Success",
        "Audio delivered"
    );

} catch(a){
    console.log(a);
    await sendFormattedMessage(
        conn, 
        from, 
        `❌ *An error occurred*\n\n${a.message}\n\nPlease try again later.`, 
        sender, 
        pushname,
        "TTS - Error",
        "Generation failed"
    );
}
});
