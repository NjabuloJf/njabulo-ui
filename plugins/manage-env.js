const { cmd, commands } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;
const fs = require('fs');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions2');
const { writeFileSync } = require('fs');
const path = require('path');

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
                    body: externalBody || "Bot Settings",
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
    pattern: "admin-events",
    alias: ["adminevents"],
    desc: "Enable or disable admin event notifications",
    category: "settings",
    filename: __filename
},
async (conn, mek, m, { from, args, isCreator, reply, sender, pushname }) => {
    if (!isCreator) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Only the owner can use this command!*", 
            sender, 
            pushname,
            "Settings - Access Denied",
            "Owner only"
        );
        return;
    }

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.ADMIN_EVENTS = "true";
        await sendFormattedMessage(
            conn, 
            from, 
            "✅ *Admin event notifications are now ENABLED.*", 
            sender, 
            pushname,
            "Admin Events",
            "Enabled"
        );
    } else if (status === "off") {
        config.ADMIN_EVENTS = "false";
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Admin event notifications are now DISABLED.*", 
            sender, 
            pushname,
            "Admin Events",
            "Disabled"
        );
    } else {
        await sendFormattedMessage(
            conn, 
            from, 
            "⚙️ *Usage:* .admin-events on/off", 
            sender, 
            pushname,
            "Admin Events",
            "Invalid"
        );
    }
});

cmd({
    pattern: "welcome",
    alias: ["welcomeset"],
    desc: "Enable or disable welcome messages for new members",
    category: "settings",
    filename: __filename
},
async (conn, mek, m, { from, args, isCreator, reply, sender, pushname }) => {
    if (!isCreator) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Only the owner can use this command!*", 
            sender, 
            pushname,
            "Settings - Access Denied",
            "Owner only"
        );
        return;
    }

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.WELCOME = "true";
        await sendFormattedMessage(
            conn, 
            from, 
            "✅ *Welcome messages are now ENABLED.*", 
            sender, 
            pushname,
            "Welcome Settings",
            "Enabled"
        );
    } else if (status === "off") {
        config.WELCOME = "false";
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Welcome messages are now DISABLED.*", 
            sender, 
            pushname,
            "Welcome Settings",
            "Disabled"
        );
    } else {
        await sendFormattedMessage(
            conn, 
            from, 
            "⚙️ *Usage:* .welcome on/off", 
            sender, 
            pushname,
            "Welcome Settings",
            "Invalid"
        );
    }
});

cmd({
    pattern: "setprefix",
    alias: ["prefix"],
    react: "🔧",
    desc: "Change the bot's command prefix.",
    category: "settings",
    filename: __filename,
}, async (conn, mek, m, { from, args, isCreator, reply, sender, pushname }) => {
    if (!isCreator) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Only the owner can use this command!*", 
            sender, 
            pushname,
            "Settings - Access Denied",
            "Owner only"
        );
        return;
    }

    const newPrefix = args[0];
    if (!newPrefix) {
        await sendFormattedMessage(
            conn, 
            from, 
            "⚙️ *Please provide a new prefix*\n\n📌 *Example:* .setprefix !", 
            sender, 
            pushname,
            "Set Prefix",
            "No prefix"
        );
        return;
    }

    config.PREFIX = newPrefix;
    await sendFormattedMessage(
        conn, 
        from, 
        `✅ *Prefix successfully changed to* ${newPrefix}`, 
        sender, 
        pushname,
        "Set Prefix",
        `Prefix: ${newPrefix}`
    );
});

cmd({
    pattern: "mode",
    alias: ["setmode"],
    react: "🫟",
    desc: "Set bot mode to private or public.",
    category: "settings",
    filename: __filename,
}, async (conn, mek, m, { from, args, isCreator, reply, sender, pushname }) => {
    if (!isCreator) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Only the owner can use this command!*", 
            sender, 
            pushname,
            "Settings - Access Denied",
            "Owner only"
        );
        return;
    }

    if (!args[0]) {
        await sendFormattedMessage(
            conn, 
            from, 
            `📌 *Current mode:* ${config.MODE}\n\n⚙️ *Usage:* .mode private OR .mode public`, 
            sender, 
            pushname,
            "Bot Mode",
            `Mode: ${config.MODE}`
        );
        return;
    }

    const modeArg = args[0].toLowerCase();

    if (modeArg === "private") {
        config.MODE = "private";
        await sendFormattedMessage(
            conn, 
            from, 
            "✅ *Bot mode is now set to PRIVATE.*", 
            sender, 
            pushname,
            "Bot Mode",
            "Private"
        );
    } else if (modeArg === "public") {
        config.MODE = "public";
        await sendFormattedMessage(
            conn, 
            from, 
            "✅ *Bot mode is now set to PUBLIC.*", 
            sender, 
            pushname,
            "Bot Mode",
            "Public"
        );
    } else {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Invalid mode*\n\nUse .mode private or .mode public", 
            sender, 
            pushname,
            "Bot Mode",
            "Invalid"
        );
    }
});

