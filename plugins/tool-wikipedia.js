const { cmd, commands } = require("../command");
const { fetchJson } = require("../lib/functions");
const { translate } = require("@vitalets/google-translate-api");
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
                    body: externalBody || "Wikipedia",
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
  pattern: "wikipedia",
  alias: ["wiki", "wikipedia"],
  react: "📖",
  desc: "Fetch Wikipedia information and translate to English.",
  category: "information",
  filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, reply, pushname }) => {
  try {
    if (!q) {
      await sendFormattedMessage(
        conn, 
        from, 
        "📖 *Please provide a search query for Wikipedia*\n\n📌 *Usage:* .wiki Albert Einstein\n🔍 *Example:* .wikipedia Artificial Intelligence", 
        sender, 
        pushname,
        "Wikipedia - Error",
        "No query"
      );
      return;
    }

    await sendFormattedMessage(
      conn, 
      from, 
      `📖 *Searching Wikipedia...*\n\n🔍 *Query:* ${q}\n⏳ Please wait!`, 
      sender, 
      pushname,
      "Wikipedia",
      "Searching"
    );

    const response = await fetchJson(`https://api.siputzx.my.id/api/s/wikipedia?query=${encodeURIComponent(q)}`, { timeout: 15000 });

    if (!response.status || !response.data) {
      await sendFormattedMessage(
        conn, 
        from, 
        `❌ *No results found for:* "${q}"\n\nPlease try a different search term.`, 
        sender, 
        pushname,
        "Wikipedia - Error",
        "No results"
      );
      return;
    }

    const { wiki, thumb } = response.data;

    // Translate the Wikipedia text to English
    const translated = await translate(wiki, { to: "en" });

    // Truncate if too long (WhatsApp limit ~4000 chars)
    let content = translated.text;
    let truncated = false;
    if (content.length > 3800) {
      content = content.substring(0, 3500) + "\n\n... *[Continued...]*";
      truncated = true;
    }

    let message = `📖 *WIKIPEDIA RESULT* 📖

📝 *Query:* ${q}

━━━━━━━━━━━━━━━━

${content}

━━━━━━━━━━━━━━━━
✅ *Information fetched!*`;

    if (thumb) {
      await conn.sendMessage(from, {
        image: { url: thumb },
        caption: message
      }, { quoted: mek });
    } else {
      await sendFormattedMessage(
        conn, 
        from, 
        message, 
        sender, 
        pushname,
        "Wikipedia Result",
        `Search: ${q}`
      );
    }

  } catch (error) {
    console.error(error);
    await sendFormattedMessage(
      conn, 
      from, 
      `❌ *An error occurred:* ${error.message}`, 
      sender, 
      pushname,
      "Wikipedia - Error",
      "Request failed"
    );
  }
});
