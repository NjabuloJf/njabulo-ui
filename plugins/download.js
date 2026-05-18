const { fetchJson } = require("../lib/functions");
const { downloadTiktok } = require("@mrnima/tiktok-downloader");
const { facebook } = require("@mrnima/facebook-downloader");
const cheerio = require("cheerio");
const { igdl } = require("ruhend-scraper");
const axios = require("axios");
const { cmd, commands } = require('../command');
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
                    body: externalBody || "Downloader System",
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

// Instagram Downloader
cmd({
  pattern: "ig2",
  alias: ["insta2", "Instagram2"],
  desc: "To download Instagram videos.",
  react: "🎥",
  category: "download",
  filename: __filename
}, async (conn, mek, m, { from, q, reply, sender, pushname }) => {
  try {
    if (!q || !q.startsWith("http")) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *Please provide a valid Instagram link*\n\n📌 *Usage:* .ig2 https://www.instagram.com/reel/xxxx", 
        sender, 
        pushname,
        "Instagram Downloader - Error",
        "No URL provided"
      );
      return;
    }

    await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

    await sendFormattedMessage(
      conn, 
      from, 
      "📥 *Fetching Instagram video...*\n\n⏳ Please wait.", 
      sender, 
      pushname,
      "Instagram Downloader",
      "Processing..."
    );

    const response = await axios.get(`https://api.davidcyriltech.my.id/instagram?url=${q}`, { timeout: 20000 });
    const data = response.data;

    if (!data || data.status !== 200 || !data.downloadUrl) {
      await sendFormattedMessage(
        conn, 
        from, 
        "⚠️ *Failed to fetch Instagram video*\n\nPlease check the link and try again.", 
        sender, 
        pushname,
        "Instagram Downloader - Error",
        "Video not found"
      );
      return;
    }

    await conn.sendMessage(from, {
      video: { url: data.downloadUrl },
      mimetype: "video/mp4",
      caption: "📥 *Instagram Video Downloaded Successfully!*"
    }, { quoted: mek });

    await sendFormattedMessage(
      conn, 
      from, 
      "✅ *Video sent successfully!*\n\nEnjoy your Instagram video.", 
      sender, 
      pushname,
      "Instagram Downloader - Complete",
      "Video delivered"
    );

  } catch (error) {
    console.error("Error:", error);
    await sendFormattedMessage(
      conn, 
      from, 
      "❌ *An error occurred*\n\nPlease try again later.", 
      sender, 
      pushname,
      "Instagram Downloader - Error",
      "Request failed"
    );
  }
});

