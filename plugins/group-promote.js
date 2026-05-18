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
    pattern: "promote",
    alias: ["p", "makeadmin", "promoteadmin"],
    desc: "Promotes a member to group admin",
    category: "admin",
    react: "⬆️",
    filename: __filename
},
async(conn, mek, m, {
    from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator, isDev, isAdmins, reply
}) => {
    // Check if the command is used in a group
    if (!isGroup) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *This command can only be used in groups.*", 
            sender, 
            pushname,
            "Promote - Error",
            "Not a group"
        );
        return;
    }

    // Check if the user is an admin
    if (!isAdmins) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Only group admins can use this command.*", 
            sender, 
            pushname,
            "Promote - Access Denied",
            "Admin only command"
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
            "Promote - Error",
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
            "❌ *Please provide a user to promote*\n\n📌 *Usage:*\n• Reply to a user's message with .promote\n• Mention a user: .promote @username", 
            sender, 
            pushname,
            "Promote - Error",
            "No user specified"
        );
        return;
    }

    // Prevent promoting the bot itself
    if (number === botNumber) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Cannot promote the bot itself.*\n\nThe bot cannot make itself admin.", 
            sender, 
            pushname,
            "Promote - Error",
            "Cannot promote bot"
        );
        return;
    }

    const jid = number + "@s.whatsapp.net";

    // Check if user is already an admin
    const isAlreadyAdmin = groupAdmins?.some(admin => admin.id === jid);
    if (isAlreadyAdmin) {
        await sendFormattedMessage(
            conn, 
            from, 
            `ℹ️ *User is already an admin*\n\n@${number} is already an admin in this group.`, 
            sender, 
            pushname,
            "Promote - Info",
            "Already admin"
        );
        return;
    }

    await sendFormattedMessage(
        conn, 
        from, 
        `⬆️ *Promoting member...*\n\n👤 *User:* @${number}\n⏳ Please wait!`, 
        sender, 
        pushname,
        "Promote",
        `Promoting: ${number}`
    );

    try {
        await conn.groupParticipantsUpdate(from, [jid], "promote");
        
        await sendFormattedMessage(
            conn, 
            from, 
            `⬆️ *Member promoted successfully!*\n\n👤 *User:* @${number}\n\nUser is now a group admin.`, 
            sender, 
            pushname,
            "Promote - Success",
            `Promoted: ${number}`
        );
    } catch (error) {
        console.error("Promote command error:", error);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Failed to promote member*\n\n👤 *User:* @${number}\n⚠️ ${error.message}\n\nPlease try again later.`, 
            sender, 
            pushname,
            "Promote - Error",
            "Promotion failed"
        );
    }
});
