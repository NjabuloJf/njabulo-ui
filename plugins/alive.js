const { cmd } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');
const config = require('../config');

cmd({
    pattern: "alive",
    alias: ["status", "online", "a"],
    desc: "Check bot is alive or not",
    category: "main",
    react: "🏓",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        const status = `
*ᴀʟɪᴠᴇ ᴜᴩᴛɪᴍᴇ: (${runtime(process.uptime())})*`;

        await conn.sendMessage(from, {
          text: status,
          contextInfo: {
              isForwarded: true,
               forwardedNewsletterMessageInfo: {
                 newsletterJid: config.NEWSLETTER,
                   newsletterName: '╭••➤ɴᴊᴀʙᴜʟᴏ ᴜɪ',
                   serverMessageId: 143
               },
                forwardingScore: 999,
                externalAdReply: {
                    title: "",
                    body: "",
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
                    displayName: "ɴᴊᴀʙᴜʟᴏ ᴜɪ",
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Njabulo-Jb;BOT;;;\nFN:Njabulo-Jb\nitem1.TEL;waid=254700000000:+254 700 000000\nitem1.X-ABLabel:Bot\nEND:VCARD`
                }
            }
        } });

    } catch (e) {
        console.error("Alive Error:", e);
        reply(`An error occurred: ${e.message}`);
    }
});

  
