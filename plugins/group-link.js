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
                    body: externalBody || "Group Invite",
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
    pattern: "invite",
    alias: ["glink", "grouplink", "invitelink", "link"],
    desc: "Get group invite link.",
    category: "group",
    filename: __filename,
}, async (conn, mek, m, { from, quoted, body, args, q, isGroup, sender, reply, pushname }) => {
    try {
        // Ensure this is being used in a group
        if (!isGroup) {
            await sendFormattedMessage(
                conn, 
                from, 
                "🔗 *This command can only be used in groups.*", 
                sender, 
                pushname,
                "Group Invite - Error",
                "Not a group"
            );
            return;
        }

        const senderNumber = sender.split('@')[0];
        const botNumber = conn.user.id.split(':')[0];
        
        // Check if the bot is an admin
        const groupMetadata = await conn.groupMetadata(from);
        const groupAdmins = groupMetadata ? groupMetadata.participants.filter(member => member.admin) : [];
        const isBotAdmins = groupAdmins.some(admin => admin.id === botNumber + '@s.whatsapp.net');
        
        if (!isBotAdmins) {
            await sendFormattedMessage(
                conn, 
                from, 
                "🔗 *I need to be an admin to get the invite link.*\n\nPlease make me an admin first.", 
                sender, 
                pushname,
                "Group Invite - Error",
                "Bot not admin"
            );
            return;
        }

        // Check if the sender is an admin
        const isAdmins = groupAdmins.some(admin => admin.id === sender);
        if (!isAdmins) {
            await sendFormattedMessage(
                conn, 
                from, 
                "🔗 *Only group admins can use this command.*", 
                sender, 
                pushname,
                "Group Invite - Access Denied",
                "Admin only command"
            );
            return;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `🔗 *Generating invite link...*\n\n📛 *Group:* ${groupMetadata.subject}\n⏳ Please wait!`, 
            sender, 
            pushname,
            "Group Invite",
            "Generating link"
        );

        // Get the invite code and generate the link
        const inviteCode = await conn.groupInviteCode(from);
        if (!inviteCode) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Failed to retrieve the invite code.*\n\nPlease try again later.", 
                sender, 
                pushname,
                "Group Invite - Error",
                "No invite code"
            );
            return;
        }

        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

        const message = `🔗 *GROUP INVITE LINK* 🔗

📛 *Group Name:* ${groupMetadata.subject}
👥 *Total Members:* ${groupMetadata.participants.length}

🔗 *Invite Link:*
${inviteLink}

💡 *Share this link to invite new members!*

✅ *Link generated successfully!*`;

        await sendFormattedMessage(
            conn, 
            from, 
            message, 
            sender, 
            pushname,
            "Group Invite Link",
            "Link generated"
        );
        
    } catch (error) {
        console.error("Error in invite command:", error);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *An error occurred*\n\n${error.message || "Unknown error"}\n\nPlease try again later.`, 
            sender, 
            pushname,
            "Group Invite - Error",
            "Request failed"
        );
    }
});
