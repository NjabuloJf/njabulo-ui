const fs = require("fs");
const config = require("../config");
const { cmd, commands } = require("../command");
const path = require('path');
const axios = require("axios");
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

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
                    body: externalBody || "Privacy Settings",
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
    pattern: "privacy",
    alias: ["privacymenu", "privacysettings"],
    desc: "Privacy settings menu",
    category: "privacy",
    react: "🔐",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        let privacyMenu = `🔐 *PRIVACY SETTINGS* 🔐

📌 *Available Commands:*

🔹 blocklist - View blocked users
🔹 getbio - Get user's bio
🔹 setppall - Set profile pic privacy
🔹 setonline - Set online privacy
🔹 setpp - Change bot's profile pic
🔹 setmyname - Change bot's name
🔹 updatebio - Change bot's bio
🔹 groupsprivacy - Set group add privacy
🔹 getprivacy - View current privacy settings
🔹 getpp - Get user's profile picture

━━━━━━━━━━━━━━━━

📝 *Privacy Options:*
• all - Everyone
• contacts - My contacts only
• contact_blacklist - Contacts except blocked
• none - Nobody
• match_last_seen - Match last seen

━━━━━━━━━━━━━━━━
⚠️ *Note:* Most commands are owner-only`;

        await sendFormattedMessage(
            conn, 
            from, 
            privacyMenu, 
            sender, 
            pushname,
            "Privacy Menu",
            "Bot privacy settings"
        );

    } catch (e) {
        console.log(e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error:* ${e.message}`, 
            sender, 
            pushname,
            "Privacy Menu - Error",
            "Something went wrong"
        );
    }
});

cmd({
    pattern: "blocklist",
    alias: ["blocked", "blockedlist"],
    desc: "View the list of blocked users.",
    category: "privacy",
    react: "📋",
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
            "Block List - Access Denied",
            "Owner only"
        );
        return;
    }

    try {
        const blockedUsers = await conn.fetchBlocklist();

        if (blockedUsers.length === 0) {
            await sendFormattedMessage(
                conn, 
                from, 
                "📋 *Your block list is empty.*", 
                sender, 
                pushname,
                "Block List",
                "No blocked users"
            );
            return;
        }

        const list = blockedUsers.map((user, i) => `${i + 1}. 🚧 ${user.split('@')[0]}`).join('\n');
        const count = blockedUsers.length;

        await sendFormattedMessage(
            conn, 
            from, 
            `📋 *BLOCKED USERS* 📋\n\n📊 *Total:* ${count}\n\n${list}`, 
            sender, 
            pushname,
            "Block List",
            `${count} blocked users`
        );
    } catch (err) {
        console.error(err);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Failed to fetch block list:* ${err.message}`, 
            sender, 
            pushname,
            "Block List - Error",
            "Fetch failed"
        );
    }
});

cmd({
    pattern: "getbio",
    alias: ["fetchbio", "userbio"],
    desc: "Displays the user's bio.",
    category: "privacy",
    filename: __filename,
}, async (conn, mek, m, { args, reply, sender, pushname, from }) => {
    try {
        const jid = args[0] || mek.key.remoteJid;
        const about = await conn.fetchStatus?.(jid);
        if (!about) {
            await sendFormattedMessage(
                conn, 
                from, 
                "📝 *No bio found for this user.*", 
                sender, 
                pushname,
                "User Bio",
                "Bio not available"
            );
            return;
        }
        await sendFormattedMessage(
            conn, 
            from, 
            `📝 *USER BIO*\n\n${about.status}`, 
            sender, 
            pushname,
            "User Bio",
            "Bio fetched"
        );
    } catch (error) {
        console.error("Error in bio command:", error);
        await sendFormattedMessage(
            conn, 
            from, 
            "📝 *No bio found.*", 
            sender, 
            pushname,
            "User Bio - Error",
            "Bio not available"
        );
    }
});

cmd({
    pattern: "setppall",
    alias: ["profileprivacy"],
    desc: "Update Profile Picture Privacy",
    category: "privacy",
    react: "🔐",
    filename: __filename
}, 
async (conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    if (!isOwner) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *You are not the owner!*", 
            sender, 
            pushname,
            "Set PP Privacy - Access Denied",
            "Owner only"
        );
        return;
    }
    
    try {
        const value = args[0] || 'all'; 
        const validValues = ['all', 'contacts', 'contact_blacklist', 'none'];  
        
        if (!validValues.includes(value)) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Invalid option*\n\nValid options are: 'all', 'contacts', 'contact_blacklist', 'none'", 
                sender, 
                pushname,
                "Set PP Privacy - Error",
                "Invalid option"
            );
            return;
        }
        
        await conn.updateProfilePicturePrivacy(value);
        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *Profile picture privacy updated to:* ${value}`, 
            sender, 
            pushname,
            "Set PP Privacy",
            `Privacy set to ${value}`
        );
    } catch (e) {
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error:* ${e.message}`, 
            sender, 
            pushname,
            "Set PP Privacy - Error",
            "Update failed"
        );
    }
});

