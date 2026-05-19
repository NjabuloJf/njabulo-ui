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
                    body: externalBody || "Broadcast System",
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
  pattern: "broadcast",
  alias: ["bc", "broadcastall"],
  category: "group",
  desc: "Bot makes a broadcast in all groups",
  filename: __filename,
  use: "<text for broadcast.>"
}, async (conn, mek, m, { q, isGroup, isAdmins, reply, from, sender, pushname }) => {
  try {
    if (!isGroup) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *This command can only be used in groups!*", 
        sender, 
        pushname,
        "Broadcast - Error",
        "Not a group"
      );
      return;
    }
    
    if (!isAdmins) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *You need to be an admin to broadcast in this group!*", 
        sender, 
        pushname,
        "Broadcast - Access Denied",
        "Admin only"
      );
      return;
    }

    if (!q) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *Provide text to broadcast in all groups!*\n\n📌 *Usage:* .broadcast Hello everyone", 
        sender, 
        pushname,
        "Broadcast - Error",
        "No message"
      );
      return;
    }

    let allGroups = await conn.groupFetchAllParticipating();
    let groupIds = Object.keys(allGroups);
    
    const estimatedTime = (groupIds.length * 1.5).toFixed(1);

    await sendFormattedMessage(
      conn, 
      from, 
      `📢 *Starting Broadcast*\n\n📊 *Total Groups:* ${groupIds.length}\n⏳ *Estimated Time:* ${estimatedTime} seconds\n\n📝 *Message:* ${q.substring(0, 100)}${q.length > 100 ? '...' : ''}`, 
      sender, 
      pushname,
      "Broadcast",
      "Sending..."
    );

    let successCount = 0;
    let failCount = 0;

    for (let groupId of groupIds) {
      try {
        await sleep(1500);
        await conn.sendMessage(groupId, { text: `📢 *BROADCAST*\n\n${q}` });
        successCount++;
      } catch (err) {
        failCount++;
        console.log(`❌ Failed to send broadcast to ${groupId}:`, err);
      }
    }

    await sendFormattedMessage(
      conn, 
      from, 
      `✅ *Broadcast Completed!*\n\n📊 *Sent to:* ${successCount} groups\n❌ *Failed:* ${failCount} groups\n📝 *Message:* ${q.substring(0, 100)}${q.length > 100 ? '...' : ''}`, 
      sender, 
      pushname,
      "Broadcast - Complete",
      `${successCount}/${groupIds.length} sent`
    );
    
  } catch (err) {
    console.error("Broadcast Error:", err);
    await sendFormattedMessage(
      conn, 
      from, 
      `❌ *Error:* ${err.message}`, 
      sender, 
      pushname,
      "Broadcast - Error",
      "Command failed"
    );
  }
});
