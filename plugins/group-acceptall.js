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

// Command to list all pending group join requests
cmd({
    pattern: "requestlist",
    alias: ["joinrequests", "pending", "reqlist"],
    desc: "Shows pending group join requests",
    category: "group",
    react: "📋",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        if (!isGroup) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
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
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
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
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *I need to be an admin to view join requests.*", 
                sender, 
                pushname,
                "Group Manager - Error",
                "Bot not admin"
            );
            return;
        }

        const requests = await conn.groupRequestParticipantsList(from);
        
        if (requests.length === 0) {
            await conn.sendMessage(from, { react: { text: 'ℹ️', key: m.key } });
            await sendFormattedMessage(
                conn, 
                from, 
                "📋 *No pending join requests*\n\nℹ️ There are no pending join requests at this time.", 
                sender, 
                pushname,
                "Group Manager",
                "No requests"
            );
            return;
        }

        let text = `📋 *PENDING JOIN REQUESTS* 📋\n\n📊 *Total:* ${requests.length} request${requests.length > 1 ? 's' : ''}\n\n`;

        for (let i = 0; i < requests.length; i++) {
            const user = requests[i];
            text += `👤 ${i+1}. @${user.jid.split('@')[0]}\n`;
        }

        text += `\n✅ *Use .acceptall to accept all requests*\n❌ *Use .rejectall to reject all requests*`;

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
        
        await sendFormattedMessage(
            conn, 
            from, 
            text, 
            sender, 
            pushname,
            "Join Requests List",
            `${requests.length} pending`
        );
        
    } catch (error) {
        console.error("Request list error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Failed to fetch join requests*\n\nPlease try again later.", 
            sender, 
            pushname,
            "Group Manager - Error",
            "Request failed"
        );
    }
});

// Command to accept all pending join requests
cmd({
    pattern: "acceptall",
    alias: ["approveall", "acceptrequests"],
    desc: "Accepts all pending group join requests",
    category: "group",
    react: "✅",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        if (!isGroup) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
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
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
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
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *I need to be an admin to accept join requests.*", 
                sender, 
                pushname,
                "Group Manager - Error",
                "Bot not admin"
            );
            return;
        }

        const requests = await conn.groupRequestParticipantsList(from);
        
        if (requests.length === 0) {
            await conn.sendMessage(from, { react: { text: 'ℹ️', key: m.key } });
            await sendFormattedMessage(
                conn, 
                from, 
                "ℹ️ *No pending join requests to accept.*", 
                sender, 
                pushname,
                "Group Manager",
                "No requests"
            );
            return;
        }

        const jids = requests.map(u => u.jid);
        await conn.groupRequestParticipantsUpdate(from, jids, "approve");
        
        await conn.sendMessage(from, { react: { text: '👍', key: m.key } });
        
        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *Join requests accepted successfully!*\n\n📊 *Accepted:* ${requests.length} request${requests.length > 1 ? 's' : ''}\n\n👥 Welcome to the group!`, 
            sender, 
            pushname,
            "Group Manager",
            `${requests.length} accepted`
        );
        
    } catch (error) {
        console.error("Accept all error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Failed to accept join requests*\n\nPlease try again later.", 
            sender, 
            pushname,
            "Group Manager - Error",
            "Request failed"
        );
    }
});

// Command to reject all pending join requests
cmd({
    pattern: "rejectall",
    alias: ["denyall", "rejectrequests"],
    desc: "Rejects all pending group join requests",
    category: "group",
    react: "❌",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        if (!isGroup) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
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
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
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
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *I need to be an admin to reject join requests.*", 
                sender, 
                pushname,
                "Group Manager - Error",
                "Bot not admin"
            );
            return;
        }

        const requests = await conn.groupRequestParticipantsList(from);
        
        if (requests.length === 0) {
            await conn.sendMessage(from, { react: { text: 'ℹ️', key: m.key } });
            await sendFormattedMessage(
                conn, 
                from, 
                "ℹ️ *No pending join requests to reject.*", 
                sender, 
                pushname,
                "Group Manager",
                "No requests"
            );
            return;
        }

        const jids = requests.map(u => u.jid);
        await conn.groupRequestParticipantsUpdate(from, jids, "reject");
        
        await conn.sendMessage(from, { react: { text: '👎', key: m.key } });
        
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Join requests rejected successfully!*\n\n📊 *Rejected:* ${requests.length} request${requests.length > 1 ? 's' : ''}\n\nRequests have been denied.`, 
            sender, 
            pushname,
            "Group Manager",
            `${requests.length} rejected`
        );
        
    } catch (error) {
        console.error("Reject all error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Failed to reject join requests*\n\nPlease try again later.", 
            sender, 
            pushname,
            "Group Manager - Error",
            "Request failed"
        );
    }
});
