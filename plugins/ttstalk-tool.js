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
                    body: externalBody || "TikTok Stalker",
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
  pattern: "tiktokstalk",
  alias: ["tstalk", "ttstalk", "ttprofile"],
  react: "📱",
  desc: "Fetch TikTok user profile details.",
  category: "search",
  filename: __filename
}, async (conn, mek, m, { from, args, q, reply, sender, pushname }) => {
  try {
    if (!q) {
      await sendFormattedMessage(
        conn, 
        from, 
        "📱 *Please provide a TikTok username*\n\n📌 *Usage:* .tiktokstalk mrbeast\n🔍 *Example:* .tstalk charlidamelio", 
        sender, 
        pushname,
        "TikTok Stalker - Error",
        "No username"
      );
      return;
    }

    await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

    await sendFormattedMessage(
      conn, 
      from, 
      `📱 *Fetching TikTok profile...*\n\n👤 *Username:* @${q}\n⏳ Please wait!`, 
      sender, 
      pushname,
      "TikTok Stalker",
      "Fetching data"
    );

    const apiUrl = `https://api.siputzx.my.id/api/stalk/tiktok?username=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl, { timeout: 15000 });

    if (!data.status) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *User not found*\n\nPlease check the username and try again.\n\n📌 *Example:* .tiktokstalk mrbeast", 
        sender, 
        pushname,
        "TikTok Stalker - Error",
        "User not found"
      );
      return;
    }

    const user = data.data.user;
    const stats = data.data.stats;

    const profileInfo = `📱 *TIKTOK PROFILE STALKER* 📱

👤 *Username:* @${user.uniqueId}
📛 *Nickname:* ${user.nickname}
✅ *Verified:* ${user.verified ? "Yes ✅" : "No ❌"}
📍 *Region:* ${user.region || "Unknown"}

📝 *Bio:* ${user.signature || "No bio available."}
🔗 *Bio Link:* ${user.bioLink?.link || "No link available."}

━━━━━━━━━━━━━━━━

📊 *STATISTICS*

👥 *Followers:* ${stats.followerCount.toLocaleString()}
👤 *Following:* ${stats.followingCount.toLocaleString()}
❤️ *Likes:* ${stats.heartCount.toLocaleString()}
🎥 *Videos:* ${stats.videoCount.toLocaleString()}

━━━━━━━━━━━━━━━━

📅 *Account Created:* ${new Date(user.createTime * 1000).toLocaleDateString()}
🔒 *Private Account:* ${user.privateAccount ? "Yes 🔒" : "No 🌍"}

🔗 *Profile URL:* https://www.tiktok.com/@${user.uniqueId}

━━━━━━━━━━━━━━━━
✅ *Profile fetched successfully!*`;

    const profileImage = { image: { url: user.avatarLarger }, caption: profileInfo };

    await conn.sendMessage(from, profileImage, { quoted: mek });

    await sendFormattedMessage(
      conn, 
      from, 
      `✅ *TikTok profile retrieved!*\n\n👤 *${user.nickname}* (@${user.uniqueId})\n👥 *Followers:* ${stats.followerCount.toLocaleString()}\n🎥 *Videos:* ${stats.videoCount.toLocaleString()}`, 
      sender, 
      pushname,
      "TikTok Stalker - Success",
      "Profile delivered"
    );

  } catch (error) {
    console.error("❌ Error in TikTok stalk command:", error);
    await sendFormattedMessage(
      conn, 
      from, 
      `❌ *An error occurred*\n\n${error.message}\n\nPlease try again later.`, 
      sender, 
      pushname,
      "TikTok Stalker - Error",
      "Request failed"
    );
  }
});
