const { cmd, commands } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;
const fs = require('fs');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions2');
const { writeFileSync } = require('fs');
const path = require('path');

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
                    body: externalBody || "Group Creator",
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
  pattern: "newgc",
  alias: ["creategc", "newgroup"],
  category: "group",
  desc: "Create a new group and add participants.",
  filename: __filename,
}, async (conn, mek, m, { from, isGroup, body, sender, groupMetadata, participants, reply, pushname }) => {
  try {
    if (!body) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ Please provide group name and participants\n\n📌 *Usage:* .newgc Group Name;255712345678,255798765432", 
        sender, 
        pushname,
        "Group Creator - Error",
        "Invalid format"
      );
      return;
    }

    const [groupName, numbersString] = body.split(";");
    
    if (!groupName || !numbersString) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ Invalid format!\n\n📌 *Usage:* .newgc Group Name;255712345678,255798765432", 
        sender, 
        pushname,
        "Group Creator - Error",
        "Missing parameters"
      );
      return;
    }

    const participantNumbers = numbersString.split(",").map(number => {
      let cleanNumber = number.trim();
      if (!cleanNumber.includes('@')) {
        cleanNumber = `${cleanNumber}@s.whatsapp.net`;
      }
      return cleanNumber;
    });

    if (participantNumbers.length === 0) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ No valid participants provided", 
        sender, 
        pushname,
        "Group Creator - Error",
        "No participants"
      );
      return;
    }

    await sendFormattedMessage(
      conn, 
      from, 
      `📝 Creating group...\n\n📛 *Name:* ${groupName}\n👥 *Members:* ${participantNumbers.length}\n⏳ Please wait`, 
      sender, 
      pushname,
      "Group Creator",
      "Creating group"
    );

    const group = await conn.groupCreate(groupName, participantNumbers);

    let inviteLink = "";
    try {
      const inviteCode = await conn.groupInviteCode(group.id);
      inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
    } catch (e) {
      inviteLink = "Could not generate invite link";
    }

    await conn.sendMessage(group.id, { text: `Welcome to ${groupName}` });

    const successMessage = `✅ *Group Created Successfully!*

📛 *Name:* ${groupName}
👥 *Members Added:* ${participantNumbers.length}
🔗 *Link:* ${inviteLink}`;

    await sendFormattedMessage(
      conn, 
      from, 
      successMessage, 
      sender, 
      pushname,
      "Group Creator - Success",
      `${groupName} created`
    );
    
  } catch (e) {
    console.error("Error creating group:", e);
    await sendFormattedMessage(
      conn, 
      from, 
      `❌ Error: ${e.message}`, 
      sender, 
      pushname,
      "Group Creator - Error",
      "Creation failed"
    );
  }
});
