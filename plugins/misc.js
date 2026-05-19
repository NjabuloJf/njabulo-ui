const axios = require('axios');
const config = require('../config');
const { cmd, commands } = require('../command');
const util = require("util");
const { getAnti, setAnti, initializeAntiDeleteSettings } = require('../data/antidel');

initializeAntiDeleteSettings();

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
                    body: externalBody || "AntiDelete System",
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
    pattern: "antidelete",
    alias: ['antidel', 'ad'],
    desc: "Sets up the Antidelete",
    category: "misc",
    filename: __filename
},
async (conn, mek, m, { from, reply, q, text, isCreator, fromMe, sender, pushname }) => {
    if (!isCreator) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *This command is only for the bot owner*", 
            sender, 
            pushname,
            "AntiDelete - Access Denied",
            "Owner only"
        );
        return;
    }
    
    try {
        const command = q?.toLowerCase();

        switch (command) {
            case 'on':
                await setAnti('gc', false);
                await setAnti('dm', false);
                await sendFormattedMessage(
                    conn, 
                    from, 
                    "🔒 *AntiDelete is now OFF for Group Chats and Direct Messages.*", 
                    sender, 
                    pushname,
                    "AntiDelete",
                    "Disabled for all"
                );
                break;

            case 'off gc':
                await setAnti('gc', false);
                await sendFormattedMessage(
                    conn, 
                    from, 
                    "🔒 *AntiDelete for Group Chats is now DISABLED.*", 
                    sender, 
                    pushname,
                    "AntiDelete",
                    "GC disabled"
                );
                break;

            case 'off dm':
                await setAnti('dm', false);
                await sendFormattedMessage(
                    conn, 
                    from, 
                    "🔒 *AntiDelete for Direct Messages is now DISABLED.*", 
                    sender, 
                    pushname,
                    "AntiDelete",
                    "DM disabled"
                );
                break;

            case 'set gc':
                const gcStatus = await getAnti('gc');
                await setAnti('gc', !gcStatus);
                await sendFormattedMessage(
                    conn, 
                    from, 
                    `🔒 *AntiDelete for Group Chats ${!gcStatus ? 'ENABLED' : 'DISABLED'}.*`, 
                    sender, 
                    pushname,
                    "AntiDelete",
                    `GC ${!gcStatus ? 'ON' : 'OFF'}`
                );
                break;

            case 'set dm':
                const dmStatus = await getAnti('dm');
                await setAnti('dm', !dmStatus);
                await sendFormattedMessage(
                    conn, 
                    from, 
                    `🔒 *AntiDelete for Direct Messages ${!dmStatus ? 'ENABLED' : 'DISABLED'}.*`, 
                    sender, 
                    pushname,
                    "AntiDelete",
                    `DM ${!dmStatus ? 'ON' : 'OFF'}`
                );
                break;

            case 'set all':
                await setAnti('gc', true);
                await setAnti('dm', true);
                await sendFormattedMessage(
                    conn, 
                    from, 
                    "🔒 *AntiDelete set for ALL chats.*", 
                    sender, 
                    pushname,
                    "AntiDelete",
                    "All enabled"
                );
                break;

            case 'status':
                const currentDmStatus = await getAnti('dm');
                const currentGcStatus = await getAnti('gc');
                await sendFormattedMessage(
                    conn, 
                    from, 
                    `🔒 *ANTIDELETE STATUS* 🔒\n\n📱 *DM AntiDelete:* ${currentDmStatus ? '✅ ENABLED' : '❌ DISABLED'}\n👥 *Group Chat AntiDelete:* ${currentGcStatus ? '✅ ENABLED' : '❌ DISABLED'}`, 
                    sender, 
                    pushname,
                    "AntiDelete",
                    "Status"
                );
                break;

            default:
                const helpMessage = `🔒 *ANTIDELETE COMMANDS* 🔒

📌 *Available commands:*

• .antidelete on - Reset AntiDelete (disabled)
• .antidelete off gc - Disable for Group Chats
• .antidelete off dm - Disable for Direct Messages
• .antidelete set gc - Toggle for Group Chats
• .antidelete set dm - Toggle for Direct Messages
• .antidelete set all - Enable for all chats
• .antidelete status - Check current status`;

                await sendFormattedMessage(
                    conn, 
                    from, 
                    helpMessage, 
                    sender, 
                    pushname,
                    "AntiDelete Help",
                    "Commands list"
                );
                break;
        }
    } catch (e) {
        console.error("Error in antidelete command:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *An error occurred:* ${e.message}`, 
            sender, 
            pushname,
            "AntiDelete - Error",
            "Request failed"
        );
    }
});

cmd({
    pattern: "vv3",
    alias: ['lx', '🔥', 'viewonce'],
    desc: "Fetch and resend a ViewOnce message content (image/video).",
    category: "misc",
    use: '<query>',
    filename: __filename
},
async (conn, mek, m, { from, reply, sender, pushname }) => {
    try {
        const quotedMessage = m.msg.contextInfo.quotedMessage;

        if (quotedMessage && quotedMessage.viewOnceMessageV2) {
            const quot = quotedMessage.viewOnceMessageV2;
            if (quot.message.imageMessage) {
                let cap = quot.message.imageMessage.caption;
                let anu = await conn.downloadAndSaveMediaMessage(quot.message.imageMessage);
                return conn.sendMessage(from, { image: { url: anu }, caption: cap }, { quoted: mek });
            }
            if (quot.message.videoMessage) {
                let cap = quot.message.videoMessage.caption;
                let anu = await conn.downloadAndSaveMediaMessage(quot.message.videoMessage);
                return conn.sendMessage(from, { video: { url: anu }, caption: cap }, { quoted: mek });
            }
            if (quot.message.audioMessage) {
                let anu = await conn.downloadAndSaveMediaMessage(quot.message.audioMessage);
                return conn.sendMessage(from, { audio: { url: anu } }, { quoted: mek });
            }
        }

        if (!mek.quoted) {
            await sendFormattedMessage(
                conn, 
                from, 
                "📸 *Please reply to a ViewOnce message.*\n\nReply to a view-once image/video/audio with .vv3", 
                sender, 
                pushname,
                "ViewOnce - Error",
                "No message"
            );
            return;
        }
        
        if (mek.quoted.mtype === "viewOnceMessage") {
            if (mek.quoted.message.imageMessage) {
                let cap = mek.quoted.message.imageMessage.caption;
                let anu = await conn.downloadAndSaveMediaMessage(mek.quoted.message.imageMessage);
                return conn.sendMessage(from, { image: { url: anu }, caption: cap }, { quoted: mek });
            }
            else if (mek.quoted.message.videoMessage) {
                let cap = mek.quoted.message.videoMessage.caption;
                let anu = await conn.downloadAndSaveMediaMessage(mek.quoted.message.videoMessage);
                return conn.sendMessage(from, { video: { url: anu }, caption: cap }, { quoted: mek });
            }
        } else if (mek.quoted.message.audioMessage) {
            let anu = await conn.downloadAndSaveMediaMessage(mek.quoted.message.audioMessage);
            return conn.sendMessage(from, { audio: { url: anu } }, { quoted: mek });
        } else {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *This is not a ViewOnce message.*\n\nPlease reply to a view-once image/video/audio.", 
                sender, 
                pushname,
                "ViewOnce - Error",
                "Invalid type"
            );
            return;
        }
        
    } catch (e) {
        console.log("Error:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *An error occurred:* ${e.message}`, 
            sender, 
            pushname,
            "ViewOnce - Error",
            "Request failed"
        );
    }
});
