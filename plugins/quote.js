const axios = require("axios");
const { cmd } = require("../command");
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
                    body: externalBody || "Quote Generator",
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
  pattern: "quote",
  alias: ["inspire", "motivation", "dailyquote"],
  desc: "Get a random inspiring quote.",
  category: "fun",
  react: "💬",
  filename: __filename
}, async (conn, mek, m, { from, reply, sender, pushname }) => {
  try {
    await sendFormattedMessage(
      conn, 
      from, 
      "💬 *Fetching an inspiring quote for you...* ⏳", 
      sender, 
      pushname,
      "Quote Generator",
      "Loading quote"
    );

    const response = await axios.get("https://api.quotable.io/random", { timeout: 10000 });
    const { content, author } = response.data;

    const message = `💬 *INSPIRING QUOTE* 💬

"${content}"

━ *${author}* ━

✨ *Keep pushing forward!* ✨`;

    await sendFormattedMessage(
      conn, 
      from, 
      message, 
      sender, 
      pushname,
      "Quote Generator",
      `Quote by ${author}`
    );
  } catch (error) {
    console.error("Error fetching quote:", error);
    await sendFormattedMessage(
      conn, 
      from, 
      "⚠️ *An error occurred while fetching a quote.*\n\nPlease try again later.", 
      sender, 
      pushname,
      "Quote - Error",
      "Request failed"
    );
  }
});