cmd({
    pattern: "auto-typing",
    alias: ["autotyping"],
    description: "Enable or disable auto-typing feature.",
    category: "settings",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply, sender, pushname }) => {
    if (!isCreator) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Only the owner can use this command!*", 
            sender, 
            pushname,
            "Settings - Access Denied",
            "Owner only"
        );
        return;
    }

    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) {
        await sendFormattedMessage(
            conn, 
            from, 
            "⚙️ *Usage:* .auto-typing on/off", 
            sender, 
            pushname,
            "Auto Typing",
            "Invalid"
        );
        return;
    }

    config.AUTO_TYPING = status === "on" ? "true" : "false";
    await sendFormattedMessage(
        conn, 
        from, 
        `✅ *Auto typing has been turned ${status === "on" ? "ON" : "OFF"}.*`, 
        sender, 
        pushname,
        "Auto Typing",
        status === "on" ? "Enabled" : "Disabled"
    );
});

cmd({
    pattern: "mention-reply",
    alias: ["menetionreply", "mee"],
    description: "Enable or disable mention reply feature.",
    category: "settings",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply, sender, pushname }) => {
    if (!isCreator) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Only the owner can use this command!*", 
            sender, 
            pushname,
            "Settings - Access Denied",
            "Owner only"
        );
        return;
    }

    if (args[0] === "on") {
        config.MENTION_REPLY = "true";
        await sendFormattedMessage(
            conn, 
            from, 
            "✅ *Mention Reply feature is now ENABLED.*", 
            sender, 
            pushname,
            "Mention Reply",
            "Enabled"
        );
    } else if (args[0] === "off") {
        config.MENTION_REPLY = "false";
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Mention Reply feature is now DISABLED.*", 
            sender, 
            pushname,
            "Mention Reply",
            "Disabled"
        );
    } else {
        await sendFormattedMessage(
            conn, 
            from, 
            "⚙️ *Usage:* .mention-reply on/off", 
            sender, 
            pushname,
            "Mention Reply",
            "Invalid"
        );
    }
});

cmd({
    pattern: "always-online",
    alias: ["alwaysonline"],
    desc: "Enable or disable the always online mode",
    category: "settings",
    filename: __filename
},
async (conn, mek, m, { from, args, isCreator, reply, sender, pushname }) => {
    if (!isCreator) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Only the owner can use this command!*", 
            sender, 
            pushname,
            "Settings - Access Denied",
            "Owner only"
        );
        return;
    }

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.ALWAYS_ONLINE = "true";
        await sendFormattedMessage(
            conn, 
            from, 
            "✅ *Always online mode is now ENABLED.*", 
            sender, 
            pushname,
            "Always Online",
            "Enabled"
        );
    } else if (status === "off") {
        config.ALWAYS_ONLINE = "false";
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Always online mode is now DISABLED.*", 
            sender, 
            pushname,
            "Always Online",
            "Disabled"
        );
    } else {
        await sendFormattedMessage(
            conn, 
            from, 
            "⚙️ *Usage:* .always-online on/off", 
            sender, 
            pushname,
            "Always Online",
            "Invalid"
        );
    }
});

cmd({
    pattern: "auto-recording",
    alias: ["autorecoding"],
    description: "Enable or disable auto-recording feature.",
    category: "settings",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply, sender, pushname }) => {
    if (!isCreator) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Only the owner can use this command!*", 
            sender, 
            pushname,
            "Settings - Access Denied",
            "Owner only"
        );
        return;
    }

    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) {
        await sendFormattedMessage(
            conn, 
            from, 
            "⚙️ *Usage:* .auto-recording on/off", 
            sender, 
            pushname,
            "Auto Recording",
            "Invalid"
        );
        return;
    }

    config.AUTO_RECORDING = status === "on" ? "true" : "false";
    if (status === "on") {
        await conn.sendPresenceUpdate("recording", from);
        await sendFormattedMessage(
            conn, 
            from, 
            "✅ *Auto recording is now ENABLED. Bot is recording...*", 
            sender, 
            pushname,
            "Auto Recording",
            "Enabled"
        );
    } else {
        await conn.sendPresenceUpdate("available", from);
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Auto recording has been DISABLED.*", 
            sender, 
            pushname,
            "Auto Recording",
            "Disabled"
        );
    }
});