cmd({
    pattern: "setonline",
    alias: ["onlineprivacy"],
    desc: "Update Online Privacy",
    category: "privacy",
    react: "🔐",
    filename: __filename
}, 
async (conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    if (!isOwner) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *You are not the owner!*", 
            sender, 
            pushname,
            "Set Online Privacy - Access Denied",
            "Owner only"
        );
        return;
    }

    try {
        const value = args[0] || 'all'; 
        const validValues = ['all', 'match_last_seen'];
        
        if (!validValues.includes(value)) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Invalid option*\n\nValid options are: 'all', 'match_last_seen'", 
                sender, 
                pushname,
                "Set Online Privacy - Error",
                "Invalid option"
            );
            return;
        }

        await conn.updateOnlinePrivacy(value);
        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *Online privacy updated to:* ${value}`, 
            sender, 
            pushname,
            "Set Online Privacy",
            `Privacy set to ${value}`
        );
    } catch (e) {
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error:* ${e.message}`, 
            sender, 
            pushname,
            "Set Online Privacy - Error",
            "Update failed"
        );
    }
});

cmd({
    pattern: "setpp",
    alias: ["setprofilepic"],
    desc: "Set bot profile picture.",
    category: "privacy",
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
            "Set Profile Pic - Access Denied",
            "Owner only"
        );
        return;
    }
    
    if (!quoted || !quoted.message.imageMessage) {
        await sendFormattedMessage(
            conn, 
            from, 
            "🖼️ *Please reply to an image.*\n\n📌 *Usage:* Reply to an image with .setpp", 
            sender, 
            pushname,
            "Set Profile Pic - Error",
            "No image"
        );
        return;
    }
    
    try {
        const stream = await downloadContentFromMessage(quoted.message.imageMessage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const mediaPath = path.join(__dirname, `${Date.now()}.jpg`);
        fs.writeFileSync(mediaPath, buffer);

        await conn.updateProfilePicture(conn.user.jid, { url: `file://${mediaPath}` });
        fs.unlinkSync(mediaPath);
        
        await sendFormattedMessage(
            conn, 
            from, 
            "🖼️ *Profile picture updated successfully!*", 
            sender, 
            pushname,
            "Set Profile Pic",
            "Profile updated"
        );
    } catch (error) {
        console.error("Error updating profile picture:", error);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error updating profile picture:* ${error.message}`, 
            sender, 
            pushname,
            "Set Profile Pic - Error",
            "Update failed"
        );
    }
});

cmd({
    pattern: "setmyname",
    alias: ["setname", "botname"],
    desc: "Set your WhatsApp display name.",
    category: "privacy",
    react: "⚙️",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply, args, sender, pushname }) => {
    if (!isOwner) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *You are not the owner!*", 
            sender, 
            pushname,
            "Set Name - Access Denied",
            "Owner only"
        );
        return;
    }

    const displayName = args.join(" ");
    if (!displayName) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Please provide a display name*\n\n📌 *Usage:* .setmyname NJABULO UI", 
            sender, 
            pushname,
            "Set Name - Error",
            "No name"
        );
        return;
    }

    try {
        await conn.updateProfileName(displayName);
        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *Display name set to:* ${displayName}`, 
            sender, 
            pushname,
            "Set Name",
            `Name changed to ${displayName}`
        );
    } catch (err) {
        console.error(err);
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Failed to set display name*", 
            sender, 
            pushname,
            "Set Name - Error",
            "Update failed"
        );
    }
});

