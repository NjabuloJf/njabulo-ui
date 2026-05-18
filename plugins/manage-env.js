const { fana } = require('../njabulo');
const config = require('../config');
const prefix = config.PREFIX;
const fs = require('fs');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions2');
const { writeFileSync } = require('fs');
const path = require('path');

// Helper function to send formatted messages
async function sendFormattedMessage(conn, from, text, sender, type = 'success') {
    const userName = sender?.split('@')[0] || "User";
    const bodyText = type === 'success' ? '✅ Success' : type === 'warning' ? '⚠️ Warning' : '❌ Error';
    const externalBody = type === 'success' ? '⚙️ Settings Updated' : type === 'warning' ? '📢 Notice' : '🚫 Operation Failed';
    
    await conn.sendMessage(from, {
        text: text,
        contextInfo: {
            isForwarded: true,
            title: "ɴᴊᴀʙᴜʟᴏ ᴜɪ",
            body: bodyText,
            forwardedNewsletterMessageInfo: {
                newsletterJid: config.NEWSLETTER,
                newsletterName: '╭••➤ɴᴊᴀʙᴜʟᴏ ᴜɪ',
                serverMessageId: 143
            },
            forwardingScore: 999,
            externalAdReply: {
                title: "ɴᴊᴀʙᴜʟᴏ ᴜɪ",
                body: externalBody,
                thumbnailUrl: config.FANAIMG,
                sourceUrl: config.NJABULOURL,
                mediaType: 1,
                renderSmallThumbnail: true
            }
        }
    }, { quoted: {
        key: {
            fromMe: false,
            participant: `0@s.whatsapp.net`,
            remoteJid: "status@broadcast"
        },
        message: {
            contactMessage: {
                displayName: userName,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${userName};USER;;;\nFN:${userName}\nitem1.TEL;waid=${sender?.split('@')[0] || '0'}:${sender?.split('@')[0] || '0'}\nitem1.X-ABLabel:User\nEND:VCARD`
            }
        }
    } });
}

// ADMIN EVENTS
fana({
    name: "admin-events",
    alias: ["adminevents"],
    desc: "Enable or disable admin event notifications",
    category: "settings",
    fromMe: true,
    filename: __filename
}, async (conn, mek, args, { from, sender, isOwner, reply }) => {
    if (!isOwner) return;
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.ADMIN_EVENTS = "true";
        await sendFormattedMessage(conn, from, "✅ Admin event notifications are now enabled.", sender, 'success');
    } else if (status === "off") {
        config.ADMIN_EVENTS = "false";
        await sendFormattedMessage(conn, from, "❌ Admin event notifications are now disabled.", sender, 'success');
    } else {
        await sendFormattedMessage(conn, from, "📌 *Usage:* `.admin-events on` or `.admin-events off`", sender, 'warning');
    }
});

// WELCOME
fana({
    name: "welcome",
    alias: ["welcomeset"],
    desc: "Enable or disable welcome messages for new members",
    category: "settings",
    fromMe: true,
    filename: __filename
}, async (conn, mek, args, { from, sender, isOwner, reply }) => {
    if (!isOwner) return;
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.WELCOME = "true";
        await sendFormattedMessage(conn, from, "✅ Welcome messages are now enabled.", sender, 'success');
    } else if (status === "off") {
        config.WELCOME = "false";
        await sendFormattedMessage(conn, from, "❌ Welcome messages are now disabled.", sender, 'success');
    } else {
        await sendFormattedMessage(conn, from, "📌 *Usage:* `.welcome on` or `.welcome off`", sender, 'warning');
    }
});

// SET PREFIX
fana({
    name: "setprefix",
    alias: ["prefix"],
    desc: "Change the bot's command prefix.",
    category: "settings",
    fromMe: true,
    filename: __filename
}, async (conn, mek, args, { from, sender, isOwner, reply }) => {
    if (!isOwner) return;
    await conn.sendMessage(from, { react: { text: "🔧", key: mek.key } });
    const newPrefix = args[0];
    if (!newPrefix) {
        await sendFormattedMessage(conn, from, "❌ Please provide a new prefix.\n\n📌 *Example:* `.setprefix !`", sender, 'warning');
        return;
    }
    config.PREFIX = newPrefix;
    await sendFormattedMessage(conn, from, `✅ Prefix successfully changed to *${newPrefix}*`, sender, 'success');
});

// MODE
fana({
    name: "mode",
    alias: ["setmode"],
    desc: "Set bot mode to private or public.",
    category: "settings",
    fromMe: true,
    filename: __filename
}, async (conn, mek, args, { from, sender, isOwner, reply }) => {
    if (!isOwner) return;
    await conn.sendMessage(from, { react: { text: "🫟", key: mek.key } });
    if (!args[0]) {
        await sendFormattedMessage(conn, from, `📌 Current mode: *${config.MODE}*\n\n📌 *Usage:* .mode private OR .mode public`, sender, 'info');
        return;
    }
    const modeArg = args[0].toLowerCase();
    if (modeArg === "private") {
        config.MODE = "private";
        await sendFormattedMessage(conn, from, "✅ Bot mode is now set to *PRIVATE*.", sender, 'success');
    } else if (modeArg === "public") {
        config.MODE = "public";
        await sendFormattedMessage(conn, from, "✅ Bot mode is now set to *PUBLIC*.", sender, 'success');
    } else {
        await sendFormattedMessage(conn, from, "❌ Invalid mode. Please use `.mode private` or `.mode public`.", sender, 'error');
    }
});

// AUTO TYPING
fana({
    name: "auto-typing",
    alias: ["autotyping"],
    desc: "Enable or disable auto-typing feature.",
    category: "settings",
    fromMe: true,
    filename: __filename
}, async (conn, mek, args, { from, sender, isOwner, reply }) => {
    if (!isOwner) return;
    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) {
        await sendFormattedMessage(conn, from, "📌 *Usage:* `.auto-typing on` or `.auto-typing off`", sender, 'warning');
        return;
    }
    config.AUTO_TYPING = status === "on" ? "true" : "false";
    await sendFormattedMessage(conn, from, `✅ Auto typing has been turned ${status}.`, sender, 'success');
});

// MENTION REPLY
fana({
    name: "mention-reply",
    alias: ["menetionreply", "mee"],
    desc: "Enable or disable mention reply feature.",
    category: "settings",
    fromMe: true,
    filename: __filename
}, async (conn, mek, args, { from, sender, isOwner, reply }) => {
    if (!isOwner) return;
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.MENTION_REPLY = "true";
        await sendFormattedMessage(conn, from, "✅ Mention Reply feature is now enabled.", sender, 'success');
    } else if (status === "off") {
        config.MENTION_REPLY = "false";
        await sendFormattedMessage(conn, from, "❌ Mention Reply feature is now disabled.", sender, 'success');
    } else {
        await sendFormattedMessage(conn, from, "📌 *Usage:* `.mee on` or `.mee off`", sender, 'warning');
    }
});

// ALWAYS ONLINE
fana({
    name: "always-online",
    alias: ["alwaysonline"],
    desc: "Enable or disable the always online mode",
    category: "settings",
    fromMe: true,
    filename: __filename
}, async (conn, mek, args, { from, sender, isOwner, reply }) => {
    if (!isOwner) return;
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.ALWAYS_ONLINE = "true";
        await sendFormattedMessage(conn, from, "✅ Always online mode is now enabled.", sender, 'success');
    } else if (status === "off") {
        config.ALWAYS_ONLINE = "false";
        await sendFormattedMessage(conn, from, "❌ Always online mode is now disabled.", sender, 'success');
    } else {
        await sendFormattedMessage(conn, from, "📌 *Usage:* `.always-online on` or `.always-online off`", sender, 'warning');
    }
});

// AUTO RECORDING
fana({
    name: "auto-recording",
    alias: ["autorecoding"],
    desc: "Enable or disable auto-recording feature.",
    category: "settings",
    fromMe: true,
    filename: __filename
}, async (conn, mek, args, { from, sender, isOwner, reply }) => {
    if (!isOwner) return;
    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) {
        await sendFormattedMessage(conn, from, "📌 *Usage:* `.auto-recording on` or `.auto-recording off`", sender, 'warning');
        return;
    }
    config.AUTO_RECORDING = status === "on" ? "true" : "false";
    await sendFormattedMessage(conn, from, `✅ Auto recording has been turned ${status}.`, sender, 'success');
});

// AUTO SEEN (STATUS)
fana({
    name: "auto-seen",
    alias: ["autostatusview"],
    desc: "Enable or disable auto-viewing of statuses",
    category: "settings",
    fromMe: true,
    filename: __filename
}, async (conn, mek, args, { from, sender, isOwner, reply }) => {
    if (!isOwner) return;
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.AUTO_STATUS_SEEN = "true";
        await sendFormattedMessage(conn, from, "✅ Auto-viewing of statuses is now enabled.", sender, 'success');
    } else if (status === "off") {
        config.AUTO_STATUS_SEEN = "false";
        await sendFormattedMessage(conn, from, "❌ Auto-viewing of statuses is now disabled.", sender, 'success');
    } else {
        await sendFormattedMessage(conn, from, "📌 *Usage:* `.auto-seen on` or `.auto-seen off`", sender, 'warning');
    }
});

// STATUS REACT
fana({
    name: "status-react",
    alias: ["statusreaction"],
    desc: "Enable or disable auto-reacting to statuses",
    category: "settings",
    fromMe: true,
    filename: __filename
}, async (conn, mek, args, { from, sender, isOwner, reply }) => {
    if (!isOwner) return;
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.AUTO_STATUS_REACT = "true";
        await sendFormattedMessage(conn, from, "✅ Auto-reacting to statuses is now enabled.", sender, 'success');
    } else if (status === "off") {
        config.AUTO_STATUS_REACT = "false";
        await sendFormattedMessage(conn, from, "❌ Auto-reacting to statuses is now disabled.", sender, 'success');
    } else {
        await sendFormattedMessage(conn, from, "📌 *Usage:* `.status-react on` or `.status-react off`", sender, 'warning');
    }
});

// READ MESSAGE
fana({
    name: "read-message",
    alias: ["autoread"],
    desc: "Enable or disable read message feature.",
    category: "settings",
    fromMe: true,
    filename: __filename
}, async (conn, mek, args, { from, sender, isOwner, reply }) => {
    if (!isOwner) return;
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.READ_MESSAGE = "true";
        await sendFormattedMessage(conn, from, "✅ Read message feature is now enabled.", sender, 'success');
    } else if (status === "off") {
        config.READ_MESSAGE = "false";
        await sendFormattedMessage(conn, from, "❌ Read message feature is now disabled.", sender, 'success');
    } else {
        await sendFormattedMessage(conn, from, "📌 *Usage:* `.read-message on` or `.read-message off`", sender, 'warning');
    }
});

// AUTO VOICE
fana({
    name: "auto-voice",
    alias: ["autovoice"],
    desc: "Enable or disable auto voice feature.",
    category: "settings",
    fromMe: true,
    filename: __filename
}, async (conn, mek, args, { from, sender, isOwner, reply }) => {
    if (!isOwner) return;
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.AUTO_VOICE = "true";
        await sendFormattedMessage(conn, from, "✅ Auto voice feature is now enabled.", sender, 'success');
    } else if (status === "off") {
        config.AUTO_VOICE = "false";
        await sendFormattedMessage(conn, from, "❌ Auto voice feature is now disabled.", sender, 'success');
    } else {
        await sendFormattedMessage(conn, from, "📌 *Usage:* `.auto-voice on` or `.auto-voice off`", sender, 'warning');
    }
});

// ANTI BAD WORD
fana({
    name: "anti-bad",
    alias: ["antibadword"],
    desc: "Enable or disable anti-bad word feature.",
    category: "settings",
    fromMe: true,
    filename: __filename
}, async (conn, mek, args, { from, sender, isOwner, reply }) => {
    if (!isOwner) return;
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.ANTI_BAD_WORD = "true";
        await sendFormattedMessage(conn, from, "✅ Anti-bad word feature is now enabled.", sender, 'success');
    } else if (status === "off") {
        config.ANTI_BAD_WORD = "false";
        await sendFormattedMessage(conn, from, "❌ Anti-bad word feature is now disabled.", sender, 'success');
    } else {
        await sendFormattedMessage(conn, from, "📌 *Usage:* `.anti-bad on` or `.anti-bad off`", sender, 'warning');
    }
});

// AUTO STICKER
fana({
    name: "auto-sticker",
    alias: ["autosticker"],
    desc: "Enable or disable auto-sticker feature.",
    category: "settings",
    fromMe: true,
    filename: __filename
}, async (conn, mek, args, { from, sender, isOwner, reply }) => {
    if (!isOwner) return;
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.AUTO_STICKER = "true";
        await sendFormattedMessage(conn, from, "✅ Auto-sticker feature is now enabled.", sender, 'success');
    } else if (status === "off") {
        config.AUTO_STICKER = "false";
        await sendFormattedMessage(conn, from, "❌ Auto-sticker feature is now disabled.", sender, 'success');
    } else {
        await sendFormattedMessage(conn, from, "📌 *Usage:* `.auto-sticker on` or `.auto-sticker off`", sender, 'warning');
    }
});

// AUTO REPLY
fana({
    name: "auto-reply",
    alias: ["autoreply"],
    desc: "Enable or disable auto-reply feature.",
    category: "settings",
    fromMe: true,
    filename: __filename
}, async (conn, mek, args, { from, sender, isOwner, reply }) => {
    if (!isOwner) return;
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.AUTO_REPLY = "true";
        await sendFormattedMessage(conn, from, "✅ Auto-reply feature is now enabled.", sender, 'success');
    } else if (status === "off") {
        config.AUTO_REPLY = "false";
        await sendFormattedMessage(conn, from, "❌ Auto-reply feature is now disabled.", sender, 'success');
    } else {
        await sendFormattedMessage(conn, from, "📌 *Usage:* `.auto-reply on` or `.auto-reply off`", sender, 'warning');
    }
});

// AUTO REACT
fana({
    name: "auto-react",
    alias: ["autoreact"],
    desc: "Enable or disable the auto-react feature",
    category: "settings",
    fromMe: true,
    filename: __filename
}, async (conn, mek, args, { from, sender, isOwner, reply }) => {
    if (!isOwner) return;
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.AUTO_REACT = "true";
        await sendFormattedMessage(conn, from, "✅ Auto-react feature is now enabled.", sender, 'success');
    } else if (status === "off") {
        config.AUTO_REACT = "false";
        await sendFormattedMessage(conn, from, "❌ Auto-react feature is now disabled.", sender, 'success');
    } else {
        await sendFormattedMessage(conn, from, "📌 *Usage:* `.auto-react on` or `.auto-react off`", sender, 'warning');
    }
});

// STATUS REPLY
fana({
    name: "status-reply",
    alias: ["autostatusreply"],
    desc: "Enable or disable status reply feature.",
    category: "settings",
    fromMe: true,
    filename: __filename
}, async (conn, mek, args, { from, sender, isOwner, reply }) => {
    if (!isOwner) return;
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.AUTO_STATUS_REPLY = "true";
        await sendFormattedMessage(conn, from, "✅ Status reply feature is now enabled.", sender, 'success');
    } else if (status === "off") {
        config.AUTO_STATUS_REPLY = "false";
        await sendFormattedMessage(conn, from, "❌ Status reply feature is now disabled.", sender, 'success');
    } else {
        await sendFormattedMessage(conn, from, "📌 *Usage:* `.status-reply on` or `.status-reply off`", sender, 'warning');
    }
});

// ANTI LINK
fana({
    name: "antilink",
    alias: ["antilinks"],
    desc: "Enable or disable ANTI_LINK in groups",
    category: "group",
    fromMe: false,
    filename: __filename
}, async (conn, mek, args, { from, sender, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) {
            await sendFormattedMessage(conn, from, "❌ This command can only be used in a group.", sender, 'error');
            return;
        }
        if (!isBotAdmins) {
            await sendFormattedMessage(conn, from, "❌ Bot must be an admin to use this command.", sender, 'error');
            return;
        }
        if (!isAdmins) {
            await sendFormattedMessage(conn, from, "❌ You must be an admin to use this command.", sender, 'error');
            return;
        }
        await conn.sendMessage(from, { react: { text: "🚫", key: mek.key } });
        if (args[0] === "on") {
            config.ANTI_LINK = "true";
            await sendFormattedMessage(conn, from, "✅ ANTI_LINK has been enabled.", sender, 'success');
        } else if (args[0] === "off") {
            config.ANTI_LINK = "false";
            await sendFormattedMessage(conn, from, "❌ ANTI_LINK has been disabled.", sender, 'success');
        } else {
            await sendFormattedMessage(conn, from, "📌 *Usage:* `.antilink on` or `.antilink off`", sender, 'warning');
        }
    } catch (e) {
        await sendFormattedMessage(conn, from, `❌ Error: ${e.message}`, sender, 'error');
    }
});

// ANTI LINK KICK
fana({
    name: "antilinkkick",
    alias: ["kicklink"],
    desc: "Enable or disable ANTI_LINK_KICK in groups",
    category: "group",
    fromMe: false,
    filename: __filename
}, async (conn, mek, args, { from, sender, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) {
            await sendFormattedMessage(conn, from, "❌ This command can only be used in a group.", sender, 'error');
            return;
        }
        if (!isBotAdmins) {
            await sendFormattedMessage(conn, from, "❌ Bot must be an admin to use this command.", sender, 'error');
            return;
        }
        if (!isAdmins) {
            await sendFormattedMessage(conn, from, "❌ You must be an admin to use this command.", sender, 'error');
            return;
        }
        await conn.sendMessage(from, { react: { text: "⚠️", key: mek.key } });
        if (args[0] === "on") {
            config.ANTI_LINK_KICK = "true";
            await sendFormattedMessage(conn, from, "✅ ANTI_LINK_KICK has been enabled.", sender, 'success');
        } else if (args[0] === "off") {
            config.ANTI_LINK_KICK = "false";
            await sendFormattedMessage(conn, from, "❌ ANTI_LINK_KICK has been disabled.", sender, 'success');
        } else {
            await sendFormattedMessage(conn, from, "📌 *Usage:* `.antilinkkick on` or `.antilinkkick off`", sender, 'warning');
        }
    } catch (e) {
        await sendFormattedMessage(conn, from, `❌ Error: ${e.message}`, sender, 'error');
    }
});

// DELETE LINK
fana({
    name: "deletelink",
    alias: ["linksdelete"],
    desc: "Enable or disable DELETE_LINKS in groups",
    category: "group",
    fromMe: false,
    filename: __filename
}, async (conn, mek, args, { from, sender, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) {
            await sendFormattedMessage(conn, from, "❌ This command can only be used in a group.", sender, 'error');
            return;
        }
        if (!isBotAdmins) {
            await sendFormattedMessage(conn, from, "❌ Bot must be an admin to use this command.", sender, 'error');
            return;
        }
        if (!isAdmins) {
            await sendFormattedMessage(conn, from, "❌ You must be an admin to use this command.", sender, 'error');
            return;
        }
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        if (args[0] === "on") {
            config.DELETE_LINKS = "true";
            await sendFormattedMessage(conn, from, "✅ DELETE_LINKS is now enabled.", sender, 'success');
        } else if (args[0] === "off") {
            config.DELETE_LINKS = "false";
            await sendFormattedMessage(conn, from, "❌ DELETE_LINKS is now disabled.", sender, 'success');
        } else {
            await sendFormattedMessage(conn, from, "📌 *Usage:* `.deletelink on` or `.deletelink off`", sender, 'warning');
        }
    } catch (e) {
        await sendFormattedMessage(conn, from, `❌ Error: ${e.message}`, sender, 'error');
    }
});
