const config = require('../config')
const l = console.log
const { cmd, commands } = require('../command')
const dl = require('@bochilteam/scraper')  
const ytdl = require('yt-search');
const fs = require('fs-extra')
var videotime = 60000 // 1000 min
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')

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
                    body: externalBody || "YouTube Search",
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
    pattern: "yts",
    alias: ["ytsearch", "youtube", "searchyt"],
    use: '.yts jawad',
    react: "🔎",
    desc: "Search and get details from youtube.",
    category: "search",
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, umarmd, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!q) {
    await sendFormattedMessage(
        conn, 
        from, 
        "🔎 *Please provide words to search*\n\n📌 *Usage:* .yts Shape of You\n🔍 *Example:* .yts Ed Sheeran", 
        sender, 
        pushname,
        "YouTube Search - Error",
        "No query"
    );
    return;
}

await sendFormattedMessage(
    conn, 
    from, 
    `🔎 *Searching YouTube for:* "${q}"\n\n⏳ Please wait!`, 
    sender, 
    pushname,
    "YouTube Search",
    "Searching"
);

try {
    let yts = require("yt-search")
    var arama = await yts(q);
} catch(e) {
    l(e)
    await sendFormattedMessage(
        conn, 
        from, 
        "❌ *Error searching YouTube*\n\nPlease try again later.", 
        sender, 
        pushname,
        "YouTube Search - Error",
        "Search failed"
    );
    return;
}

if (!arama.all || arama.all.length === 0) {
    await sendFormattedMessage(
        conn, 
        from, 
        `❌ *No results found for:* "${q}"\n\nPlease try a different search term.`, 
        sender, 
        pushname,
        "YouTube Search - Error",
        "No results"
    );
    return;
}

// Limit to first 10 results to avoid message too long
const results = arama.all.slice(0, 10);

let mesaj = `🔎 *YOUTUBE SEARCH RESULTS* 🔎

📝 *Query:* ${q}
📊 *Results found:* ${arama.all.length}
📌 *Showing top ${results.length} results*

━━━━━━━━━━━━━━━━\n`;

results.forEach((video, index) => {
    mesaj += `\n${index + 1}. 🎥 *${video.title}*\n`
    mesaj += `   ⏳ *Duration:* ${video.timestamp || "Unknown"}\n`
    mesaj += `   👤 *Author:* ${video.author?.name || "Unknown"}\n`
    mesaj += `   👀 *Views:* ${video.views || "Unknown"}\n`
    mesaj += `   🔗 *Link:* ${video.url}\n\n`;
});

mesaj += `━━━━━━━━━━━━━━━━\n✅ *Search completed!*`;

await sendFormattedMessage(
    conn, 
    from, 
    mesaj, 
    sender, 
    pushname,
    "YouTube Search Results",
    `${results.length} results found`
);

} catch (e) {
    l(e)
    await sendFormattedMessage(
        conn, 
        from, 
        "❌ *An error occurred*\n\nPlease try again later.", 
        sender, 
        pushname,
        "YouTube Search - Error",
        "Request failed"
    );
}
});
