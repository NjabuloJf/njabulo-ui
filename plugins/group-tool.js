const { cmd } = require('../command');
const config = require("../config");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

// remove only member (non-admins)
cmd({
    pattern: "removemembers",
    alias: ["kickall", "endgc", "endgroup", "kicknonadmins"],
    desc: "Remove all non-admin members from the group.",
    react: "🎉",
    category: "group",
    filename: __filename,
}, 
async (conn, mek, m, {
    from, groupMetadata, groupAdmins, isBotAdmins, senderNumber, reply, isGroup, sender, pushname
}) => {
    try {
        if (!isGroup) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *This command can only be used in groups.*", 
                sender, 
                pushname,
                "Remove Members - Error",
                "Not a group"
            );
            return;
        }

        const botOwner = conn.user.id.split(":")[0];
        if (senderNumber !== botOwner) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Only the bot owner can use this command.*", 
                sender, 
                pushname,
                "Remove Members - Access Denied",
                "Owner only command"
            );
            return;
        }

        if (!isBotAdmins) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *I need to be an admin to execute this command.*\n\nPlease make me an admin first.", 
                sender, 
                pushname,
                "Remove Members - Error",
                "Bot not admin"
            );
            return;
        }

        const allParticipants = groupMetadata.participants;
        const nonAdminParticipants = allParticipants.filter(member => !groupAdmins.includes(member.id));

        if (nonAdminParticipants.length === 0) {
            await sendFormattedMessage(
                conn, 
                from, 
                "ℹ️ *No non-admin members to remove*\n\nAll members in this group are admins.", 
                sender, 
                pushname,
                "Remove Members - Info",
                "No targets"
            );
            return;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `🎉 *Removing non-admin members...*\n\n👥 *Members to remove:* ${nonAdminParticipants.length}\n⏳ Please wait!`, 
            sender, 
            pushname,
            "Remove Members",
            `Removing ${nonAdminParticipants.length} members`
        );

        let removedCount = 0;
        let failedCount = 0;

        for (let participant of nonAdminParticipants) {
            try {
                await conn.groupParticipantsUpdate(from, [participant.id], "remove");
                removedCount++;
                await sleep(2000);
            } catch (e) {
                failedCount++;
                console.error(`Failed to remove ${participant.id}:`, e);
            }
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *Non-admin members removed successfully!*\n\n📊 *Removed:* ${removedCount}\n❌ *Failed:* ${failedCount}\n\n🎉 Group cleanup complete!`, 
            sender, 
            pushname,
            "Remove Members - Success",
            `${removedCount} members removed`
        );
        
    } catch (e) {
        console.error("Error removing non-admin users:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *An error occurred*\n\n⚠️ ${e.message}\n\nPlease try again later.`, 
            sender, 
            pushname,
            "Remove Members - Error",
            "Removal failed"
        );
    }
});

