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
    pattern: "out",
    alias: ["ck", "🦶", "removecc", "kickcc"],
    desc: "Removes all members with specific country code from the group",
    category: "admin",
    react: "❌",
    filename: __filename
},
async (conn, mek, m, {
    from, q, isGroup, isBotAdmins, reply, groupMetadata, senderNumber, sender, pushname
}) => {
    // Check if the command is used in a group
    if (!isGroup) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *This command can only be used in groups.*", 
            sender, 
            pushname,
            "Remove by Country - Error",
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
            "Remove by Country - Access Denied",
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
            "Remove by Country - Error",
            "Bot not admin"
        );
        return;
    }

    if (!q) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Please provide a country code*\n\n📌 *Usage:* .out 92\n🔍 *Example:* .out 255\n\n*This will remove all members with +92 numbers*", 
            sender, 
            pushname,
            "Remove by Country - Error",
            "No country code"
        );
        return;
    }

    const countryCode = q.trim();
    if (!/^\d+$/.test(countryCode)) {
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Invalid country code*\n\n"${countryCode}" is not valid.\n\nPlease provide only numbers.\n📌 *Example:* .out 92`, 
            sender, 
            pushname,
            "Remove by Country - Error",
            "Invalid code"
        );
        return;
    }

    await sendFormattedMessage(
        conn, 
        from, 
        `🦶 *Scanning group members...*\n\n🔍 *Country Code:* +${countryCode}\n⏳ Please wait!`, 
        sender, 
        pushname,
        "Remove by Country",
        "Scanning members"
    );

    try {
        const participants = await groupMetadata.participants;
        const targets = participants.filter(
            participant => participant.id.startsWith(countryCode) && 
                         !participant.admin
        );

        if (targets.length === 0) {
            await sendFormattedMessage(
                conn, 
                from, 
                `❌ *No members found with country code +${countryCode}*\n\nNo matching members to remove.`, 
                sender, 
                pushname,
                "Remove by Country - Error",
                "No matches"
            );
            return;
        }

        // Show list of members to be removed
        let memberList = targets.slice(0, 10).map((p, i) => `${i+1}. @${p.id.split('@')[0]}`).join('\n');
        if (targets.length > 10) {
            memberList += `\n... and ${targets.length - 10} more`;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `🦶 *Members found to remove*\n\n📊 *Total:* ${targets.length} member(s) with code +${countryCode}\n\n👥 *Members:*\n${memberList}\n\n⏳ Removing...`, 
            sender, 
            pushname,
            "Remove by Country",
            `Removing ${targets.length} members`
        );

        const jids = targets.map(p => p.id);
        await conn.groupParticipantsUpdate(from, jids, "remove");
        
        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *Members removed successfully!*\n\n📊 *Removed:* ${targets.length} member(s) with country code +${countryCode}\n\n🦎 *Group cleaned!*`, 
            sender, 
            pushname,
            "Remove by Country - Success",
            `${targets.length} members removed`
        );
        
    } catch (error) {
        console.error("Out command error:", error);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Failed to remove members*\n\n⚠️ ${error.message}\n\nPlease try again later.`, 
            sender, 
            pushname,
            "Remove by Country - Error",
            "Removal failed"
        );
    }
});
