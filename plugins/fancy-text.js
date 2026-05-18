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
                    body: externalBody || "Fancy Font Converter",
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
  pattern: "fancy",
  alias: ["font", "style", "fancyfont"],
  react: "✍️",
  desc: "Convert text into various fonts.",
  category: "tools",
  filename: __filename
}, async (conn, mek, m, { from, quoted, args, q, reply, sender, pushname }) => {
  try {
    if (!q) {
      await sendFormattedMessage(
        conn, 
        from, 
        "✍️ *Please provide text to convert into fancy fonts*\n\n📌 *Usage:* .fancy Hello\n🔍 *Example:* .fancy NJABULO UI", 
        sender, 
        pushname,
        "Fancy Font - Error",
        "No text provided"
      );
      return;
    }

    await sendFormattedMessage(
      conn, 
      from, 
      `✨ *Converting text:* "${q}"\n\n⏳ Please wait...`, 
      sender, 
      pushname,
      "Fancy Font Converter",
      "Processing..."
    );

    const apiUrl = `https://www.dark-yasiya-api.site/other/font?text=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl, { timeout: 15000 });
    
    if (!response.data.status) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *Error fetching fonts*\n\nPlease try again later.", 
        sender, 
        pushname,
        "Fancy Font - Error",
        "API request failed"
      );
      return;
    }

    // Get first 10 fonts to avoid message too long
    const fonts = response.data.result.slice(0, 10).map(item => `🔤 *${item.name}:*\n${item.result}`).join("\n\n");
    
    const resultText = `✨ *FANCY FONTS CONVERTER* ✨

📝 *Original Text:* ${q}

${fonts}

✅ *Fonts generated successfully!*

⚡ *NJABULO UI*`;

    await sendFormattedMessage(
      conn, 
      from, 
      resultText, 
      sender, 
      pushname,
      "Fancy Font Converter",
      `Converted: ${q.substring(0, 30)}`
    );

  } catch (error) {
    console.error("❌ Error in fancy command:", error);
    await sendFormattedMessage(
      conn, 
      from, 
      `⚠️ *An error occurred*\n\n❌ ${error.message || "Failed to fetch fonts"}\n\nPlease try again later.`, 
      sender, 
      pushname,
      "Fancy Font - Error",
      "Request failed"
    );
  }
});
