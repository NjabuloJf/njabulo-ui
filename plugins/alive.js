const { fana } = require('../njabulo');
const os = require("os");
const { runtime } = require('../lib/functions');
const config = require('../config');

fana({
    name: "alive",
    alias: ["status", "online", "a"],
    desc: "Check bot is alive or not",
    category: "main",
    react: "🏓",
    fromMe: false,
    filename: __filename
},
async (conn, mek, args, { from, sender, pushname, reply }) => {
    try {
        // Get the user's name (pushname is their display name)
        const userName = pushname || sender.split('@')[0] || "User";
        
        const status = `⏰ *ᴜᴩᴛɪᴍᴇ* : ${runtime(process.uptime())} *ᴀʟɪᴠᴇ ᴜᴩᴛɪᴍᴇ: (${runtime(process.uptime())})*`;

        await conn.sendMessage(from, {
          text: status,
          contextInfo: {
              isForwarded: true,
              title: "ɴᴊᴀʙᴜʟᴏ ᴜɪ",
              body: `${userName}, Bot is alive!`,
              forwardedNewsletterMessageInfo: {
                 newsletterJid: config.NEWSLETTER,
                 newsletterName: '╭••➤ɴᴊᴀʙᴜʟᴏ ᴜɪ',
                 serverMessageId: 143
              },
              forwardingScore: 999,
              externalAdReply: {
                  title: "✨ ɴᴊᴀʙᴜʟᴏ ᴜɪ ✨",
                  body: `👋 Hello ${userName}!`,
                  thumbnailUrl: config.FANAIMG,
                  sourceUrl: config.NJABULOURL,
                  mediaType: 1,
                  renderSmallThumbnail: true
              }
          }
        }, { quoted: {
            key: {
                fromMe: false,
                participant: `0@s.whatsapp.net`,
                remoteJid: "status@broadcast"
            },
            message: {
                contactMessage: {
                    displayName: userName,  // Shows the user's name
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${userName};USER;;;\nFN:${userName}\nitem1.TEL;waid=${sender.split('@')[0]}:${sender.split('@')[0]}\nitem1.X-ABLabel:User\nEND:VCARD`
                }
            }
        } });

    } catch (e) {
        console.error("Alive Error:", e);
        reply(`An error occurred: ${e.message}`);
    }
});
