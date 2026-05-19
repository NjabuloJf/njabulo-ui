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
                    body: externalBody || "GitHub Repo Info",
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
  pattern: "srepo",
  alias: ["gitrepo", "repodata", "ghrepo"],
  desc: "Fetch information about a GitHub repository.",
  category: "other",
  react: "🍃",
  filename: __filename
}, async (conn, mek, m, { from, args, reply, sender, pushname }) => {
  try {
    const repoName = args.join(" ");
    if (!repoName) {
      await sendFormattedMessage(
        conn, 
        from, 
        "🍃 *Please provide a GitHub repository*\n\n📌 *Format:* owner/repo\n🔍 *Example:* .srepo NjabuloJf/njabulo-ui", 
        sender, 
        pushname,
        "GitHub Repo - Error",
        "No repo name"
      );
      return;
    }

    await sendFormattedMessage(
      conn, 
      from, 
      `🍃 *Fetching GitHub repository info...*\n\n📦 *Repo:* ${repoName}\n⏳ Please wait!`, 
      sender, 
      pushname,
      "GitHub Repo",
      "Fetching data"
    );

    const apiUrl = `https://api.github.com/repos/${repoName}`;
    const { data } = await axios.get(apiUrl, { timeout: 15000 });

    let responseMsg = `🍃 *GITHUB REPOSITORY INFO* 🍃

📦 *Name:* ${data.name}
🔗 *URL:* ${data.html_url}
📝 *Description:* ${data.description || "No description"}
⭐ *Stars:* ${data.stargazers_count}
🍴 *Forks:* ${data.forks_count}
👤 *Owner:* ${data.owner.login}
📅 *Created:* ${new Date(data.created_at).toLocaleDateString()}
🔄 *Updated:* ${new Date(data.updated_at).toLocaleDateString()}
📊 *Language:* ${data.language || "Unknown"}

✅ *Repository info fetched!*`;

    await sendFormattedMessage(
      conn, 
      from, 
      responseMsg, 
      sender, 
      pushname,
      "GitHub Repository",
      `${data.name} - ${data.stargazers_count} stars`
    );

  } catch (error) {
    console.error("GitHub API Error:", error);
    if (error.response?.status === 404) {
      await sendFormattedMessage(
        conn, 
        from, 
        `❌ *Repository not found*\n\n"${repoName}" does not exist.\n\n📌 *Format:* owner/repo\n🔍 *Example:* .srepo NjabuloJf/njabulo-ui`, 
        sender, 
        pushname,
        "GitHub Repo - Error",
        "Repo not found"
      );
    } else {
      await sendFormattedMessage(
        conn, 
        from, 
        `❌ *Error fetching repository data*\n\n${error.response?.data?.message || error.message}`, 
        sender, 
        pushname,
        "GitHub Repo - Error",
        "Request failed"
      );
    }
  }
});
