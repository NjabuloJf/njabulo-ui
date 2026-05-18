const { cmd } = require('../command');
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
                    body: externalBody || "Anti-Bad Word System",
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
        // Fallback to simple message if formatted fails
        await conn.sendMessage(from, { text: text });
    }
}

// Anti-Bad Words System
cmd({
  'on': "body"
}, async (conn, m, store, {
  from,
  body,
  isGroup,
  isAdmins,
  isBotAdmins,
  reply,
  sender,
  pushname
}) => {
  try {
    const badWords = ["wtf", "mia", "xxx", "fuck", 'sex', "huththa", "pakaya", 'ponnaya', "hutto", "bitch", "shit", "asshole", "pussy", "dick"];

    // Check if group, user is not admin, bot is admin, and anti-bad-word is enabled
    if (!isGroup || isAdmins || !isBotAdmins) {
      return;
    }

    if (config.ANTI_BAD_WORD !== "true") {
      return;
    }

    const messageText = body.toLowerCase();
    const containsBadWord = badWords.some(word => messageText.includes(word));

    if (containsBadWord) {
      // Delete the bad word message
      await conn.sendMessage(from, { 'delete': m.key }, { 'quoted': m });
      
      // Send formatted warning message
      await sendFormattedMessage(
        conn, 
        from, 
        "🚫 *⚠️ BAD WORDS ARE NOT ALLOWED ⚠️* 🚫\n\nPlease maintain respectful language in this group.\n\n_This is a warning!_", 
        sender, 
        pushname || "User",
        "Anti-Bad Word System",
        "Bad word detected and removed"
      );
    }
  } catch (error) {
    console.error("Anti-Bad Word Error:", error);
    // Optional: Uncomment to send error as formatted message
    // await sendFormattedMessage(
    //     conn, 
    //     from, 
    //     `❌ *Error:* ${error.message}`, 
    //     sender, 
    //     pushname,
    //     "System Error",
    //     "Anti-Bad Word System"
    // );
  }
});
