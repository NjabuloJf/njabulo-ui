const { cmd } = require("../command");
const googleTTS = require('google-tts-api');
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
                    body: externalBody || "Text to Speech",
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
  pattern: "tts2",
  alias: ["voice", "speak2"],
  desc: "Convert text to speech with different voice styles.",
  category: "fun",
  react: "🔊",
  filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
  try {
    if (!q) {
      await sendFormattedMessage(
        conn, 
        from, 
        "🔊 *Please provide text for conversion*\n\n📌 *Usage:* .tts2 Hello world\n🔍 *Options:* male, female, loud, deep\n\n📝 *Example:* .tts2 male Hello", 
        sender, 
        pushname,
        "TTS - Error",
        "No text"
      );
      return;
    }

    // Select voice language based on user input
    let voiceLanguage = 'en-US';
    let voiceStyle = "Standard";

    if (args[0] === "male") {
      voiceLanguage = 'en-US';
      voiceStyle = "Male Voice";
    } else if (args[0] === "female") {
      voiceLanguage = 'en-GB';
      voiceStyle = "Female Voice";
    } else if (args[0] === "loud") {
      voiceLanguage = 'en-US';
      voiceStyle = "Loud Voice";
    } else if (args[0] === "deep") {
      voiceLanguage = 'en-US';
      voiceStyle = "Deep Voice";
    }

    // Extract text (remove voice option if present)
    let textToSpeak = q;
    if (args[0] === "male" || args[0] === "female" || args[0] === "loud" || args[0] === "deep") {
      textToSpeak = args.slice(1).join(' ');
    }

    if (!textToSpeak) {
      await sendFormattedMessage(
        conn, 
        from, 
        "🔊 *Please provide text after voice option*\n\n📌 *Example:* .tts2 female Hello", 
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
      `🔊 *Converting text to speech...*\n\n📝 *Text:* ${textToSpeak.substring(0, 50)}${textToSpeak.length > 50 ? '...' : ''}\n🎤 *Voice:* ${voiceStyle}\n⏳ Please wait!`, 
      sender, 
      pushname,
      "TTS",
      "Generating audio"
    );

    const url = googleTTS.getAudioUrl(textToSpeak, {
      lang: voiceLanguage,
      slow: false,
      host: 'https://translate.google.com'
    });

    await conn.sendMessage(from, { 
      audio: { url: url }, 
      mimetype: 'audio/mpeg', 
      ptt: true 
    }, { quoted: mek });

    await sendFormattedMessage(
      conn, 
      from, 
      `✅ *Audio generated successfully!*\n\n📝 *Text:* ${textToSpeak.substring(0, 50)}${textToSpeak.length > 50 ? '...' : ''}\n🎤 *Voice:* ${voiceStyle}\n\nEnjoy your voice message!`, 
      sender, 
      pushname,
      "TTS - Success",
      "Audio delivered"
    );

  } catch (error) {
    console.error(error);
    await sendFormattedMessage(
      conn, 
      from, 
      `❌ *Error:* ${error.message}`, 
      sender, 
      pushname,
      "TTS - Error",
      "Generation failed"
    );
  }
});

cmd({
  pattern: "tts3",
  alias: ["ttsurdu", "urduspeak"],
  desc: "Convert text to speech in Urdu language.",
  category: "fun",
  react: "🔊",
  filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
  try {
    if (!q) {
      await sendFormattedMessage(
        conn, 
        from, 
        "🔊 *Please provide Urdu text for conversion*\n\n📌 *Usage:* .tts3 آپ کیسے ہیں؟\n🔍 *Example:* .tts3 السلام علیکم", 
        sender, 
        pushname,
        "TTS Urdu - Error",
        "No text"
      );
      return;
    }

    await sendFormattedMessage(
      conn, 
      from, 
      `🔊 *Converting Urdu text to speech...*\n\n📝 *Text:* ${q.substring(0, 50)}${q.length > 50 ? '...' : ''}\n🌐 *Language:* Urdu\n⏳ Please wait!`, 
      sender, 
      pushname,
      "TTS Urdu",
      "Generating audio"
    );

    const url = googleTTS.getAudioUrl(q, {
      lang: 'ur',
      slow: false,
      host: 'https://translate.google.com'
    });

    await conn.sendMessage(from, { 
      audio: { url: url }, 
      mimetype: 'audio/mpeg', 
      ptt: true 
    }, { quoted: mek });

    await sendFormattedMessage(
      conn, 
      from, 
      `✅ *Urdu audio generated successfully!*\n\n📝 *Text:* ${q.substring(0, 50)}${q.length > 50 ? '...' : ''}\n🌐 *Language:* Urdu\n\nEnjoy your Urdu voice message!`, 
      sender, 
      pushname,
      "TTS Urdu - Success",
      "Audio delivered"
    );

  } catch (error) {
    console.error(error);
    await sendFormattedMessage(
      conn, 
      from, 
      `❌ *Error:* ${error.message}`, 
      sender, 
      pushname,
      "TTS Urdu - Error",
      "Generation failed"
    );
  }
});
