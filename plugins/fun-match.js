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
                    body: externalBody || "Fun Selector",
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

// Command for random boy selection
cmd({
  pattern: "bacha",
  alias: ["boy", "larka", "handsome"],
  desc: "Randomly selects a boy from the group",
  react: "👦",
  category: "fun",
  filename: __filename
}, async (conn, mek, store, { isGroup, groupMetadata, reply, sender, pushname, from }) => {
  try {
    if (!isGroup) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *This command can only be used in groups!*", 
        sender, 
        pushname,
        "Bacha - Error",
        "Not a group"
      );
      return;
    }

    const participants = groupMetadata.participants;
    
    // Filter out bot
    const eligible = participants.filter(p => !p.id.includes(conn.user.id.split('@')[0]));
    
    if (eligible.length < 1) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *No eligible participants found!*\n\nNeed at least one other person in the group.", 
        sender, 
        pushname,
        "Bacha - Error",
        "No members"
      );
      return;
    }

    const randomUser = eligible[Math.floor(Math.random() * eligible.length)];
    
    await sendFormattedMessage(
      conn, 
      from, 
      `👦 *Yeh lo tumhara Bacha!* 👦\n\n@${randomUser.id.split('@')[0]} is your handsome boy!\n\n😎 *Mashallah!* ✨`, 
      sender, 
      pushname,
      "Bacha Selector",
      "Handsome boy selected"
    );

  } catch (error) {
    console.error("Error in .bacha command:", error);
    await sendFormattedMessage(
      conn, 
      from, 
      `❌ *Error:* ${error.message}`, 
      sender, 
      pushname,
      "Bacha - Error",
      "Command failed"
    );
  }
});

// Command for random girl selection
cmd({
  pattern: "bachi",
  alias: ["girl", "kuri", "larki", "beautiful"],
  desc: "Randomly selects a girl from the group",
  react: "👧",
  category: "fun",
  filename: __filename
}, async (conn, mek, store, { isGroup, groupMetadata, reply, sender, pushname, from }) => {
  try {
    if (!isGroup) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *This command can only be used in groups!*", 
        sender, 
        pushname,
        "Bachi - Error",
        "Not a group"
      );
      return;
    }

    const participants = groupMetadata.participants;
    
    // Filter out bot
    const eligible = participants.filter(p => !p.id.includes(conn.user.id.split('@')[0]));
    
    if (eligible.length < 1) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *No eligible participants found!*\n\nNeed at least one other person in the group.", 
        sender, 
        pushname,
        "Bachi - Error",
        "No members"
      );
      return;
    }

    const randomUser = eligible[Math.floor(Math.random() * eligible.length)];
    
    await sendFormattedMessage(
      conn, 
      from, 
      `👧 *Yeh lo tumhari Bachi!* 👧\n\n@${randomUser.id.split('@')[0]} is your beautiful girl!\n\n💖 *Mashallah!* ✨`, 
      sender, 
      pushname,
      "Bachi Selector",
      "Beautiful girl selected"
    );

  } catch (error) {
    console.error("Error in .bachi command:", error);
    await sendFormattedMessage(
      conn, 
      from, 
      `❌ *Error:* ${error.message}`, 
      sender, 
      pushname,
      "Bachi - Error",
      "Command failed"
    );
  }
});
