const { cmd } = require("../command");
const { fetchGif, gifToVideo } = require("../lib/fetchGif");
const axios = require("axios");
const config = require("../config");

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
                    body: externalBody || "Reaction GIFs",
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

// Generic function to handle reaction commands
async function sendReaction(conn, mek, m, action, emoji, reply, sender, pushname) {
    try {
        let senderName = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message;
        if (mentionedUser) {
            let target = `@${mentionedUser.split("@")[0]}`;
            message = `${senderName} ${action} ${target}`;
        } else if (isGroup) {
            message = `${senderName} ${action} everyone!`;
        } else {
            message = `✨ ${action.charAt(0).toUpperCase() + action.slice(1)} reaction!`;
        }

        const apiUrl = `https://api.waifu.pics/sfw/${action}`;
        let res = await axios.get(apiUrl);
        let gifUrl = res.data.url;

        let gifBuffer = await fetchGif(gifUrl);
        let videoBuffer = await gifToVideo(gifBuffer);

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error(`❌ Error in .${action} command:`, error);
        await sendFormattedMessage(
            conn, 
            mek.chat, 
            `❌ *Error in .${action} command:*\n${error.message}`, 
            sender, 
            pushname,
            "Reaction GIF - Error",
            "Command failed"
        );
    }
}

// List of all reaction commands
const reactions = [
    { pattern: "cry", emoji: "😢", action: "cried over" },
    { pattern: "cuddle", emoji: "🤗", action: "cuddled" },
    { pattern: "bully", emoji: "😈", action: "bullied" },
    { pattern: "hug", emoji: "🤗", action: "hugged" },
    { pattern: "awoo", emoji: "🐺", action: "awooed at" },
    { pattern: "lick", emoji: "👅", action: "licked" },
    { pattern: "pat", emoji: "🫂", action: "patted" },
    { pattern: "smug", emoji: "😏", action: "smugged at" },
    { pattern: "bonk", emoji: "🔨", action: "bonked" },
    { pattern: "yeet", emoji: "💨", action: "yeeted" },
    { pattern: "blush", emoji: "😊", action: "blushed at" },
    { pattern: "handhold", emoji: "🤝", action: "held hands with" },
    { pattern: "highfive", emoji: "✋", action: "high-fived" },
    { pattern: "nom", emoji: "🍽️", action: "nommed" },
    { pattern: "wave", emoji: "👋", action: "waved at" },
    { pattern: "smile", emoji: "😁", action: "smiled at" },
    { pattern: "wink", emoji: "😉", action: "winked at" },
    { pattern: "happy", emoji: "😊", action: "is happy with" },
    { pattern: "glomp", emoji: "🤗", action: "glomped" },
    { pattern: "bite", emoji: "🦷", action: "bit" },
    { pattern: "poke", emoji: "👉", action: "poked" },
    { pattern: "cringe", emoji: "😬", action: "thinks is cringe" },
    { pattern: "dance", emoji: "💃", action: "danced with" },
    { pattern: "kill", emoji: "🔪", action: "killed" },
    { pattern: "slap", emoji: "✊", action: "slapped" },
    { pattern: "kiss", emoji: "💋", action: "kissed" }
];

// Register all reaction commands
for (const reaction of reactions) {
    cmd({
        pattern: reaction.pattern,
        alias: [],
        desc: `Send a ${reaction.pattern} reaction GIF.`,
        category: "fun",
        react: reaction.emoji,
        filename: __filename,
        use: "@tag (optional)",
    }, async (conn, mek, m, { args, q, reply, sender, pushname }) => {
        await sendReaction(conn, mek, m, reaction.action, reaction.emoji, reply, sender, pushname);
    });
                        }