cmd({
    pattern: "auto-seen",
    alias: ["autostatusview"],
    desc: "Enable or disable auto-viewing of statuses",
    category: "settings",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply, sender, pushname }) => {
    if (!isCreator) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Only the owner can use this command!*", 
            sender, 
            pushname,
            "Settings - Access Denied",
            "Owner only"
        );
        return;
    }

    if (args[0] === "on") {
        config.AUTO_STATUS_SEEN = "true";
        await sendFormattedMessage(
            conn, 
            from, 
            "✅ *Auto-viewing of statuses is now ENABLED.*", 
            sender, 
            pushname,
            "Auto Seen",
            "Enabled"
        );
    } else if (args[0] === "off") {
        config.AUTO_STATUS_SEEN = "false";
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Auto-viewing of statuses is now DISABLED.*", 
            sender, 
            pushname,
            "Auto Seen",
            "Disabled"
        );
    } else {
        await sendFormattedMessage(
            conn, 
            from, 
            "⚙️ *Usage:* .auto-seen on/off", 
            sender, 
            pushname,
            "Auto Seen",
            "Invalid"
        );
    }
});

cmd({
    pattern: "status-react",
    alias: ["statusreaction"],
    desc: "Enable or disable auto-reacting to statuses",
    category: "settings",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply, sender, pushname }) => {
    if (!isCreator) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Only the owner can use this command!*", 
            sender, 
            pushname,
            "Settings - Access Denied",
            "Owner only"
        );
        return;
    }

    if (args[0] === "on") {
        config.AUTO_STATUS_REACT = "true";
        await sendFormattedMessage(
            conn, 
            from, 
            "✅ *Auto-reacting to statuses is now ENABLED.*", 
            sender, 
            pushname,
            "Status React",
            "Enabled"
        );
    } else if (args[0] === "off") {
        config.AUTO_STATUS_REACT = "false";
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Auto-reacting to statuses is now DISABLED.*", 
            sender, 
            pushname,
            "Status React",
            "Disabled"
        );
    } else {
        await sendFormattedMessage(
            conn, 
            from, 
            "⚙️ *Usage:* .status-react on/off", 
            sender, 
            pushname,
            "Status React",
            "Invalid"
        );
    }
});

cmd({
    pattern: "read-message",
    alias: ["autoread"],
    desc: "enable or disable readmessage.",
    category: "settings",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply, sender, pushname }) => {
    if (!isCreator) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Only the owner can use this command!*", 
            sender, 
            pushname,
            "Settings - Access Denied",
            "Owner only"
        );
        return;
    }

    if (args[0] === "on") {
        config.READ_MESSAGE = "true";
        await sendFormattedMessage(
            conn, 
            from, 
            "✅ *Auto-read message feature is now ENABLED.*", 
            sender, 
            pushname,
            "Auto Read",
            "Enabled"
        );
    } else if (args[0] === "off") {
        config.READ_MESSAGE = "false";
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Auto-read message feature is now DISABLED.*", 
            sender, 
            pushname,
            "Auto Read",
            "Disabled"
        );
    } else {
        await sendFormattedMessage(
            conn, 
            from, 
            "⚙️ *Usage:* .read-message on/off", 
            sender, 
            pushname,
            "Auto Read",
            "Invalid"
        );
    }
});

cmd({
    pattern: "auto-voice",
    alias: ["autovoice"],
    desc: "Enable or disable auto-voice feature.",
    category: "settings",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply, sender, pushname }) => {
    if (!isCreator) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Only the owner can use this command!*", 
            sender, 
            pushname,
            "Settings - Access Denied",
            "Owner only"
        );
        return;
    }

    if (args[0] === "on") {
        config.AUTO_VOICE = "true";
        await sendFormattedMessage(
            conn, 
            from, 
            "✅ *Auto-voice feature is now ENABLED.*", 
            sender, 
            pushname,
            "Auto Voice",
            "Enabled"
        );
    } else if (args[0] === "off") {
        config.AUTO_VOICE = "false";
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Auto-voice feature is now DISABLED.*", 
            sender, 
            pushname,
            "Auto Voice",
            "Disabled"
        );
    } else {
        await sendFormattedMessage(
            conn, 
            from, 
            "⚙️ *Usage:* .auto-voice on/off", 
            sender, 
            pushname,
            "Auto Voice",
            "Invalid"
        );
    }
});

cmd({
    pattern: "anti-bad",
    alias: ["antibadword"],
    desc: "Enable or disable anti-bad word filter.",
    category: "settings",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply, sender, pushname }) => {
    if (!isCreator) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Only the owner can use this command!*", 
            sender, 
            pushname,
            "Settings - Access Denied",
            "Owner only"
        );
        return;
    }

    if (args[0] === "on") {
        config.ANTI_BAD_WORD = "true";
        await sendFormattedMessage(
            conn, 
            from, 
            "✅ *Anti-bad word filter is now ENABLED.*", 
            sender, 
            pushname,
            "Anti Bad",
            "Enabled"
        );
    } else if (args[0] === "off") {
        config.ANTI_BAD_WORD = "false";
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Anti-bad word filter is now DISABLED.*", 
            sender, 
            pushname,
            "Anti Bad",
            "Disabled"
        );
    } else {
        await sendFormattedMessage(
            conn, 
            from, 
            "⚙️ *Usage:* .anti-bad on/off", 
            sender, 
            pushname,
            "Anti Bad",
            "Invalid"
        );
    }
});

