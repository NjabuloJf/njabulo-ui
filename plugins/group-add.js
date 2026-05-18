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
    pattern: "add",
    alias: ["a", "invite", "addmember"],
    desc: "Adds a member to the group",
    category: "admin",
    react: "➕",
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
            "Add Member - Error",
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
            "Add Member - Access Denied",
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
            "Add Member - Error",
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
    } else if (q && /^\d+$/.test(q)) {
        number = q;
        userIdentifier = `number ${number}`;
    } else {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Please provide a user to add*\n\n📌 *Usage:*\n• Reply to a user's message with .add\n• Mention a user: .add @username\n• Type number: .add 1234567890", 
            sender, 
            pushname,
            "Add Member - Error",
            "No user specified"
        );
        return;
    }

    const jid = number + "@s.whatsapp.net";

    await sendFormattedMessage(
        conn, 
        from, 
        `➕ *Adding member...*\n\n👤 *User:* @${number}\n⏳ Please wait!`, 
        sender, 
        pushname,
        "Add Member",
        `Adding: ${number}`
    );

    try {
        await conn.groupParticipantsUpdate(from, [jid], "add");
        
        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *Member added successfully!*\n\n👤 *User:* @${number}\n\nWelcome to the group! 🎉`, 
            sender, 
            pushname,
            "Add Member - Success",
            `Added: ${number}`
        );
    } catch (error) {
        console.error("Add command error:", error);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Failed to add member*\n\n👤 *User:* @${number}\n⚠️ ${error.message}\n\nMake sure the number is valid and has WhatsApp.`, 
            sender, 
            pushname,
            "Add Member - Error",
            "Add failed"
        );
    }
});
