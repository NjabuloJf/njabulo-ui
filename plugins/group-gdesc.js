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
    pattern: "updategdesc",
    alias: ["upgdesc", "gdesc", "setdesc", "groupdesc"],
    react: "📜",
    desc: "Change the group description.",
    category: "group",
    filename: __filename
},           
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, args, q, reply, sender, pushname }) => {
    try {
        if (!isGroup) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *This command can only be used in groups.*", 
                sender, 
                pushname,
                "Group Manager - Error",
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
                "Group Manager - Access Denied",
                "Admin only command"
            );
            return;
        }
        
        if (!isBotAdmins) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *I need to be an admin to update the group description.*\n\nPlease make me an admin first.", 
                sender, 
                pushname,
                "Group Manager - Error",
                "Bot not admin"
            );
            return;
        }
        
        if (!q) {
            await sendFormattedMessage(
                conn, 
                from, 
                "📜 *Please provide a new group description*\n\n📌 *Usage:* .gdesc Your new description here\n🔍 *Example:* .gdesc Welcome to our group!", 
                sender, 
                pushname,
                "Group Manager - Error",
                "No description provided"
            );
            return;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `📜 *Updating group description...*\n\n⏳ Please wait!`, 
            sender, 
            pushname,
            "Group Manager",
            "Updating description"
        );

        // Get current group info to show old description
        const groupMetadata = await conn.groupMetadata(from);
        const oldDescription = groupMetadata.desc || "No description set";

        await conn.groupUpdateDescription(from, q);
        
        await sendFormattedMessage(
            conn, 
            from, 
            `📜 *Group description updated successfully!*\n\n📌 *Old Description:*\n${oldDescription}\n\n📌 *New Description:*\n${q}\n\n✅ Description has been changed.`, 
            sender, 
            pushname,
            "Group Manager - Success",
            "Description updated"
        );
        
    } catch (e) {
        console.error("Error updating group description:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Failed to update group description*\n\n⚠️ ${e.message}\n\nPlease try again later.`, 
            sender, 
            pushname,
            "Group Manager - Error",
            "Update failed"
        );
    }
});
