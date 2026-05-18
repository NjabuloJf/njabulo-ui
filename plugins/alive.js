const { fana } = require('../njabulo');
const os = require("os");
const { runtime } = require('../lib/functions');
const config = require('../config');

fana({
    name: "alive",
    alias: ["status", "online", "a"],
    desc: "Check bot is alive or not",
    category: "main",
    fromMe: false,
    filename: __filename
},
async (conn, mek, args, { from, sender, pushname, reply }) => {
    try {
        // Add reaction manually
        await conn.sendMessage(from, { react: { text: "🏓", key: mek.key } });
        
        const userName = pushname || sender.split('@')[0] || "User";
        
        const status = `*ᴀʟɪᴠᴇ ᴜᴩᴛɪᴍᴇ: (${runtime(process.uptime())})*`;

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
        });

    } catch (e) {
        console.error("Alive Error:", e);
        reply(`An error occurred: ${e.message}`);
    }
});
