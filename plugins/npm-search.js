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
                    body: externalBody || "NPM Package Search",
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
  pattern: "npm",
  alias: ["npmpackage", "node", "package"],
  desc: "Search for a package on npm.",
  react: '📦',
  category: "convert",
  filename: __filename,
  use: ".npm <package-name>"
}, async (conn, mek, msg, { from, args, reply, sender, pushname }) => {
  try {
    if (!args.length) {
      await sendFormattedMessage(
        conn, 
        from, 
        "📦 *Please provide an npm package name*\n\n📌 *Usage:* .npm express\n🔍 *Example:* .npm axios", 
        sender, 
        pushname,
        "NPM Search - Error",
        "No package name"
      );
      return;
    }

    const packageName = args.join(" ");
    
    await sendFormattedMessage(
      conn, 
      from, 
      `📦 *Searching for npm package...*\n\n📦 *Package:* ${packageName}\n⏳ Please wait!`, 
      sender, 
      pushname,
      "NPM Search",
      "Searching npm"
    );

    const apiUrl = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;
    const response = await axios.get(apiUrl, { timeout: 15000 });
    
    if (response.status !== 200) {
      throw new Error("Package not found or an error occurred.");
    }

    const packageData = response.data;
    const latestVersion = packageData["dist-tags"].latest;
    const description = packageData.description || "No description available.";
    const npmUrl = `https://www.npmjs.com/package/${packageName}`;
    const license = packageData.license || "Unknown";
    const repository = packageData.repository ? packageData.repository.url.replace(/^git\+/, '').replace(/\.git$/, '') : "Not available";
    
    // Get weekly downloads if available
    let weeklyDownloads = "Not available";
    try {
      const downloadsUrl = `https://api.npmjs.org/downloads/point/last-week/${packageName}`;
      const downloadRes = await axios.get(downloadsUrl);
      if (downloadRes.data.downloads) {
        weeklyDownloads = downloadRes.data.downloads.toLocaleString();
      }
    } catch (e) {
      // Ignore download stats error
    }
    
    // Get maintainers
    const maintainers = packageData.maintainers ? packageData.maintainers.map(m => m.name).join(", ") : "Not available";
    
    const message = `📦 *NPM PACKAGE INFO* 📦

📦 *Package:* ${packageName}
📄 *Description:* ${description}
⏸️ *Version:* ${latestVersion}
🪪 *License:* ${license}
📊 *Weekly Downloads:* ${weeklyDownloads}
👥 *Maintainers:* ${maintainers}
🪩 *Repository:* ${repository}
🔗 *NPM URL:* ${npmUrl}

✅ *Package info fetched!*`;

    await sendFormattedMessage(
      conn, 
      from, 
      message, 
      sender, 
      pushname,
      "NPM Package Info",
      `${packageName} - v${latestVersion}`
    );

  } catch (error) {
    console.error("Error:", error);
    
    let errorMsg = "";
    if (error.response && error.response.status === 404) {
      errorMsg = `❌ *Package not found*\n\n"${args?.join(" ") || "unknown"}" does not exist on npm.\n\n📌 *Example:* .npm express`;
    } else {
      errorMsg = `❌ *Error fetching npm package*\n\n${error.message}`;
    }
    
    await sendFormattedMessage(
      conn, 
      from, 
      errorMsg, 
      sender, 
      pushname,
      "NPM Search - Error",
      "Request failed"
    );
  }
});
