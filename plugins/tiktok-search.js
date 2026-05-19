const fetch = require("node-fetch");
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
                    body: externalBody || "TikTok Search",
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
  pattern: "tiktoksearch",
  alias: ["tiktoks", "tiks", "ttsearch"],
  desc: "Search for TikTok videos using a query.",
  react: '✅',
  category: 'tools',
  filename: __filename
}, async (conn, mek, m, {
  from,
  args,
  reply,
  sender,
  pushname
}) => {
  if (!args[0]) {
    await sendFormattedMessage(
      conn, 
      from, 
      "🌸 *What do you want to search on TikTok?*\n\n📌 *Usage:* .tiktoksearch funny cats\n🔍 *Example:* .tiktoksearch dance", 
      sender, 
      pushname,
      "TikTok Search - Error",
      "No query"
    );
    return;
  }

  const query = args.join(" ");
  await conn.sendMessage(from, { react: { text: '⌛', key: mek.key } });

  await sendFormattedMessage(
    conn, 
    from, 
    `🔎 *Searching TikTok for:* "${query}"\n\n⏳ Please wait!`, 
    sender, 
    pushname,
    "TikTok Search",
    `Searching: ${query}`
  );

  try {
    const response = await fetch(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(query)}`, { timeout: 20000 });
    const data = await response.json();

    if (!data || !data.data || data.data.length === 0) {
      await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
      await sendFormattedMessage(
        conn, 
        from, 
        `❌ *No results found for:* "${query}"\n\nPlease try with a different keyword.`, 
        sender, 
        pushname,
        "TikTok Search - Error",
        "No results"
      );
      return;
    }

    const results = data.data.slice(0, 7).sort(() => Math.random() - 0.5);
    let sentCount = 0;

    await sendFormattedMessage(
      conn, 
      from, 
      `📱 *Found ${data.data.length} results for:* "${query}"\n\n📤 *Sending ${results.length} videos...*`, 
      sender, 
      pushname,
      "TikTok Search",
      `${results.length} videos`
    );

    for (const video of results) {
      const message = `📱 *TIKTOK VIDEO RESULT* 📱

📌 *Title:* ${video.title}
👤 *Author:* ${video.author || 'Unknown'}
⏱️ *Duration:* ${video.duration || "Unknown"}
🔗 *URL:* ${video.link}

━━━━━━━━━━━━━━━━
✅ *Video ${sentCount + 1}/${results.length}*`;

      if (video.nowm) {
        await conn.sendMessage(from, {
          video: { url: video.nowm },
          caption: message
        }, { quoted: mek });
        sentCount++;
      } else {
        await sendFormattedMessage(
          conn, 
          from, 
          `❌ *Failed to retrieve video for:* "${video.title}"`, 
          sender, 
          pushname,
          "TikTok Search - Warning",
          "Video unavailable"
        );
      }
      
      // Small delay between videos
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
    
    await sendFormattedMessage(
      conn, 
      from, 
      `✅ *Search completed!*\n\n📊 *Found:* ${data.data.length} results\n📤 *Sent:* ${sentCount} videos\n🔍 *Query:* "${query}"`, 
      sender, 
      pushname,
      "TikTok Search - Complete",
      `${sentCount} videos sent`
    );
    
  } catch (error) {
    console.error("Error in TikTokSearch command:", error);
    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    await sendFormattedMessage(
      conn, 
      from, 
      `❌ *An error occurred while searching TikTok.*\n\n${error.message}\n\nPlease try again later.`, 
      sender, 
      pushname,
      "TikTok Search - Error",
      "Request failed"
    );
  }
});
