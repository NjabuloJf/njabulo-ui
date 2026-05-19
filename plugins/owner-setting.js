const { cmd ,commands } = require('../command');
const { exec } = require('child_process');
const config = require('../config');
const {sleep} = require('../lib/functions')

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
                    body: externalBody || "Owner Commands",
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

// 1. Shutdown Bot
cmd({
    pattern: "shutdown",
    alias: ["stop", "exit"],
    desc: "Shutdown the bot.",
    category: "owner",
    react: "🛑",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply, sender, pushname }) => {
    if (!isOwner) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *You are not the owner!*", 
            sender, 
            pushname,
            "Shutdown - Access Denied",
            "Owner only"
        );
        return;
    }
    await sendFormattedMessage(
        conn, 
        from, 
        "🛑 *Shutting down...*\n\nBot is now offline.", 
        sender, 
        pushname,
        "Shutdown",
        "Bot stopping"
    );
    await sleep(1000);
    process.exit();
});

// 2. Broadcast Message to All Groups
cmd({
    pattern: "broadcast",
    alias: ["bc", "broadcastall"],
    desc: "Broadcast a message to all groups.",
    category: "owner",
    react: "📢",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, args, reply, sender, pushname }) => {
    if (!isOwner) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *You are not the owner!*", 
            sender, 
            pushname,
            "Broadcast - Access Denied",
            "Owner only"
        );
        return;
    }
    if (args.length === 0) {
        await sendFormattedMessage(
            conn, 
            from, 
            "📢 *Please provide a message to broadcast*\n\n📌 *Usage:* .broadcast Hello everyone", 
            sender, 
            pushname,
            "Broadcast - Error",
            "No message"
        );
        return;
    }
    const message = args.join(' ');
    
    await sendFormattedMessage(
        conn, 
        from, 
        "📢 *Starting broadcast...*\n\n⏳ Please wait!", 
        sender, 
        pushname,
        "Broadcast",
        "Sending messages"
    );
    
    const groups = Object.keys(await conn.groupFetchAllParticipating());
    let successCount = 0;
    let failCount = 0;
    
    for (const groupId of groups) {
        try {
            await conn.sendMessage(groupId, { text: `📢 *BROADCAST*\n\n${message}` }, { quoted: mek });
            successCount++;
            await sleep(1000);
        } catch (e) {
            failCount++;
        }
    }
    
    await sendFormattedMessage(
        conn, 
        from, 
        `📢 *Broadcast completed!*\n\n✅ *Sent:* ${successCount} groups\n❌ *Failed:* ${failCount} groups`, 
        sender, 
        pushname,
        "Broadcast - Complete",
        `${successCount} groups sent`
    );
});

// 3. Set Profile Picture
cmd({
    pattern: "setpp",
    alias: ["setprofilepic"],
    desc: "Set bot profile picture.",
    category: "owner",
    react: "🖼️",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, quoted, reply, sender, pushname }) => {
    if (!isOwner) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *You are not the owner!*", 
            sender, 
            pushname,
            "Set PP - Access Denied",
            "Owner only"
        );
        return;
    }
    if (!quoted || !quoted.message.imageMessage) {
        await sendFormattedMessage(
            conn, 
            from, 
            "🖼️ *Please reply to an image*\n\n📌 *Usage:* Reply to an image with .setpp", 
            sender, 
            pushname,
            "Set PP - Error",
            "No image"
        );
        return;
    }
    try {
        await sendFormattedMessage(
            conn, 
            from, 
            "🖼️ *Updating profile picture...*\n\n⏳ Please wait!", 
            sender, 
            pushname,
            "Set PP",
            "Updating"
        );
        
        const media = await conn.downloadMediaMessage(quoted);
        await conn.updateProfilePicture(conn.user.jid, { url: media });
        
        await sendFormattedMessage(
            conn, 
            from, 
            "🖼️ *Profile picture updated successfully!*", 
            sender, 
            pushname,
            "Set PP - Success",
            "PP updated"
        );
    } catch (error) {
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error updating profile picture:* ${error.message}`, 
            sender, 
            pushname,
            "Set PP - Error",
            "Update failed"
        );
    }
});

// 6. Clear All Chats
cmd({
    pattern: "clearchats",
    alias: ["clearall", "deletechats"],
    desc: "Clear all chats from the bot.",
    category: "owner",
    react: "🧹",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply, sender, pushname }) => {
    if (!isOwner) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *You are not the owner!*", 
            sender, 
            pushname,
            "Clear Chats - Access Denied",
            "Owner only"
        );
        return;
    }
    try {
        await sendFormattedMessage(
            conn, 
            from, 
            "🧹 *Clearing all chats...*\n\n⏳ Please wait!", 
            sender, 
            pushname,
            "Clear Chats",
            "Clearing"
        );
        
        // Note: This method may not work in all versions
        await sendFormattedMessage(
            conn, 
            from, 
            "🧹 *Chat clearing feature requires manual deletion*\n\nPlease use your WhatsApp app to clear chats.", 
            sender, 
            pushname,
            "Clear Chats - Info",
            "Manual action needed"
        );
    } catch (error) {
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error clearing chats:* ${error.message}`, 
            sender, 
            pushname,
            "Clear Chats - Error",
            "Clear failed"
        );
    }
});

