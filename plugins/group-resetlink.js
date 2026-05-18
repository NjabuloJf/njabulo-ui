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
    pattern: "revoke",
    react: "🖇️",
    alias: ["revokegrouplink", "resetglink", "revokelink", "f_revoke", "resetlink"],
    desc: "To Reset the group link",
    category: "group",
    use: '.revoke',
    filename: __filename
},
async(conn, mek, m, {from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try {
    if (!isGroup) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *This command can only be used in groups.*", 
            sender, 
            pushname,
            "Revoke Link - Error",
            "Not a group"
        );
        return;
    }
    
    if (!isAdmins && !isDev) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Only group admins can use this command.*", 
            sender, 
            pushname,
            "Revoke Link - Access Denied",
            "Admin only command"
        );
        return;
    }
    
    if (!isBotAdmins) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *I need to be an admin to reset the group link.*\n\nPlease make me an admin first.", 
            sender, 
            pushname,
            "Revoke Link - Error",
            "Bot not admin"
        );
        return;
    }

    // Get group name for better message
    let groupName = "this group";
    try {
        const metadata = await conn.groupMetadata(from);
        groupName = metadata.subject || groupName;
    } catch (e) {
        // Ignore error
    }

    await sendFormattedMessage(
        conn, 
        from, 
        `🖇️ *Resetting group link...*\n\n📛 *Group:* ${groupName}\n⏳ Please wait!`, 
        sender, 
        pushname,
        "Revoke Link",
        "Resetting link"
    );

    await conn.groupRevokeInvite(from);
    
    // Get new invite link
    let newLink = "";
    try {
        const inviteCode = await conn.groupInviteCode(from);
        newLink = `https://chat.whatsapp.com/${inviteCode}`;
    } catch (e) {
        newLink = "Could not generate new link";
    }
    
    await sendFormattedMessage(
        conn, 
        from, 
        `🖇️ *Group link reset successfully!*\n\n📛 *Group:* ${groupName}\n🔗 *New Link:* ${newLink}\n\n✅ Old link has been revoked.`, 
        sender, 
        pushname,
        "Revoke Link - Success",
        "Link reset"
    );
    
} catch (e) {
    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    console.log(e);
    await sendFormattedMessage(
        conn, 
        from, 
        `❌ *Error Occurred!*\n\n${e.message || e}\n\nPlease try again later.`, 
        sender, 
        pushname,
        "Revoke Link - Error",
        "Revoke failed"
    );
}
});