// Twitter Downloader
cmd({
  pattern: "twitter",
  alias: ["tweet", "twdl"],
  desc: "Download Twitter videos",
  category: "download",
  filename: __filename
}, async (conn, mek, m, { from, quoted, q, reply, sender, pushname }) => {
  try {
    if (!q || !q.startsWith("https://")) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *Please provide a valid Twitter URL*\n\n📌 *Usage:* .twitter https://twitter.com/user/status/123456789", 
        sender, 
        pushname,
        "Twitter Downloader - Error",
        "No URL provided"
      );
      return;
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

    await sendFormattedMessage(
      conn, 
      from, 
      "📥 *Fetching Twitter video...*\n\n⏳ Please wait.", 
      sender, 
      pushname,
      "Twitter Downloader",
      "Processing..."
    );

    const response = await axios.get(`https://www.dark-yasiya-api.site/download/twitter?url=${q}`, { timeout: 20000 });
    const data = response.data;

    if (!data || !data.status || !data.result) {
      await sendFormattedMessage(
        conn, 
        from, 
        "⚠️ *Failed to retrieve Twitter video*\n\nPlease check the link and try again.", 
        sender, 
        pushname,
        "Twitter Downloader - Error",
        "Video not found"
      );
      return;
    }

    const { desc, thumb, video_sd, video_hd } = data.result;

    const caption = `🎵 *TWITTER DOWNLOADER* 🎵

📝 *Description:* ${desc || "No description"}

📹 *Download Options:*
1️⃣ SD Quality
2️⃣ HD Quality

🎵 *Audio Options:*
3️⃣ Audio
4️⃣ Document
5️⃣ Voice

📌 *Reply with the number to download your choice.`;

    const sentMsg = await conn.sendMessage(from, {
      image: { url: thumb },
      caption: caption
    }, { quoted: mek });

    const messageID = sentMsg.key.id;

    conn.ev.on("messages.upsert", async (msgData) => {
      const receivedMsg = msgData.messages[0];
      if (!receivedMsg.message) return;

      const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
      const senderID = receivedMsg.key.remoteJid;
      const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

      if (isReplyToBot) {
        await conn.sendMessage(senderID, { react: { text: '⬇️', key: receivedMsg.key } });

        switch (receivedText) {
          case "1":
            await conn.sendMessage(senderID, {
              video: { url: video_sd },
              caption: "📥 *Downloaded in SD Quality*"
            }, { quoted: receivedMsg });
            break;
          case "2":
            await conn.sendMessage(senderID, {
              video: { url: video_hd },
              caption: "📥 *Downloaded in HD Quality*"
            }, { quoted: receivedMsg });
            break;
          case "3":
            await conn.sendMessage(senderID, {
              audio: { url: video_sd },
              mimetype: "audio/mpeg"
            }, { quoted: receivedMsg });
            break;
          case "4":
            await conn.sendMessage(senderID, {
              document: { url: video_sd },
              mimetype: "audio/mpeg",
              fileName: "Twitter_Audio.mp3",
              caption: "📥 *Audio Downloaded as Document*"
            }, { quoted: receivedMsg });
            break;
          case "5":
            await conn.sendMessage(senderID, {
              audio: { url: video_sd },
              mimetype: "audio/mp4",
              ptt: true
            }, { quoted: receivedMsg });
            break;
          default:
            reply("❌ Invalid option! Please reply with 1, 2, 3, 4, or 5.");
        }
      }
    });

  } catch (error) {
    console.error("Error:", error);
    await sendFormattedMessage(
      conn, 
      from, 
      "❌ *An error occurred*\n\nPlease try again later.", 
      sender, 
      pushname,
      "Twitter Downloader - Error",
      "Request failed"
    );
  }
});

// MediaFire Downloader
cmd({
  pattern: "mediafire",
  alias: ["mfire"],
  desc: "To download MediaFire files.",
  react: "🎥",
  category: "download",
  filename: __filename
}, async (conn, mek, m, { from, quoted, q, reply, sender, pushname }) => {
  try {
    if (!q) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *Please provide a valid MediaFire link*\n\n📌 *Usage:* .mediafire https://www.mediafire.com/file/xxxx", 
        sender, 
        pushname,
        "MediaFire Downloader - Error",
        "No URL provided"
      );
      return;
    }

    await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

    await sendFormattedMessage(
      conn, 
      from, 
      "📥 *Fetching MediaFire file...*\n\n⏳ Please wait.", 
      sender, 
      pushname,
      "MediaFire Downloader",
      "Processing..."
    );

    const response = await axios.get(`https://www.dark-yasiya-api.site/download/mfire?url=${q}`, { timeout: 30000 });
    const data = response.data;

    if (!data || !data.status || !data.result || !data.result.dl_link) {
      await sendFormattedMessage(
        conn, 
        from, 
        "⚠️ *Failed to fetch MediaFire download link*\n\nEnsure the link is valid and public.", 
        sender, 
        pushname,
        "MediaFire Downloader - Error",
        "File not found"
      );
      return;
    }

    const { dl_link, fileName, fileType } = data.result;
    const file_name = fileName || "mediafire_download";
    const mime_type = fileType || "application/octet-stream";

    await conn.sendMessage(from, { react: { text: "⬆️", key: mek.key } });

    await conn.sendMessage(from, {
      document: { url: dl_link },
      mimetype: mime_type,
      fileName: file_name,
      caption: `📥 *File:* ${file_name}\n📁 *Type:* ${mime_type}\n\n✅ *Download successful!*`
    }, { quoted: mek });

    await sendFormattedMessage(
      conn, 
      from, 
      "✅ *File sent successfully!*", 
      sender, 
      pushname,
      "MediaFire Downloader - Complete",
      "File delivered"
    );

  } catch (error) {
    console.error("Error:", error);
    await sendFormattedMessage(
      conn, 
      from, 
      "❌ *An error occurred*\n\nPlease try again later.", 
      sender, 
      pushname,
      "MediaFire Downloader - Error",
      "Request failed"
    );
  }
});

