const axios = require('axios');
const config = require('../config');
const { cmd, commands } = require('../command');

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
                    body: externalBody || "GitHub Stalker",
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
    pattern: "githubstalk",
    alias: ["ghstalk", "github", "ghuser"],
    desc: "Fetch detailed GitHub user profile including profile picture.",
    category: "menu",
    react: "🖥️",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        const username = args[0];
        if (!username) {
            await sendFormattedMessage(
                conn, 
                from, 
                "🖥️ *Please provide a GitHub username*\n\n📌 *Usage:* .githubstalk username\n🔍 *Example:* .githubstalk octocat", 
                sender, 
                pushname,
                "GitHub Stalker - Error",
                "No username provided"
            );
            return;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `🖥️ *Fetching GitHub user data...*\n\n👤 *Username:* ${username}\n⏳ Please wait!`, 
            sender, 
            pushname,
            "GitHub Stalker",
            "Fetching profile"
        );

        const apiUrl = `https://api.github.com/users/${username}`;
        const response = await axios.get(apiUrl, { timeout: 15000 });
        const data = response.data;

        // Calculate account age
        const createdDate = new Date(data.created_at);
        const now = new Date();
        const accountAge = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

        const userInfo = `🖥️ *GITHUB USER PROFILE* 🖥️

👤 *Username:* ${data.name || data.login}
🔗 *Profile URL:* ${data.html_url}
📝 *Bio:* ${data.bio || 'Not available'}

🏙️ *Location:* ${data.location || 'Unknown'}
📊 *Public Repos:* ${data.public_repos}
🔭 *Public Gists:* ${data.public_gists}

👥 *Followers:* ${data.followers}
⭐ *Following:* ${data.following}

📅 *Account created:* ${createdDate.toDateString()}
📆 *Account age:* ${accountAge} days

${data.company ? `🏢 *Company:* ${data.company}` : ''}
${data.blog ? `🌐 *Blog:* ${data.blog}` : ''}
${data.twitter_username ? `🐦 *Twitter:* @${data.twitter_username}` : ''}

✅ *Profile fetched successfully!*`;

        await conn.sendMessage(from, {
            image: { url: data.avatar_url },
            caption: userInfo
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        if (e.response && e.response.status === 404) {
            await sendFormattedMessage(
                conn, 
                from, 
                `❌ *User not found*\n\nNo GitHub user found with username "${args[0]}".\n\nPlease check the spelling and try again.`, 
                sender, 
                pushname,
                "GitHub Stalker - Error",
                "User not found"
            );
        } else {
            await sendFormattedMessage(
                conn, 
                from, 
                `❌ *Error fetching user data*\n\n${e.response ? e.response.data.message : e.message}\n\nPlease try again later.`, 
                sender, 
                pushname,
                "GitHub Stalker - Error",
                "Request failed"
            );
        }
    }
});
