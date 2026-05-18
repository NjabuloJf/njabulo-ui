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
                    body: externalBody || "Block/Unblock System",
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
    pattern: "block",
    desc: "Blocks a person",
    category: "owner",
    react: "🚫",
    filename: __filename
},
async (conn, mek, m, { from, reply, q, react, sender, pushname, isCreator }) => {
    try {
        // Check if user is owner
        if (!isCreator) {
            await react("❌");
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Only the bot owner can use this command.*", 
                sender, 
                pushname,
                "Access Denied",
                "Owner only command"
            );
            return;
        }

        let jid;
        let userName = "";
        
        if (mek.quoted) {
            jid = mek.quoted.sender; // If replying to a message, get sender JID
            userName = mek.quoted.pushname || jid.split("@")[0];
        } else if (mek.mentionedJid && mek.mentionedJid.length > 0) {
            jid = mek.mentionedJid[0]; // If mentioning a user, get their JID
            userName = pushname || jid.split("@")[0];
        } else if (q && q.includes("@")) {
            jid = q.replace(/[@\s]/g, '') + "@s.whatsapp.net"; // If manually typing a JID
            userName = jid.split("@")[0];
        } else {
            await react("❌");
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Please mention a user or reply to their message.*\n\nExamples:\n• Reply to a user's message with `.block`\n• Mention a user: `.block @username`\n• Type JID: `.block 1234567890@s.whatsapp.net`", 
                sender, 
                pushname,
                "Block Command - Error",
                "No user specified"
            );
            return;
        }

        await conn.updateBlockStatus(jid, "block");
        await react("✅");
        
        const successMessage = `🚫 *USER BLOCKED* 🚫

╭───〔 *BLOCK SUCCESSFUL* 〕───◉
│
├▢ *USER:* @${jid.split("@")[0]}
├▢ *ACTION:* Blocked
├▢ *STATUS:* ✅ Success
│
╰──────────────────◉

*User has been blocked from using the bot.*`;

        await sendFormattedMessage(
            conn, 
            from, 
            successMessage, 
            sender, 
            pushname,
            "Block Command",
            `Blocked: ${userName}`
        );
        
    } catch (error) {
        console.error("Block command error:", error);
        await react("❌");
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Failed to block the user.*\n\nError: ${error.message}`, 
            sender, 
            pushname,
            "Block Command - Error",
            "Failed to block user"
        );
    }
});

cmd({
    pattern: "unblock",
    desc: "Unblocks a person",
    category: "owner",
    react: "🔓",
    filename: __filename
},
async (conn, mek, m, { from, reply, q, react, sender, pushname, isCreator }) => {
    try {
        // Check if user is owner
        if (!isCreator) {
            await react("❌");
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Only the bot owner can use this command.*", 
                sender, 
                pushname,
                "Access Denied",
                "Owner only command"
            );
            return;
        }

        let jid;
        let userName = "";
        
        if (mek.quoted) {
            jid = mek.quoted.sender; // If replying to a message, get sender JID
            userName = mek.quoted.pushname || jid.split("@")[0];
        } else if (mek.mentionedJid && mek.mentionedJid.length > 0) {
            jid = mek.mentionedJid[0]; // If mentioning a user, get their JID
            userName = pushname || jid.split("@")[0];
        } else if (q && q.includes("@")) {
            jid = q.replace(/[@\s]/g, '') + "@s.whatsapp.net"; // If manually typing a JID
            userName = jid.split("@")[0];
        } else {
            await react("❌");
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Please mention a user or reply to their message.*\n\nExamples:\n• Reply to a user's message with `.unblock`\n• Mention a user: `.unblock @username`\n• Type JID: `.unblock 1234567890@s.whatsapp.net`", 
                sender, 
                pushname,
                "Unblock Command - Error",
                "No user specified"
            );
            return;
        }

        await conn.updateBlockStatus(jid, "unblock");
        await react("✅");
        
        const successMessage = `🔓 *USER UNBLOCKED* 🔓

╭───〔 *UNBLOCK SUCCESSFUL* 〕───◉
│
├▢ *USER:* @${jid.split("@")[0]}
├▢ *ACTION:* Unblocked
├▢ *STATUS:* ✅ Success
│
╰──────────────────◉

*User can now use the bot again.*`;

        await sendFormattedMessage(
            conn, 
            from, 
            successMessage, 
            sender, 
            pushname,
            "Unblock Command",
            `Unblocked: ${userName}`
        );
        
    } catch (error) {
        console.error("Unblock command error:", error);
        await react("❌");
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Failed to unblock the user.*\n\nError: ${error.message}`, 
            sender, 
            pushname,
            "Unblock Command - Error",
            "Failed to unblock user"
        );
    }
});