// APK Downloader
cmd({
  pattern: "apk",
  desc: "Download APK from Aptoide.",
  category: "download",
  filename: __filename
}, async (conn, mek, m, { from, quoted, q, reply, sender, pushname }) => {
  try {
    if (!q) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *Please provide an app name to search*\n\n📌 *Usage:* .apk whatsapp", 
        sender, 
        pushname,
        "APK Downloader - Error",
        "No app name"
      );
      return;
    }

    await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

    await sendFormattedMessage(
      conn, 
      from, 
      `🔍 *Searching for:* ${q}\n\n⏳ Please wait.`, 
      sender, 
      pushname,
      "APK Downloader",
      "Searching..."
    );

    const apiUrl = `http://ws75.aptoide.com/api/7/apps/search/query=${q}/limit=1`;
    const response = await axios.get(apiUrl, { timeout: 15000 });
    const data = response.data;

    if (!data || !data.datalist || !data.datalist.list.length) {
      await sendFormattedMessage(
        conn, 
        from, 
        `⚠️ *No results found for:* "${q}"\n\nPlease try a different app name.`, 
        sender, 
        pushname,
        "APK Downloader - Error",
        "App not found"
      );
      return;
    }

    const app = data.datalist.list[0];
    const appSize = (app.size / 1048576).toFixed(2);

    await conn.sendMessage(from, { react: { text: "⬆️", key: mek.key } });

    await conn.sendMessage(from, {
      document: { url: app.file.path_alt },
      fileName: `${app.name}.apk`,
      mimetype: "application/vnd.android.package-archive",
      caption: `📦 *APK Downloader*

📦 *Name:* ${app.name}
🏋️ *Size:* ${appSize} MB
📦 *Package:* ${app.package}
📅 *Updated:* ${app.updated}
👨‍💻 *Developer:* ${app.developer.name}

✅ *APK sent successfully!*`
    }, { quoted: mek });

    await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

  } catch (error) {
    console.error("Error:", error);
    await sendFormattedMessage(
      conn, 
      from, 
      "❌ *An error occurred*\n\nPlease try again later.", 
      sender, 
      pushname,
      "APK Downloader - Error",
      "Request failed"
    );
  }
});

// Google Drive Downloader
cmd({
  pattern: "gdrive",
  desc: "Download Google Drive files.",
  react: "🌐",
  category: "download",
  filename: __filename
}, async (conn, mek, m, { from, quoted, q, reply, sender, pushname }) => {
  try {
    if (!q) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *Please provide a valid Google Drive link*\n\n📌 *Usage:* .gdrive https://drive.google.com/file/d/xxxx", 
        sender, 
        pushname,
        "Google Drive Downloader - Error",
        "No URL provided"
      );
      return;
    }

    await conn.sendMessage(from, { react: { text: "⬇️", key: mek.key } });

    await sendFormattedMessage(
      conn, 
      from, 
      "📥 *Fetching Google Drive file...*\n\n⏳ Please wait.", 
      sender, 
      pushname,
      "Google Drive Downloader",
      "Processing..."
    );

    const apiUrl = `https://api.fgmods.xyz/api/downloader/gdrive?url=${q}&apikey=mnp3grlZ`;
    const response = await axios.get(apiUrl, { timeout: 30000 });
    const downloadUrl = response.data.result.downloadUrl;

    if (downloadUrl) {
      await conn.sendMessage(from, { react: { text: "⬆️", key: mek.key } });

      await conn.sendMessage(from, {
        document: { url: downloadUrl },
        mimetype: response.data.result.mimetype,
        fileName: response.data.result.fileName,
        caption: `📁 *File:* ${response.data.result.fileName}\n📂 *Type:* ${response.data.result.mimetype}\n\n✅ *Download successful!*`
      }, { quoted: mek });

      await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

      await sendFormattedMessage(
        conn, 
        from, 
        "✅ *File sent successfully!*", 
        sender, 
        pushname,
        "Google Drive Downloader - Complete",
        "File delivered"
      );
    } else {
      await sendFormattedMessage(
        conn, 
        from, 
        "⚠️ *No download URL found*\n\nPlease check the link and try again.", 
        sender, 
        pushname,
        "Google Drive Downloader - Error",
        "No URL found"
      );
    }
  } catch (error) {
    console.error("Error:", error);
    await sendFormattedMessage(
      conn, 
      from, 
      "❌ *An error occurred*\n\nPlease try again later.", 
      sender, 
      pushname,
      "Google Drive Downloader - Error",
      "Request failed"
    );
  }
});