// remove only admins
cmd({
    pattern: "removeadmins",
    alias: ["kickadmins", "kickall3", "deladmins"],
    desc: "Remove all admin members from the group, excluding the bot and bot owner.",
    react: "🎉",
    category: "group",
    filename: __filename,
}, 
async (conn, mek, m, {
    from, isGroup, senderNumber, groupMetadata, groupAdmins, isBotAdmins, reply, sender, pushname
}) => {
    try {
        if (!isGroup) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *This command can only be used in groups.*", 
                sender, 
                pushname,
                "Remove Admins - Error",
                "Not a group"
            );
            return;
        }

        const botOwner = conn.user.id.split(":")[0];
        if (senderNumber !== botOwner) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Only the bot owner can use this command.*", 
                sender, 
                pushname,
                "Remove Admins - Access Denied",
                "Owner only command"
            );
            return;
        }

        if (!isBotAdmins) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *I need to be an admin to execute this command.*\n\nPlease make me an admin first.", 
                sender, 
                pushname,
                "Remove Admins - Error",
                "Bot not admin"
            );
            return;
        }

        const allParticipants = groupMetadata.participants;
        const adminParticipants = allParticipants.filter(member => 
            groupAdmins.includes(member.id) && 
            member.id !== conn.user.id && 
            member.id !== `${botOwner}@s.whatsapp.net`
        );

        if (adminParticipants.length === 0) {
            await sendFormattedMessage(
                conn, 
                from, 
                "ℹ️ *No admin members to remove*\n\nExcluding bot and bot owner.", 
                sender, 
                pushname,
                "Remove Admins - Info",
                "No targets"
            );
            return;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `🎉 *Removing admin members...*\n\n👑 *Admins to remove:* ${adminParticipants.length}\n⏳ Please wait!`, 
            sender, 
            pushname,
            "Remove Admins",
            `Removing ${adminParticipants.length} admins`
        );

        let removedCount = 0;
        let failedCount = 0;

        for (let participant of adminParticipants) {
            try {
                await conn.groupParticipantsUpdate(from, [participant.id], "remove");
                removedCount++;
                await sleep(2000);
            } catch (e) {
                failedCount++;
                console.error(`Failed to remove ${participant.id}:`, e);
            }
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *Admin members removed successfully!*\n\n📊 *Removed:* ${removedCount}\n❌ *Failed:* ${failedCount}\n\n🎉 Admin cleanup complete!`, 
            sender, 
            pushname,
            "Remove Admins - Success",
            `${removedCount} admins removed`
        );
        
    } catch (e) {
        console.error("Error removing admins:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *An error occurred*\n\n⚠️ ${e.message}\n\nPlease try again later.`, 
            sender, 
            pushname,
            "Remove Admins - Error",
            "Removal failed"
        );
    }
});

// remove admins and members both
cmd({
    pattern: "removeall2",
    alias: ["kickall2", "endgc2", "endgroup2", "removeall"],
    desc: "Remove all members and admins from the group, excluding the bot and bot owner.",
    react: "🎉",
    category: "group",
    filename: __filename,
}, 
async (conn, mek, m, {
    from, isGroup, senderNumber, groupMetadata, isBotAdmins, reply, sender, pushname
}) => {
    try {
        if (!isGroup) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *This command can only be used in groups.*", 
                sender, 
                pushname,
                "Remove All - Error",
                "Not a group"
            );
            return;
        }

        const botOwner = conn.user.id.split(":")[0];
        if (senderNumber !== botOwner) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Only the bot owner can use this command.*", 
                sender, 
                pushname,
                "Remove All - Access Denied",
                "Owner only command"
            );
            return;
        }

        if (!isBotAdmins) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *I need to be an admin to execute this command.*\n\nPlease make me an admin first.", 
                sender, 
                pushname,
                "Remove All - Error",
                "Bot not admin"
            );
            return;
        }

        const allParticipants = groupMetadata.participants;
        const participantsToRemove = allParticipants.filter(
            participant => participant.id !== conn.user.id && participant.id !== `${botOwner}@s.whatsapp.net`
        );

        if (participantsToRemove.length === 0) {
            await sendFormattedMessage(
                conn, 
                from, 
                "ℹ️ *No members to remove*\n\nExcluding bot and bot owner.", 
                sender, 
                pushname,
                "Remove All - Info",
                "No targets"
            );
            return;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `🎉 *Removing all members...*\n\n👥 *Members to remove:* ${participantsToRemove.length}\n⏳ Please wait!`, 
            sender, 
            pushname,
            "Remove All",
            `Removing ${participantsToRemove.length} members`
        );

        let removedCount = 0;
        let failedCount = 0;

        for (let participant of participantsToRemove) {
            try {
                await conn.groupParticipantsUpdate(from, [participant.id], "remove");
                removedCount++;
                await sleep(2000);
            } catch (e) {
                failedCount++;
                console.error(`Failed to remove ${participant.id}:`, e);
            }
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *All members removed successfully!*\n\n📊 *Removed:* ${removedCount}\n❌ *Failed:* ${failedCount}\n\n🎉 Group cleanup complete!`, 
            sender, 
            pushname,
            "Remove All - Success",
            `${removedCount} members removed`
        );
        
    } catch (e) {
        console.error("Error removing members:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *An error occurred*\n\n⚠️ ${e.message}\n\nPlease try again later.`, 
            sender, 
            pushname,
            "Remove All - Error",
            "Removal failed"
        );
    }
});
