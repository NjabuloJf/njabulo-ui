const config = require('../config')
const axios = require('axios');
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')
const fs = require('fs');

// Formatted message function for errors
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
                    body: externalBody || "Anime Images",
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

var imgmsg = "*Give me a anime name !*"
var descgs = "It gives details of given anime name."
var cants = "I cant find this anime."

//====================================================================================
cmd({
    pattern: "garl",
    alias: ["imgloli"],
    react: '😎',
    desc: "Download anime loli images.",
    category: "anime",
    use: '.loli',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
let res = await axios.get('https://api.lolicon.app/setu/v2?num=1&r18=0&tag=lolicon')
let wm = `😎 Random Garl image`
await conn.sendMessage(from, { image: { url: res.data.data[0].urls.original }, caption: wm}, { quoted: mek })
} catch (e) {
await sendFormattedMessage(
    conn, 
    from, 
    `❌ *Error fetching image*\n\n${cants}\n\nPlease try again later.`, 
    sender, 
    pushname,
    "Anime Image - Error",
    "Request failed"
);
console.log(e)
}
})

//=====================================================================
cmd({
    pattern: "waifu",
    alias: ["imgwaifu"],
    react: '💫',
    desc: "Download anime waifu images.",
    category: "anime",
    use: '.waifu',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
let res = await axios.get('https://api.waifu.pics/sfw/waifu')
let wm = `🩵 Random Waifu image`
await conn.sendMessage(from, { image: { url: res.data.url }, caption: wm}, { quoted: mek })
} catch (e) {
await sendFormattedMessage(
    conn, 
    from, 
    `❌ *Error fetching image*\n\n${cants}\n\nPlease try again later.`, 
    sender, 
    pushname,
    "Anime Image - Error",
    "Request failed"
);
console.log(e)
}
})

//================================================================
cmd({
    pattern: "neko",
    alias: ["imgneko"],
    react: '💫',
    desc: "Download anime neko images.",
    category: "anime",
    use: '.neko',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
let res = await axios.get('https://api.waifu.pics/sfw/neko')
let wm = `🩷 Random neko image`
await conn.sendMessage(from, { image: { url: res.data.url  }, caption: wm}, { quoted: mek })
} catch (e) {
await sendFormattedMessage(
    conn, 
    from, 
    `❌ *Error fetching image*\n\n${cants}\n\nPlease try again later.`, 
    sender, 
    pushname,
    "Anime Image - Error",
    "Request failed"
);
console.log(e)
}
})
  
//=====================================================================
cmd({
    pattern: "megumin",
    alias: ["imgmegumin"],
    react: '💕',
    desc: "Download anime megumin images.",
    category: "anime",
    use: '.megumin',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
let res = await axios.get('https://api.waifu.pics/sfw/megumin')
let wm = `❤️‍🔥 Random megumin image`
await conn.sendMessage(from, { image: { url: res.data.url }, caption: wm}, { quoted: mek })
} catch (e) {
await sendFormattedMessage(
    conn, 
    from, 
    `❌ *Error fetching image*\n\n${cants}\n\nPlease try again later.`, 
    sender, 
    pushname,
    "Anime Image - Error",
    "Request failed"
);
console.log(e)
}
})

//================================================================
cmd({
    pattern: "maid",
    alias: ["imgmaid"],
    react: '💫',
    desc: "Download anime maid images.",
    category: "anime",
    use: '.maid',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
let res = await axios.get('https://api.waifu.im/search/?included_tags=maid')
let wm = `😎 Random maid image`
await conn.sendMessage(from, { image: { url: res.data.images[0].url  }, caption: wm}, { quoted: mek })
} catch (e) {
await sendFormattedMessage(
    conn, 
    from, 
    `❌ *Error fetching image*\n\n${cants}\n\nPlease try again later.`, 
    sender, 
    pushname,
    "Anime Image - Error",
    "Request failed"
);
console.log(e)
}
})

//=====================================================================
cmd({
    pattern: "awoo",
    alias: ["imgawoo"],
    react: '😎',
    desc: "Download anime awoo images.",
    category: "anime",
    use: '.awoo',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
let res = await axios.get('https://api.waifu.pics/sfw/awoo')
let wm = `😎 Random awoo image`
await conn.sendMessage(from, { image: { url: res.data.url }, caption: wm}, { quoted: mek })
} catch (e) {
await sendFormattedMessage(
    conn, 
    from, 
    `❌ *Error fetching image*\n\n${cants}\n\nPlease try again later.`, 
    sender, 
    pushname,
    "Anime Image - Error",
    "Request failed"
);
console.log(e)
}
})

