const { cmd, commands } = require('../command');
const axios = require('axios');
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
                    body: externalBody || "Couple PP System",
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
  'pattern': "couplepp",
  'alias': ["couple", "cpp"],
  'react': '💑',
  'desc': "Get a male and female couple profile picture.",
  'category': "image",
  'use': ".couplepp",
  'filename': __filename
}, async (conn, mek, m, {
  from,
  args,
  reply,
  sender,
  pushname
}) => {
  try {
    // Send loading message with formatting
    await sendFormattedMessage(
        conn, 
        from, 
        "💑 *Fetching couple profile pictures...*\n\n⏳ Please wait while we find the perfect couple photos for you.", 
        sender, 
        pushname,
        "Couple PP - Loading",
        "Fetching images..."
    );
    
    const response = await axios.get("https://api.davidcyriltech.my.id/couplepp", { timeout: 15000 });

    if (!response.data || !response.data.success) {
      await sendFormattedMessage(
          conn, 
          from, 
          "❌ *Failed to fetch couple profile pictures*\n\n🔄 Please try again later.", 
          sender, 
          pushname,
          "Couple PP - Error",
          "API request failed"
      );
      return;
    }

    const malePp = response.data.male;
    const femalePp = response.data.female;

    // Success message
    const successMessage = `💑 *COUPLE PROFILE PICTURES* 💑

✨ *Images Fetched Successfully!*

👨 Male PP: ✅ Available
👩 Female PP: ✅ Available

📸 *Sending your couple profile pictures now...*`;

    await sendFormattedMessage(
        conn, 
        from, 
        successMessage, 
        sender, 
        pushname,
        "Couple PP System",
        "Images fetched successfully"
    );

    if (malePp) {
      await conn.sendMessage(from, {
        'image': { 'url': malePp },
        'caption': "👨 *Male Couple Profile Picture*\n\n💝 Use this as your profile picture!"
      }, { 'quoted': mek });
    }

    if (femalePp) {
      await conn.sendMessage(from, {
        'image': { 'url': femalePp },
        'caption': "👩 *Female Couple Profile Picture*\n\n💝 Use this as your profile picture!"
      }, { 'quoted': mek });
    }

    // Completion message
    const completeMessage = `✅ *Images Sent Successfully!*

📸 *Downloaded:*
👨 Male PP: ✅ Sent
👩 Female PP: ✅ Sent

💑 *Enjoy your new couple profile pictures!*

━━━━━━━━━━━━━━━━
💝 *Love is in the air!* 💝`;

    await sendFormattedMessage(
        conn, 
        from, 
        completeMessage, 
        sender, 
        pushname,
        "Couple PP - Complete",
        "Images delivered"
    );

  } catch (error) {
    console.error("Couple PP Error:", error);
    await sendFormattedMessage(
        conn, 
        from, 
        `❌ *Error fetching couple profile pictures*\n\n⚠️ ${error.message || "Please try again later."}\n\n🔄 Try again in a few moments.`, 
        sender, 
        pushname,
        "Couple PP - Error",
        "Request failed"
    );
  }
});