// Bot JID
cmd({
    pattern: "jid",
    alias: ["botjid"],
    desc: "Get the bot's JID.",
    category: "owner",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply, sender, pushname }) => {
    if (!isOwner) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *You are not the owner!*", 
            sender, 
            pushname,
            "Bot JID - Access Denied",
            "Owner only"
        );
        return;
    }
    await sendFormattedMessage(
        conn, 
        from, 
        `🤖 *BOT JID*\n\n🆔 ${conn.user.jid}`, 
        sender, 
        pushname,
        "Bot JID",
        "JID fetched"
    );
});

// 8. Group JIDs List
cmd({
    pattern: "gjid",
    alias: ["groupjids", "listgroups"],
    desc: "Get the list of JIDs for all groups the bot is part of.",
    category: "owner",
    react: "📝",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply, sender, pushname }) => {
    if (!isOwner) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *You are not the owner!*", 
            sender, 
            pushname,
            "Group JIDs - Access Denied",
            "Owner only"
        );
        return;
    }
    
    await sendFormattedMessage(
        conn, 
        from, 
        "📝 *Fetching group JIDs...*\n\n⏳ Please wait!", 
        sender, 
        pushname,
        "Group JIDs",
        "Fetching"
    );
    
    const groups = await conn.groupFetchAllParticipating();
    const groupJids = Object.keys(groups);
    let jidList = groupJids.join('\n');
    
    if (jidList.length > 3500) {
        jidList = jidList.substring(0, 3500) + "\n\n... [Truncated]";
    }
    
    await sendFormattedMessage(
        conn, 
        from, 
        `📝 *GROUP JIDS*\n\n📊 *Total Groups:* ${groupJids.length}\n\n🆔 ${jidList}`, 
        sender, 
        pushname,
        "Group JIDs",
        `${groupJids.length} groups`
    );
});

// delete message
cmd({
    pattern: "delete",
    react: "❌",
    alias: ["del", "rmmsg"],
    desc: "delete message",
    category: "group",
    use: '.del',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, isItzcp, groupAdmins, isBotAdmins, isAdmins, reply}) => {
    if (!isOwner && !isAdmins) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Only owner and group admins can use this command.*", 
            sender, 
            pushname,
            "Delete Message - Access Denied",
            "Admin only"
        );
        return;
    }
    
    if (!mek.quoted) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Please reply to a message to delete*\n\n📌 *Usage:* Reply to a message with .delete", 
            sender, 
            pushname,
            "Delete Message - Error",
            "No message"
        );
        return;
    }
    
    try {
        const key = {
            remoteJid: m.chat,
            fromMe: false,
            id: mek.quoted.id,
            participant: mek.quoted.sender
        }
        await conn.sendMessage(m.chat, { delete: key })
        
        await sendFormattedMessage(
            conn, 
            from, 
            "✅ *Message deleted successfully!*", 
            sender, 
            pushname,
            "Delete Message - Success",
            "Message deleted"
        );
    } catch(e) {
        console.log(e);
        await sendFormattedMessage(
            conn, 
            from, 
            "✅ *Message deletion attempted*", 
            sender, 
            pushname,
            "Delete Message",
            "Delete attempted"
        );
    }
});
