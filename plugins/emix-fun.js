const { cmd } = require("../command");
const { fetchEmix } = require("../lib/emix-utils");
const { getBuffer } = require("../lib/functions");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
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
                    body: externalBody || "Emoji Mixer",
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
    pattern: "emix",
    desc: "Combine two emojis into a sticker.",
    category: "fun",
    react: "😃",
    use: ".emix 😂,🙂",
    filename: __filename,
}, async (conn, mek, m, { args, q, reply, sender, pushname }) => {
    try {
        if (!q || !q.includes(",")) {
            await sendFormattedMessage(
                conn, 
                from, 
                "🎨 *Emoji Mixer*\n\n📌 *Usage:* .emix 😂,🙂\n\n🔍 *Example:* .emix 🥰,😍\n\n_Send two emojis separated by a comma._", 
                sender, 
                pushname,
                "Emoji Mixer - Error",
                "Invalid format"
            );
            return;
        }

        let [emoji1, emoji2] = q.split(",").map(e => e.trim());

        if (!emoji1 || !emoji2) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Please provide two emojis separated by a comma*\n\n📌 *Example:* .emix 😂,🙂", 
                sender, 
                pushname,
                "Emoji Mixer - Error",
                "Missing emojis"
            );
            return;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `🎨 *Mixing emojis...*\n\n${emoji1} + ${emoji2} = ?\n\n⏳ Please wait.`, 
            sender, 
            pushname,
            "Emoji Mixer",
            "Processing..."
        );

        let imageUrl = await fetchEmix(emoji1, emoji2);

        if (!imageUrl) {
            await sendFormattedMessage(
                conn, 
                from, 
                `❌ *Could not generate emoji mix*\n\nTry different emojis.\n\n📌 *Example:* .emix 🥰,😍`, 
                sender, 
                pushname,
                "Emoji Mixer - Error",
                "Generation failed"
            );
            return;
        }

        let buffer = await getBuffer(imageUrl);
        let sticker = new Sticker(buffer, {
            pack: "NJABULO UI",
            author: "Emoji Mix",
            type: StickerTypes.FULL,
            categories: ["🤩", "🎉"],
            quality: 75,
            background: "transparent",
        });

        const stickerBuffer = await sticker.toBuffer();
        await conn.sendMessage(mek.chat, { sticker: stickerBuffer }, { quoted: mek });

        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *Sticker created successfully!*\n\n${emoji1} + ${emoji2} = 🎨\n\nEnjoy your custom emoji sticker!`, 
            sender, 
            pushname,
            "Emoji Mixer - Complete",
            "Sticker delivered"
        );

    } catch (e) {
        console.error("Error in .emix command:", e.message);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Could not generate emoji mix*\n\n⚠️ ${e.message}\n\nTry different emojis or try again later.`, 
            sender, 
            pushname,
            "Emoji Mixer - Error",
            "Request failed"
        );
    }
});