cmd({
    pattern: "updatebio",
    alias: ["setbio", "botbio"],
    react: "🥏",
    desc: "Change the Bot number Bio.",
    category: "privacy",
    use: '.updatebio',
    filename: __filename
},
async (conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isOwner) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *You must be an Owner to use this command*", 
                sender, 
                pushname,
                "Update Bio - Access Denied",
                "Owner only"
            );
            return;
        }
        
        if (!q) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❓ *Enter the New Bio*\n\n📌 *Usage:* .updatebio Your new bio here", 
                sender, 
                pushname,
                "Update Bio - Error",
                "No bio"
            );
            return;
        }
        
        if (q.length > 139) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❗ *Character limit exceeded*\n\nBio must be less than 139 characters.", 
                sender, 
                pushname,
                "Update Bio - Error",
                "Too long"
            );
            return;
        }
        
        await conn.updateProfileStatus(q);
        await sendFormattedMessage(
            conn, 
            from, 
            "✔️ *New Bio Added Successfully*", 
            sender, 
            pushname,
            "Update Bio",
            "Bio updated"
        );
    } catch (e) {
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error:* ${e.message}`, 
            sender, 
            pushname,
            "Update Bio - Error",
            "Update failed"
        );
    }
});

cmd({
    pattern: "groupsprivacy",
    alias: ["groupprivacy"],
    desc: "Update Group Add Privacy",
    category: "privacy",
    react: "🔐",
    filename: __filename
}, 
async (conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    if (!isOwner) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *You are not the owner!*", 
            sender, 
            pushname,
            "Group Privacy - Access Denied",
            "Owner only"
        );
        return;
    }

    try {
        const value = args[0] || 'all'; 
        const validValues = ['all', 'contacts', 'contact_blacklist', 'none'];
        
        if (!validValues.includes(value)) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Invalid option*\n\nValid options are: 'all', 'contacts', 'contact_blacklist', 'none'", 
                sender, 
                pushname,
                "Group Privacy - Error",
                "Invalid option"
            );
            return;
        }

        await conn.updateGroupsAddPrivacy(value);
        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *Group add privacy updated to:* ${value}`, 
            sender, 
            pushname,
            "Group Privacy",
            `Privacy set to ${value}`
        );
    } catch (e) {
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error:* ${e.message}`, 
            sender, 
            pushname,
            "Group Privacy - Error",
            "Update failed"
        );
    }
});

cmd({
    pattern: "getprivacy",
    alias: ["viewprivacy", "privacyinfo"],
    desc: "Get the bot Number Privacy Setting Updates.",
    category: "privacy",
    use: '.getprivacy',
    filename: __filename
},
async (conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isOwner) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *You must be an Owner to use this command*", 
                sender, 
                pushname,
                "Get Privacy - Access Denied",
                "Owner only"
            );
            return;
        }
        
        const duka = await conn.fetchPrivacySettings?.(true);
        if (!duka) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Failed to fetch privacy settings*", 
                sender, 
                pushname,
                "Get Privacy - Error",
                "Fetch failed"
            );
            return;
        }
        
        let puka = `🔐 *PRIVACY SETTINGS* 🔐

📖 *Read Receipts:* ${duka.readreceipts}
🖼️ *Profile Picture:* ${duka.profile}
📝 *Status:* ${duka.status}
🟢 *Online:* ${duka.online}
⏰ *Last Seen:* ${duka.last}
👥 *Group Add:* ${duka.groupadd}
📞 *Call Add:* ${duka.calladd}

━━━━━━━━━━━━━━━━
✅ *Current privacy settings*`;

        await sendFormattedMessage(
            conn, 
            from, 
            puka, 
            sender, 
            pushname,
            "Privacy Settings",
            "Current settings"
        );
    } catch (e) {
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error:* ${e.message}`, 
            sender, 
            pushname,
            "Get Privacy - Error",
            "Fetch failed"
        );
    }
});

cmd({
    pattern: "getpp",
    alias: ["fetchpp", "profilepic"],
    desc: "Fetch the profile picture of a tagged or replied user.",
    category: "privacy",
    filename: __filename
}, async (conn, mek, m, { quoted, isGroup, sender, participants, reply, from, pushname }) => {
    try {
        const targetJid = quoted ? quoted.sender : sender;

        if (!targetJid) {
            await sendFormattedMessage(
                conn, 
                from, 
                "⚠️ *Please reply to a message to fetch the profile picture.*", 
                sender, 
                pushname,
                "Get PP - Error",
                "No target"
            );
            return;
        }

        const userPicUrl = await conn.profilePictureUrl(targetJid, "image").catch(() => null);

        if (!userPicUrl) {
            await sendFormattedMessage(
                conn, 
                from, 
                "⚠️ *No profile picture found for the specified user.*", 
                sender, 
                pushname,
                "Get PP - Error",
                "No picture"
            );
            return;
        }

        await conn.sendMessage(from, {
            image: { url: userPicUrl },
            caption: `🖼️ *Profile picture of @${targetJid.split('@')[0]}*`
        }, { quoted: mek });
        
    } catch (e) {
        console.error("Error fetching user profile picture:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *An error occurred while fetching the profile picture.*", 
            sender, 
            pushname,
            "Get PP - Error",
            "Fetch failed"
        );
    }
});