cmd({
    pattern: "auto-sticker",
    alias: ["autosticker"],
    desc: "Enable or disable auto-sticker feature.",
    category: "settings",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply, sender, pushname }) => {
    if (!isCreator) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Only the owner can use this command!*", 
            sender, 
            pushname,
            "Settings - Access Denied",
            "Owner only"
        );
        return;
    }

    if (args[0] === "on") {
        config.AUTO_STICKER = "true";
        await sendFormattedMessage(
            conn, 
            from, 
            "✅ *Auto-sticker feature is now ENABLED.*", 
            sender, 
            pushname,
            "Auto Sticker",
            "Enabled"
        );
    } else if (args[0] === "off") {
        config.AUTO_STICKER = "false";
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Auto-sticker feature is now DISABLED.*", 
            sender, 
            pushname,
            "Auto Sticker",
            "Disabled"
        );
    } else {
        await sendFormattedMessage(
            conn, 
            from, 
            "⚙️ *Usage:* .auto-sticker on/off", 
            sender, 
            pushname,
            "Auto Sticker",
            "Invalid"
        );
    }
});

cmd({
    pattern: "auto-reply",
    alias: ["autoreply"],
    desc: "Enable or disable auto-reply feature.",
    category: "settings",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply, sender, pushname }) => {
    if (!isCreator) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Only the owner can use this command!*", 
            sender, 
            pushname,
            "Settings - Access Denied",
            "Owner only"
        );
        return;
    }

    if (args[0] === "on") {
        config.AUTO_REPLY = "true";
        await sendFormattedMessage(
            conn, 
            from, 
            "✅ *Auto-reply feature is now ENABLED.*", 
            sender, 
            pushname,
            "Auto Reply",
            "Enabled"
        );
    } else if (args[0] === "off") {
        config.AUTO_REPLY = "false";
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Auto-reply feature is now DISABLED.*", 
            sender, 
            pushname,
            "Auto Reply",
            "Disabled"
        );
    } else {
        await sendFormattedMessage(
            conn, 
            from, 
            "⚙️ *Usage:* .auto-reply on/off", 
            sender, 
            pushname,
            "Auto Reply",
            "Invalid"
        );
    }
});

cmd({
    pattern: "auto-react",
    alias: ["autoreact"],
    desc: "Enable or disable the autoreact feature",
    category: "settings",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply, sender, pushname }) => {
    if (!isCreator) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Only the owner can use this command!*", 
            sender, 
            pushname,
            "Settings - Access Denied",
            "Owner only"
        );
        return;
    }

    if (args[0] === "on") {
        config.AUTO_REACT = "true";
        await sendFormattedMessage(
            conn, 
            from, 
            "✅ *Auto-react feature is now ENABLED.*", 
            sender, 
            pushname,
            "Auto React",
            "Enabled"
        );
    } else if (args[0] === "off") {
        config.AUTO_REACT = "false";
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Auto-react feature is now DISABLED.*", 
            sender, 
            pushname,
            "Auto React",
            "Disabled"
        );
    } else {
        await sendFormattedMessage(
            conn, 
            from, 
            "⚙️ *Usage:* .auto-react on/off", 
            sender, 
            pushname,
            "Auto React",
            "Invalid"
        );
    }
});

cmd({
    pattern: "status-reply",
    alias: ["autostatusreply"],
    desc: "Enable or disable auto-reply to statuses.",
    category: "settings",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply, sender, pushname }) => {
    if (!isCreator) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Only the owner can use this command!*", 
            sender, 
            pushname,
            "Settings - Access Denied",
            "Owner only"
        );
        return;
    }

    if (args[0] === "on") {
        config.AUTO_STATUS_REPLY = "true";
        await sendFormattedMessage(
            conn, 
            from, 
            "✅ *Auto-reply to statuses is now ENABLED.*", 
            sender, 
            pushname,
            "Status Reply",
            "Enabled"
        );
    } else if (args[0] === "off") {
        config.AUTO_STATUS_REPLY = "false";
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Auto-reply to statuses is now DISABLED.*", 
            sender, 
            pushname,
            "Status Reply",
            "Disabled"
        );
    } else {
        await sendFormattedMessage(
            conn, 
            from, 
            "⚙️ *Usage:* .status-reply on/off", 
            sender, 
            pushname,
            "Status Reply",
            "Invalid"
        );
    }
});



