const crypto = require("crypto");
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
                    body: externalBody || "Password Generator",
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
  pattern: "gpass",
  alias: ["genpass", "password", "generatepass"],
  desc: "Generate a strong password.",
  category: "other",
  react: '🔐',
  filename: __filename
}, async (conn, mek, m, {
  from,
  quoted,
  body,
  isCmd,
  command,
  args,
  q,
  isGroup,
  sender,
  senderNumber,
  botNumber2,
  botNumber,
  pushname,
  isMe,
  isOwner,
  groupMetadata,
  groupName,
  participants,
  groupAdmins,
  isBotAdmins,
  isAdmins,
  reply
}) => {
  try {
    // Password length specified by the user, defaults to 12 if not provided
    const passwordLength = args[0] ? parseInt(args[0]) : 12;

    // Validate the password length
    if (isNaN(passwordLength) || passwordLength < 8) {
      await sendFormattedMessage(
        conn, 
        from, 
        "🔐 *Please provide a valid length for the password*\n\n📌 *Minimum:* 8 characters\n🔍 *Example:* .gpass 16\n\n_Default is 12 characters if not specified._", 
        sender, 
        pushname,
        "Password Gen - Error",
        "Invalid length"
      );
      return;
    }

    if (passwordLength > 64) {
      await sendFormattedMessage(
        conn, 
        from, 
        "🔐 *Password length too long*\n\n📌 *Maximum allowed:* 64 characters\n\nPlease try with a shorter length.", 
        sender, 
        pushname,
        "Password Gen - Error",
        "Length too long"
      );
      return;
    }

    await sendFormattedMessage(
      conn, 
      from, 
      `🔐 *Generating your password...*\n\n📏 *Length:* ${passwordLength} characters\n⏳ Please wait!`, 
      sender, 
      pushname,
      "Password Generator",
      "Generating..."
    );

    // Password generation function
    const generatePassword = (length) => {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?';
      let password = '';
      for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, chars.length);
        password += chars[randomIndex];
      }
      return password;
    };

    // Generate the password
    const generatedPassword = generatePassword(passwordLength);
    
    // Calculate password strength
    let strength = "";
    if (passwordLength >= 16) {
      strength = "💪 *VERY STRONG*";
    } else if (passwordLength >= 12) {
      strength = "✅ *STRONG*";
    } else if (passwordLength >= 8) {
      strength = "⚠️ *MODERATE*";
    } else {
      strength = "❌ *WEAK*";
    }

    const message = `🔐 *YOUR STRONG PASSWORD* 🔐

📏 *Length:* ${passwordLength} characters
💪 *Strength:* ${strength}

🔑 *Generated Password:*
\`${generatedPassword}\`

💡 *Tips:*
• Keep this password secure
• Don't share it with anyone
• Use different passwords for different accounts`;

    await sendFormattedMessage(
      conn, 
      from, 
      message, 
      sender, 
      pushname,
      "Password Generator",
      `${passwordLength} char password`
    );
    
  } catch (error) {
    console.error(error);
    await sendFormattedMessage(
      conn, 
      from, 
      `❌ *Error generating password:*\n\n${error.message}\n\nPlease try again later.`, 
      sender, 
      pushname,
      "Password Gen - Error",
      "Generation failed"
    );
  }
});
