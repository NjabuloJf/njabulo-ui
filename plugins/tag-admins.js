const config = require('../config')
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')

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
                    body: externalBody || "Group Manager",
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
    pattern: "tagadmins",
    react: "👑",
    alias: ["gc_tagadmins", "tagad", "mentionadmins"],
    desc: "To Tag all Admins of the Group",
    category: "group",
    use: '.tagadmins [message]',
    filename: __filename
},
async (conn, mek, m, { from, participants, reply, isGroup, senderNumber, groupAdmins, prefix, command, args, body, sender, pushname }) => {
    try {
        if (!isGroup) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *This command can only be used in groups.*", 
                sender, 
                pushname,
                "Tag Admins - Error",
                "Not a group"
            );
            return;
        }
        
        // Fetch group info
        let groupInfo = await conn.groupMetadata(from).catch(() => null);
        if (!groupInfo) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Failed to fetch group information.*", 
                sender, 
                pushname,
                "Tag Admins - Error",
                "Fetch failed"
            );
            return;
        }

        let groupName = groupInfo.subject || "Unknown Group";
        let admins = await getGroupAdmins(participants);
        let totalAdmins = admins ? admins.length : 0;
        
        if (totalAdmins === 0) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *No admins found in this group.*", 
                sender, 
                pushname,
                "Tag Admins - Error",
                "No admins"
            );
            return;
        }

        let emojis = ['👑', '⚡', '🌟', '✨', '🎖️', '💎', '🔱', '🛡️', '🚀', '🏆'];
        let randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        // Extract message
        let message = body.slice(body.indexOf(command) + command.length).trim();
        if (!message) message = "Attention Admins";

        let teks = `👑 *TAG ADMINS* 👑

📛 *Group:* ${groupName}
👥 *Admins:* ${totalAdmins}
📝 *Message:* ${message}

━━━━━━━━━━━━━━━━
*ADMIN MENTIONS*

`;
        for (let admin of admins) {
            if (admin) {
                teks += `${randomEmoji} @${admin.split('@')[0]}\n`;
            }
        }

        teks += `\n━━━━━━━━━━━━━━━━
✅ *Admins have been notified*`;

        await conn.sendMessage(from, { 
            text: teks, 
            mentions: admins 
        }, { quoted: mek });

    } catch (e) {
        console.error("TagAdmins Error:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error Occurred!*\n\n${e.message || e}`, 
            sender, 
            pushname,
            "Tag Admins - Error",
            "Command failed"
        );
    }
});
