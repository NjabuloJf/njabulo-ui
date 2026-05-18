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
    pattern: "unmute",
    alias: ["groupunmute", "unmuteall", "openchat"],
    react: "🔊",
    desc: "Unmute the group (Everyone can send messages).",
    category: "group",
    filename: __filename
},           
async (conn, mek, m, { from, isGroup, senderNumber, isAdmins, isBotAdmins, reply, sender, pushname }) => {
    try {
        if (!isGroup) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *This command can only be used in groups.*", 
                sender, 
                pushname,
                "Group Unmute - Error",
                "Not a group"
            );
            return;
        }
        
        if (!isAdmins) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Only group admins can use this command.*", 
                sender, 
                pushname,
                "Group Unmute - Access Denied",
                "Admin only command"
            );
            return;
        }
        
        if (!isBotAdmins) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *I need to be an admin to unmute the group.*\n\nPlease make me an admin first.", 
                sender, 
                pushname,
                "Group Unmute - Error",
                "Bot not admin"
            );
            return;
        }

        // Get group name for better message
        let groupName = "this group";
        try {
            const groupMetadata = await conn.groupMetadata(from);
            groupName = groupMetadata.subject || groupName;
        } catch (e) {
            // Ignore error, use default name
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `🔊 *Unmuting group...*\n\n📛 *Group:* ${groupName}\n⏳ Please wait!`, 
            sender, 
            pushname,
            "Group Unmute",
            "Unmuting group"
        );

        await conn.groupSettingUpdate(from, "not_announcement");
        
        await sendFormattedMessage(
            conn, 
            from, 
            `🔊 *Group unmuted successfully!*\n\n📛 *Group:* ${groupName}\n\n✅ Everyone can now send messages.\n\n_Use .mute to mute the group again._`, 
            sender, 
            pushname,
            "Group Unmute - Success",
            "Group unmuted"
        );
        
    } catch (e) {
        console.error("Error unmuting group:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Failed to unmute the group*\n\n⚠️ ${e.message}\n\nPlease try again later.`, 
            sender, 
            pushname,
            "Group Unmute - Error",
            "Unmute failed"
        );
    }
});
