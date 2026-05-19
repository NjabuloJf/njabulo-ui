const { cmd } = require("../command");
const axios = require("axios");
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
                    body: externalBody || "Random Wallpaper",
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
  pattern: "rw",
  alias: ["randomwall", "wallpaper", "wall", "randomwp"],
  react: "🌌",
  desc: "Download random wallpapers based on keywords.",
  category: "wallpapers",
  use: ".rw <keyword>",
  filename: __filename
}, async (conn, mek, m, { from, args, reply, sender, pushname }) => {
  try {
    const query = args.join(" ") || "random";
    
    await sendFormattedMessage(
      conn, 
      from, 
      `🌌 *Searching for wallpaper...*\n\n🔍 *Keyword:* ${query}\n⏳ Please wait!`, 
      sender, 
      pushname,
      "Random Wallpaper",
      "Searching"
    );

    const apiUrl = `https://pikabotzapi.vercel.app/random/randomwall/?apikey=anya-md&query=${encodeURIComponent(query)}`;
    const { data } = await axios.get(apiUrl, { timeout: 20000 });
    
    if (data.status && data.imgUrl) {
      const caption = `🌌 *RANDOM WALLPAPER* 🌌

🔍 *Keyword:* ${query}
📸 *Format:* High Quality

✅ *Wallpaper fetched successfully!*`;

      await conn.sendMessage(from, { 
        image: { url: data.imgUrl }, 
        caption: caption 
      }, { quoted: mek });

      await sendFormattedMessage(
        conn, 
        from, 
        `✅ *Wallpaper delivered!*\n\n🌌 Enjoy your ${query} wallpaper.`, 
        sender, 
        pushname,
        "Random Wallpaper - Success",
        `Wallpaper: ${query}`
      );
    } else {
      await sendFormattedMessage(
        conn, 
        from, 
        `❌ *No wallpaper found for* "${query}"*\n\nPlease try a different keyword.\n\n📌 *Example:* .rw nature`, 
        sender, 
        pushname,
        "Random Wallpaper - Error",
        "No results"
      );
    }
  } catch (error) {
    console.error("Wallpaper Error:", error);
    await sendFormattedMessage(
      conn, 
      from, 
      `❌ *An error occurred*\n\n${error.message}\n\nPlease try again later.`, 
      sender, 
      pushname,
      "Random Wallpaper - Error",
      "Request failed"
    );
  }
});
