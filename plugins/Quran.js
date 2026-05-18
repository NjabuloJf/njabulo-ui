const fetch = require('node-fetch'); 
const { cmd, commands } = require('../command');
const { fetchJson } = require('../lib/functions');
const { translate } = require('@vitalets/google-translate-api');
const axios = require('axios')

// ============= FORMATTED MESSAGE FUNCTION =============
// ALL replies will use this function for consistent formatting
async function sendFormattedMessage(conn, from, text, sender, userName, externalBody = '', bodyText = '') {
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
                body: externalBody || "Quran Kareem",
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
                    displayName: userName || pushname || "User",
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${userName || pushname || "User"};USER;;;\nFN:${userName || pushname || "User"}\nitem1.TEL;waid=${sender?.split('@')[0] || '0'}:${sender?.split('@')[0] || '0'}\nitem1.X-ABLabel:User\nEND:VCARD`
                }
            }
        }
    });
}
// =====================================================

cmd({
  pattern: "quran",
  alias: ["surah"],
  react: "🤍",
  desc: "Get Quran Surah details and explanation.",
  category: "main",
  filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
  try {

    let surahInput = args[0];

    if (!surahInput) {
      // This reply will also use formatted message
      await sendFormattedMessage(
          conn, 
          from, 
          '📖 *Type Surah Number or Name*\nExample: .quran 1\nOr .surahmenu for complete list', 
          sender, 
          pushname,
          "Error - Missing Input",
          "Please provide surah number or name"
      );
      return;
    }

    let surahListRes = await fetchJson('https://quran-endpoint.vercel.app/quran');
    let surahList = surahListRes.data;

    let surahData = surahList.find(surah => 
        surah.number === Number(surahInput) || 
        surah.asma.ar.short.toLowerCase() === surahInput.toLowerCase() || 
        surah.asma.en.short.toLowerCase() === surahInput.toLowerCase()
    );

    if (!surahData) {
      await sendFormattedMessage(
          conn, 
          from, 
          `❌ Couldn't find surah with number or name "${surahInput}"`, 
          sender, 
          pushname,
          "Error - Surah Not Found",
          "Check spelling or number"
      );
      return;
    }

    let res = await fetch(`https://quran-endpoint.vercel.app/quran/${surahData.number}`);
    
    if (!res.ok) {
      let error = await res.json(); 
      await sendFormattedMessage(
          conn, 
          from, 
          `❌ API request failed with status ${res.status}: ${error.message}`, 
          sender, 
          pushname,
          "Error - API Failed",
          "Please try again later"
      );
      return;
    }

    let json = await res.json();

    let translatedTafsirUrdu = await translate(json.data.tafsir.id, { to: 'ur', autoCorrect: true });
    let translatedTafsirEnglish = await translate(json.data.tafsir.id, { to: 'en', autoCorrect: true });

    let quranSurah = `
🕋 *Quran: The Holy Book* ♥️🌹

📖 *Surah ${json.data.number}: ${json.data.asma.ar.long}*
📖 *(${json.data.asma.en.long})*

💫 *Type:* ${json.data.type.en}
✅ *Verses:* ${json.data.ayahCount}

⚡🔮 *Explanation (Urdu):*
${translatedTafsirUrdu.text}

⚡🔮 *Explanation (English):*
${translatedTafsirEnglish.text}

━━━━━━━━━━━━━━━━
*ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɴᴊᴀʙᴜʟᴏ ᴜɪ*
`;

    // Main Quran message using formatted function
    await sendFormattedMessage(
        conn, 
        from, 
        quranSurah, 
        sender, 
        pushname,
        "Quran Tafsir & Explanation",
        `Surah ${json.data.number}: ${json.data.asma.en.long}`
    );

    // Send recitation if available (this is audio, doesn't need formatting)
    if (json.data.recitation.full) {
      await conn.sendMessage(from, {
        audio: { url: json.data.recitation.full },
        mimetype: 'audio/mpeg',  
        ptt: true
      }, { quoted: mek });
    }

  } catch (error) {
    console.error(error);
    await sendFormattedMessage(
        conn, 
        from, 
        `❌ Error: ${error.message}`, 
        sender, 
        pushname,
        "Error Occurred",
        "Please try again"
    );
  }
});

cmd({
    pattern: "quranmenu",
    alias: ["surahmenu", "surahlist"],
    desc: "Get complete Quran Surah list",
    category: "menu",
    react: "❤️",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        let surahMenu = `❤️ ⊷┈ *QURAN KAREEM* ┈⊷ 🤍

💫 *Complete Surah List with Numbers* 💫
*Type .quran <number> to read*

━━━━━━━━━━━━━━━━

1. Al-Fatiha (The Opening) - الفاتحہ
2. Al-Baqarah (The Cow) - البقرہ
3. Aali Imran (Family of Imran) - آل عمران
4. An-Nisa' (The Women) - النساء
5. Al-Ma'idah (The Table) - المائدہ
6. Al-An'am (The Cattle) - الانعام
7. Al-A'raf (The Heights) - الأعراف
8. Al-Anfal (Spoils of War) - الانفال
9. At-Tawbah (Repentance) - التوبہ
10. Yunus (Jonah) - یونس

*And 104 more surahs...*

━━━━━━━━━━━━━━━━
📖 *Use .quran <1-114>*
*Example: .quran 36 (Ya-Sin)*

*ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɴᴊᴀʙᴜʟᴏ ᴜɪ*`;

        // Menu message using formatted function
        await sendFormattedMessage(
            conn, 
            from, 
            surahMenu, 
            sender, 
            pushname,
            "Complete Quran Surah List",
            "114 Surahs of Holy Quran"
        );

        // Send audio recitation (no formatting needed for audio)
        await conn.sendMessage(from, {
            audio: { url: 'https://github.com/criss-vevo/CRISS-DATA/raw/refs/heads/main/autovoice/Quran.m4a' },
            mimetype: 'audio/mp4',
            ptt: false
        }, { quoted: mek });
        
    } catch (e) {
        console.log(e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ Error: ${e.message}`, 
            sender, 
            pushname,
            "Error Occurred",
            "Please try again"
        );
    }
});
