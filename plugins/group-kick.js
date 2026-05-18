const { cmd } = require('../command');
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
    pattern: "remove",
    alias: ["kick", "k", "rm", "delete"],
    desc: "Removes a member from the group",
    category: "admin",
    react: "❌",
    filename: __filename
},
async (conn, mek, m, {
    from, q, isGroup, isBotAdmins, reply, quoted, senderNumber, sender, pushname
}) => {
    // Check if the command is used in a group
    if (!isGroup) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *This command can only be used in groups.*", 
            sender, 
            pushname,
            "Remove Member - Error",
            "Not a group"
        );
        return;
    }

    // Get the bot owner's number dynamically from conn.user.id
    const botOwner = conn.user.id.split(":")[0];
    if (senderNumber !== botOwner) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Only the bot owner can use this command.*", 
            sender, 
            pushname,
            "Remove Member - Access Denied",
            "Owner only command"
        );
        return;
    }

    // Check if the bot is an admin
    if (!isBotAdmins) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *I need to be an admin to use this command.*\n\nPlease make me an admin first.", 
            sender, 
            pushname,
            "Remove Member - Error",
            "Bot not admin"
        );
        return;
    }

    let number;
    let userIdentifier = "";

    if (mek.quoted) {
        number = mek.quoted.sender.split("@")[0];
        userIdentifier = `replied to user @${number}`;
    } else if (q && q.includes("@")) {
        number = q.replace(/[@\s]/g, '');
        userIdentifier = `mentioned user @${number}`;
    } else {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Please provide a user to remove*\n\n📌 *Usage:*\n• Reply to a user's message with .remove\n• Mention a user: .remove @username", 
            sender, 
            pushname,
            "Remove Member - Error",
            "No user specified"
        );
        return;
    }

    // Prevent removing the bot itself
    if (number === botOwner) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Cannot remove the bot itself.*\n\nThe bot cannot remove itself from the group.", 
            sender, 
            pushname,
            "Remove Member - Error",
            "Cannot remove bot"
        );
        return;
    }

    const jid = number + "@s.whatsapp.net";

    await sendFormattedMessage(
        conn, 
        from, 
        `❌ *Removing member...*\n\n👤 *User:* @${number}\n⏳ Please wait!`, 
        sender, 
        pushname,
        "Remove Member",
        `Removing: ${number}`
    );

    try {
        await conn.groupParticipantsUpdate(from, [jid], "remove");
        
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Member removed successfully!*\n\n👤 *User:* @${number}\n\nUser has been removed from the group.`, 
            sender, 
            pushname,
            "Remove Member - Success",
            `Removed: ${number}`
        );
    } catch (error) {
        console.error("Remove command error:", error);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Failed to remove member*\n\n👤 *User:* @${number}\n⚠️ ${error.message}\n\nMake sure the user is in the group and try again.`, 
            sender, 
            pushname,
            "Remove Member - Error",
            "Removal failed"
        );
    }
});
