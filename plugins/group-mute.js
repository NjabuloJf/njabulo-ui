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
    pattern: "mute",
    alias: ["groupmute", "muteall", "lockchat"],
    react: "🔇",
    desc: "Mute the group (Only admins can send messages).",
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
                "Group Mute - Error",
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
                "Group Mute - Access Denied",
                "Admin only command"
            );
            return;
        }
        
        if (!isBotAdmins) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *I need to be an admin to mute the group.*\n\nPlease make me an admin first.", 
                sender, 
                pushname,
                "Group Mute - Error",
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
            `🔇 *Muting group...*\n\n📛 *Group:* ${groupName}\n⏳ Please wait!`, 
            sender, 
            pushname,
            "Group Mute",
            "Muting group"
        );

        await conn.groupSettingUpdate(from, "announcement");
        
        await sendFormattedMessage(
            conn, 
            from, 
            `🔇 *Group muted successfully!*\n\n📛 *Group:* ${groupName}\n\n✅ Only admins can send messages now.\n\n_Use .unmute to allow all members to send messages._`, 
            sender, 
            pushname,
            "Group Mute - Success",
            "Group muted"
        );
        
    } catch (e) {
        console.error("Error muting group:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Failed to mute the group*\n\n⚠️ ${e.message}\n\nPlease try again later.`, 
            sender, 
            pushname,
            "Group Mute - Error",
            "Mute failed"
        );
    }
});
