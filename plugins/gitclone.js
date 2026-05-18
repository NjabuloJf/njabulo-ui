const { cmd } = require("../command");
const fetch = require("node-fetch");
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
                    body: externalBody || "GitHub Downloader",
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
  pattern: 'gitclone',
  alias: ["git", "github", "repodl"],
  desc: "Download GitHub repository as a zip file.",
  react: '📦',
  category: "downloader",
  filename: __filename
}, async (conn, mek, m, {
  from,
  quoted,
  args,
  reply,
  sender,
  pushname
}) => {
  if (!args[0]) {
    await sendFormattedMessage(
      conn, 
      from, 
      "📦 *Please provide a GitHub repository link*\n\n📌 *Usage:* .gitclone https://github.com/username/repository\n🔍 *Example:* .gitclone https://github.com/NjabuloJf/njabulo-ui", 
      sender, 
      pushname,
      "GitHub Downloader - Error",
      "No URL provided"
    );
    return;
  }

  if (!/^(https:\/\/)?github\.com\/.+/.test(args[0])) {
    await sendFormattedMessage(
      conn, 
      from, 
      "⚠️ *Invalid GitHub link*\n\nPlease provide a valid GitHub repository URL.\n\n📌 *Example:* https://github.com/username/repository", 
      sender, 
      pushname,
      "GitHub Downloader - Error",
      "Invalid URL"
    );
    return;
  }

  try {
    const regex = /github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?/i;
    const match = args[0].match(regex);

    if (!match) {
      throw new Error("Invalid GitHub URL.");
    }

    const [, username, repo] = match;
    const zipUrl = `https://api.github.com/repos/${username}/${repo}/zipball`;

    // Check if repository exists
    const response = await fetch(zipUrl, { method: "HEAD" });
    if (!response.ok) {
      throw new Error("Repository not found.");
    }

    const contentDisposition = response.headers.get("content-disposition");
    const fileName = contentDisposition ? contentDisposition.match(/filename=(.*)/)[1] : `${repo}.zip`;

    // Notify user of the download
    await sendFormattedMessage(
      conn, 
      from, 
      `📥 *Downloading repository...*\n\n📦 *Repository:* ${username}/${repo}\n📁 *Filename:* ${fileName}\n⏳ Please wait!\n\n_File will be sent shortly_`, 
      sender, 
      pushname,
      "GitHub Downloader",
      `Downloading: ${repo}`
    );

    // Send the zip file to the user
    await conn.sendMessage(from, {
      document: { url: zipUrl },
      fileName: fileName,
      mimetype: 'application/zip',
      caption: `📦 *GitHub Repository*\n\n📌 *Repo:* ${username}/${repo}\n📁 *File:* ${fileName}\n\n✅ *Download complete!*`
    }, { quoted: mek });

    await sendFormattedMessage(
      conn, 
      from, 
      `✅ *Repository downloaded successfully!*\n\n📦 *Repository:* ${username}/${repo}\n📁 *File:* ${fileName}\n\n_Check the file above_`, 
      sender, 
      pushname,
      "GitHub Downloader - Complete",
      "File delivered"
    );

  } catch (error) {
    console.error("Error:", error);
    await sendFormattedMessage(
      conn, 
      from, 
      `❌ *Failed to download repository*\n\n${error.message || "Please try again later."}\n\n📌 Make sure the repository exists and is public.`, 
      sender, 
      pushname,
      "GitHub Downloader - Error",
      "Download failed"
    );
  }
});
