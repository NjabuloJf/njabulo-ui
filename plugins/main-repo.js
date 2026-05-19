const fetch = require('node-fetch');
const config = require('../config');    
const { cmd } = require('../command');

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
                    body: externalBody || "GitHub Repo",
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
    pattern: "repo",
    alias: ["sc", "script", "info", "sourcecode"],
    desc: "Fetch information about the bot's GitHub repository.",
    react: "📂",
    category: "info",
    filename: __filename,
},
async (conn, mek, m, { from, reply, sender, pushname }) => {
    const githubRepoURL = 'https://github.com/NjabuloJ/Njabulo-Jb';

    try {
        await sendFormattedMessage(
            conn, 
            from, 
            "📂 *Fetching repository information...*\n\n⏳ Please wait!", 
            sender, 
            pushname,
            "GitHub Repo",
            "Fetching data"
        );

        // Extract username and repo name from the URL
        const [, username, repoName] = githubRepoURL.match(/github\.com\/([^/]+)\/([^/]+)/);

        // Fetch repository details using GitHub API
        const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`);
        
        if (!response.ok) {
            throw new Error(`GitHub API request failed with status ${response.status}`);
        }

        const repoData = await response.json();

        // Format the repository information
        const formattedInfo = `📂 *BOT REPOSITORY* 📂

📦 *Bot Name:* ${repoData.name}
👤 *Owner:* ${repoData.owner.login}
⭐ *Stars:* ${repoData.stargazers_count}
🍴 *Forks:* ${repoData.forks_count}

📝 *Description:*
${repoData.description || 'No description available'}

📊 *Language:* ${repoData.language || 'Unknown'}
🔄 *Updated:* ${new Date(repoData.updated_at).toLocaleDateString()}

▬▬▬▬▬▬▬▬▬▬
🔗 *Bot links*
📥 *Owner links*
▬▬▬▬▬▬▬▬▬▬ 
⭐ *Don't forget to Star and Fork the repository!*`;


         await conn.sendMessage(from, { 
         image: { url: config.FANAIMG},    
         caption: formattedInfo,
         contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: config.NEWSLETTER,
                    newsletterName: '╭••➤ɴᴊᴀʙᴜʟᴏ ᴜɪ',
                    serverMessageId: 143
                },              
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
                        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${userName || "User"};USER;;;\nFN:${userName || "User"}\nitm1.TEL;waid=${sender?.split('@')[0] || '0'}:${sender?.split('@')[0] || '0'}\nitem1.X-ABLabel:User\nEND:VCARD`
                    }
                }
            }
        });

    } catch (error) {
        console.error("Error in repo command:", error);
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Sorry, something went wrong*\n\nPlease try again later.", 
            sender, 
            pushname,
            "Repository - Error",
            "Request failed"
        );
    }
});
