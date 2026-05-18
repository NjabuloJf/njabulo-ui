const config = require('../config')
const { cmd, commands } = require('../command')
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
                    body: externalBody || "Group Info",
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
    pattern: "ginfo",
    react: "🥏",
    alias: ["groupinfo", "grouplist", "groupdata"],
    desc: "Get group informations.",
    category: "group",
    use: '.ginfo',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try{
const msr = (await fetchJson('https://raw.githubusercontent.com/JawadTech3/KHAN-DATA/refs/heads/main/MSG/mreply.json')).replyMsg

if (!isGroup) {
    await sendFormattedMessage(
        conn, 
        from, 
        "❌ *This command can only be used in groups.*", 
        sender, 
        pushname,
        "Group Info - Error",
        "Not a group"
    );
    return;
}

if (!isAdmins && !isDev) {
    await sendFormattedMessage(
        conn, 
        from, 
        "❌ *Only group admins can use this command.*", 
        sender, 
        pushname,
        "Group Info - Access Denied",
        "Admin only command"
    );
    return;
}

if (!isBotAdmins) {
    await sendFormattedMessage(
        conn, 
        from, 
        "❌ *I need to be an admin to view group info.*\n\nPlease make me an admin first.", 
        sender, 
        pushname,
        "Group Info - Error",
        "Bot not admin"
    );
    return;
}

const ppUrls = [
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
];

let ppUrl = await conn.profilePictureUrl(from, 'image').catch(() => null);
if (!ppUrl) { 
    ppUrl = ppUrls[Math.floor(Math.random() * ppUrls.length)];
}

const metadata = await conn.groupMetadata(from);
const participants = metadata.participants || [];
const groupAdmins = participants.filter(p => p.admin);
const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n');
const owner = metadata.owner || "Unknown";

const groupSize = participants.length;
const adminCount = groupAdmins.length;
const botIsAdmin = participants.some(p => p.id === conn.user.id && p.admin);

const gdata = `🥏 *GROUP INFORMATION* 🥏

📛 *Group Name:* ${metadata.subject}

🆔 *Group JID:* ${metadata.id}

👥 *Total Members:* ${groupSize}
👑 *Admins:* ${adminCount}
🤖 *Bot is Admin:* ${botIsAdmin ? '✅ Yes' : '❌ No'}

👤 *Group Creator:* @${owner.split('@')[0]}

📝 *Description:*
${metadata.desc?.toString() || 'No description set'}

👨‍💼 *Admin List:*
${listAdmin || 'No admins found'}

✅ *Group info fetched successfully!*`;

await conn.sendMessage(from, {
    image: { url: ppUrl },
    caption: gdata,
    mentions: [owner, ...groupAdmins.map(a => a.id)].filter(Boolean)
}, { quoted: mek });

await sendFormattedMessage(
    conn, 
    from, 
    `✅ *Group information retrieved successfully!*`, 
    sender, 
    pushname,
    "Group Info",
    `${groupSize} members, ${adminCount} admins`
);

} catch (e) {
    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    console.log(e);
    await sendFormattedMessage(
        conn, 
        from, 
        `❌ *Error Occurred!*\n\n${e.message || e}\n\nPlease try again later.`, 
        sender, 
        pushname,
        "Group Info - Error",
        "Request failed"
    );
}
});
