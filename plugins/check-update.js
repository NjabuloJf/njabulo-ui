const axios = require('axios');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');
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
                    body: externalBody || "Version Info System",
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
  pattern: 'version',
  alias: ["changelog", "cupdate", "checkupdate", "ver", "status"],
  react: '🚀',
  desc: "Check bot's version, system stats, and update info.",
  category: 'info',
  filename: __filename
}, async (conn, mek, m, {
  from, sender, pushname, reply
}) => {
  try {
    // Read local version data
    const localVersionPath = path.join(__dirname, '../data/version.json');
    let localVersion = '1.0.0';
    let changelog = 'Initial release';
    
    if (fs.existsSync(localVersionPath)) {
      try {
        const localData = JSON.parse(fs.readFileSync(localVersionPath));
        localVersion = localData.version || '1.0.0';
        changelog = localData.changelog || 'No changelog available.';
      } catch (err) {
        console.error("Error parsing version.json:", err);
      }
    }

    // Fetch latest version data from GitHub
    const rawVersionUrl = 'https://raw.githubusercontent.com/NjabuloJf/njabulo-ui/main/data/version.json';
    let latestVersion = localVersion;
    let latestChangelog = changelog;
    let isUpdateAvailable = false;
    
    try {
      const { data } = await axios.get(rawVersionUrl, { timeout: 5000 });
      latestVersion = data.version || localVersion;
      latestChangelog = data.changelog || changelog;
      isUpdateAvailable = localVersion !== latestVersion;
    } catch (error) {
      console.error('Failed to fetch latest version:', error.message);
    }

    // Count total plugins
    const pluginPath = path.join(__dirname, '../plugins');
    let pluginCount = 0;
    if (fs.existsSync(pluginPath)) {
      pluginCount = fs.readdirSync(pluginPath).filter(file => file.endsWith('.js')).length;
    }

    // Count total registered commands
    const totalCommands = commands.length || 0;

    // System info
    const uptime = runtime(process.uptime());
    const ramUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const totalRam = (os.totalmem() / 1024 / 1024).toFixed(2);
    const hostName = os.hostname();
    const lastUpdate = fs.existsSync(localVersionPath) ? fs.statSync(localVersionPath).mtime.toLocaleString() : 'Unknown';

    // GitHub stats
    const githubRepo = 'https://github.com/NjabuloJf/njabulo-ui';
    
    // Time greeting
    const hour = new Date().getHours();
    let greeting = 'Night';
    if (hour < 12) greeting = 'Morning';
    else if (hour < 18) greeting = 'Afternoon';
    else greeting = 'Evening';

    // Build status message
    const statusMessage = `🚀 *NJABULO UI - VERSION INFO* 🚀

╭───〔 *BOT STATUS* 〕───◉
│
├▢ *Greeting:* Good ${greeting}, ${pushname || "User"}!
├▢ *Bot Name:* NJABULO UI
├▢ *Current Version:* ${localVersion}
├▢ *Latest Version:* ${latestVersion}
├▢ *Update Available:* ${isUpdateAvailable ? '✅ YES' : '❌ NO'}
├▢ *Total Plugins:* ${pluginCount}
├▢ *Total Commands:* ${totalCommands}
│
╰──────────────────◉

╭───〔 *SYSTEM INFO* 〕───◉
│
├▢ *Uptime:* ${uptime}
├▢ *RAM Usage:* ${ramUsage}MB / ${totalRam}MB
├▢ *Host Name:* ${hostName}
├▢ *Last Update:* ${lastUpdate}
│
╰──────────────────◉

╭───〔 *CHANGELOG* 〕───◉
│
${latestChangelog.split('\n').map(line => `├▢ ${line}`).join('\n')}
│
╰──────────────────◉

╭───〔 *LINKS* 〕───◉
│
├▢ *GitHub:* ${githubRepo}
├▢ *Owner:* Njabulo-Jb
│
╰──────────────────◉

${isUpdateAvailable ? '⚠️ *Update Available!* Use .update to get the latest version.' : '✅ *Your bot is up to date!*'}

━━━━━━━━━━━━━━━━
*Don't forget to star the repo!* ⭐`;

    // Send formatted message
    await sendFormattedMessage(
        conn, 
        from, 
        statusMessage, 
        sender, 
        pushname,
        "Version Information",
        `Version ${localVersion}`
    );
    
  } catch (error) {
    console.error('Error fetching version info:', error);
    await sendFormattedMessage(
        conn, 
        from, 
        `❌ *Error:* ${error.message || "An error occurred while checking the bot version."}`, 
        sender, 
        pushname,
        "Version Error",
        "Failed to get version info"
    );
  }
});
