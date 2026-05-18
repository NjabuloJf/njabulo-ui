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
    pattern: "demote",
    alias: ["d", "dismiss", "removeadmin", "unadmin"],
    desc: "Demotes a group admin to a normal member",
    category: "admin",
    react: "⬇️",
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
            "Demote - Error",
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
            "Demote - Access Denied",
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
            "Demote - Error",
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
            "❌ *Please provide a user to demote*\n\n📌 *Usage:*\n• Reply to a user's message with .demote\n• Mention a user: .demote @username", 
            sender, 
            pushname,
            "Demote - Error",
            "No user specified"
        );
        return;
    }

    // Prevent demoting the bot itself
    if (number === botNumber) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *The bot cannot demote itself.*\n\nI need to remain admin to manage the group.", 
            sender, 
            pushname,
            "Demote - Error",
            "Cannot demote bot"
        );
        return;
    }

    const jid = number + "@s.whatsapp.net";

    await sendFormattedMessage(
        conn, 
        from, 
        `⬇️ *Demoting member...*\n\n👤 *User:* @${number}\n⏳ Please wait!`, 
        sender, 
        pushname,
        "Demote",
        `Demoting: ${number}`
    );

    try {
        await conn.groupParticipantsUpdate(from, [jid], "demote");
        
        await sendFormattedMessage(
            conn, 
            from, 
            `⬇️ *Admin demoted successfully!*\n\n👤 *User:* @${number}\n\nUser has been demoted to a normal member.`, 
            sender, 
            pushname,
            "Demote - Success",
            `Demoted: ${number}`
        );
    } catch (error) {
        console.error("Demote command error:", error);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Failed to demote member*\n\n👤 *User:* @${number}\n⚠️ ${error.message}\n\nMake sure the user is an admin and try again.`, 
            sender, 
            pushname,
            "Demote - Error",
            "Demotion failed"
        );
    }
});