// Animegirl commands
cmd({
    pattern: "animegirl",
    alias: ["animegirl1", "animegirl2", "animegirl3", "animegirl4", "animegirl5"],
    desc: "Fetch a random anime girl image.",
    category: "fun",
    react: "🧚🏻",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        const apiUrl = `https://api.waifu.pics/sfw/waifu`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        await conn.sendMessage(from, { image: { url: data.url }, caption: '*ANIME GIRL IMAGE* 🥳' }, { quoted: mek });
    } catch (e) {
        console.log(e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error fetching anime girl image*\n\n${e.message}\n\nPlease try again later.`, 
            sender, 
            pushname,
            "Anime Girl - Error",
            "Request failed"
        );
    }
});

//==========anime=====
cmd({
    pattern: "anime",
    desc: "anime the bot",
    category: "main",
    react: "⛱️",
    filename: __filename
},
async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
let dec = `✨ Anime Images ✨`
await conn.sendMessage(from,{image:{url: `https://telegra.ph/file/b26f27aa5daaada031b90.jpg`},caption:dec},{quoted:mek});
await conn.sendMessage(from,{image:{url: `https://telegra.ph/file/51b44e4b086667361061b.jpg`},caption:dec},{quoted:mek});
await conn.sendMessage(from,{image:{url: `https://telegra.ph/file/7d165d73f914985542537.jpg`},caption:dec},{quoted:mek});
await conn.sendMessage(from,{image:{url: `https://telegra.ph/file/3d9732d2657d2d72dc102.jpg`},caption:dec},{quoted:mek});
await conn.sendMessage(from,{image:{url: `https://telegra.ph/file/8daf7e432a646f3ebe7eb.jpg`},caption:dec},{quoted:mek});
await conn.sendMessage(from,{image:{url: `https://telegra.ph/file/7514b18ea89da924e7496.jpg`},caption:dec},{quoted:mek});
await conn.sendMessage(from,{image:{url: `https://telegra.ph/file/ce9cb5acd2cec7693d76b.jpg`},caption:dec},{quoted:mek});
}catch(e){
console.log(e)
await sendFormattedMessage(
    conn, 
    from, 
    `❌ *Error*\n\n${e.message}\n\nPlease try again later.`, 
    sender, 
    pushname,
    "Anime - Error",
    "Request failed"
);
}
});

cmd({
    pattern: "anime1",
    alias: ["anime2", "anime3", "anime4", "anime5"],
    desc: "Animal image.",
    react: "🧚‍♀️",
    category: "other",
    filename: __filename
},
async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
const images = [
    'https://i.waifu.pics/aD7t0Bc.jpg',
    'https://i.waifu.pics/PQO5wPN.jpg',
    'https://i.waifu.pics/5At1P4A.jpg',
    'https://i.waifu.pics/MjtH3Ha.jpg',
    'https://i.waifu.pics/QQW7VKy.jpg',
    'https://i.waifu.pics/0r1Bn88.jpg',
    'https://i.waifu.pics/2Xdpuov.png',
    'https://i.waifu.pics/0hx-3AP.png',
    'https://i.waifu.pics/q054x0_.png',
    'https://i.waifu.pics/4lyqRvd.jpg',
    'https://i.waifu.pics/gnpc_Lr.jpeg',
    'https://i.waifu.pics/P6X-ph6.jpg',
    'https://i.waifu.pics/~p5W9~k.png',
    'https://i.waifu.pics/7Apu5C9.jpg',
    'https://i.waifu.pics/OTRfON6.jpg',
    'https://i.waifu.pics/aGgUm80.jpg',
    'https://i.waifu.pics/i~RQhRD.png',
    'https://i.waifu.pics/94LH-aU.jpg',
    'https://i.waifu.pics/V8hvqfK.jpg',
    'https://i.waifu.pics/lMiXE7j.png',
    'https://i.waifu.pics/-ABlAvr.jpg',
    'https://i.waifu.pics/HNEg0-Q.png',
    'https://i.waifu.pics/3x~ovC6.jpg',
    'https://i.waifu.pics/brv-GJu.jpg',
    'https://i.waifu.pics/FWE8ggD.png'
];
for (let img of images.slice(0, 5)) {
    await conn.sendMessage(from, {image: {url: img}, caption: '✨ Anime Image'}, {quoted: mek});
}
}catch(e){
console.log(e)
await sendFormattedMessage(
    conn, 
    from, 
    `❌ *Error*\n\n${e.message}\n\nPlease try again later.`, 
    sender, 
    pushname,
    "Anime - Error",
    "Request failed"
);
}
})

cmd({
    pattern: "dog",
    desc: "Fetch a random dog image.",
    category: "fun",
    react: "🐶",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        const apiUrl = `https://dog.ceo/api/breeds/image/random`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        await conn.sendMessage(from, { image: { url: data.message }, caption: '🐶 Random Dog Image' }, { quoted: mek });
    } catch (e) {
        console.log(e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error fetching dog image*\n\n${e.message}\n\nPlease try again later.`, 
            sender, 
            pushname,
            "Dog Image - Error",
            "Request failed"
        );
    }
});
