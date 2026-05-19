const converter = require('../data/converter');
const stickerConverter = require('../data/sticker-converter');
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
                    body: externalBody || "Media Converter",
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
    pattern: 'convert',
    alias: ['sticker2img', 'stoimg', 'stickertoimage', 's2i'],
    desc: 'Convert stickers to images',
    category: 'media',
    react: '🖼️',
    filename: __filename
}, async (conn, mek, m, { from, sender, pushname }) => {
    if (!mek.quoted) {
        await sendFormattedMessage(
            conn, 
            from, 
            "🖼️ *Sticker Converter*\n\n📌 *Usage:* Reply to a sticker with .convert", 
            sender, 
            pushname,
            "Sticker to Image - Error",
            "No sticker"
        );
        return;
    }

    if (mek.quoted.mtype !== 'stickerMessage') {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Only sticker messages can be converted*", 
            sender, 
            pushname,
            "Sticker to Image - Error",
            "Invalid type"
        );
        return;
    }

    await sendFormattedMessage(
        conn, 
        from, 
        "🔄 *Converting sticker to image...*\n\n⏳ Please wait!", 
        sender, 
        pushname,
        "Sticker to Image",
        "Converting"
    );

    try {
        const stickerBuffer = await mek.quoted.download();
        const imageBuffer = await stickerConverter.convertStickerToImage(stickerBuffer);

        await conn.sendMessage(from, {
            image: imageBuffer,
            caption: "🖼️ *Sticker converted to image!*",
            mimetype: 'image/png'
        }, { quoted: mek });

        await sendFormattedMessage(
            conn, 
            from, 
            "✅ *Sticker converted successfully!*\n\nYour sticker has been converted to an image.", 
            sender, 
            pushname,
            "Sticker to Image - Success",
            "Image delivered"
        );

    } catch (error) {
        console.error('Conversion error:', error);
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Please try with a different sticker.*", 
            sender, 
            pushname,
            "Sticker to Image - Error",
            "Conversion failed"
        );
    }
});

cmd({
    pattern: 'tomp3',
    alias: ['toaudio'],
    desc: 'Convert media to audio',
    category: 'audio',
    react: '🎵',
    filename: __filename
}, async (conn, mek, m, { from, sender, pushname }) => {
    if (!mek.quoted) {
        await sendFormattedMessage(
            conn, 
            from, 
            "🎵 *Please reply to a video/audio message*\n\n📌 *Usage:* Reply to a video with .tomp3", 
            sender, 
            pushname,
            "Convert to Audio - Error",
            "No media"
        );
        return;
    }

    if (!['videoMessage', 'audioMessage'].includes(mek.quoted.mtype)) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Only video/audio messages can be converted*", 
            sender, 
            pushname,
            "Convert to Audio - Error",
            "Invalid type"
        );
        return;
    }

    if (mek.quoted.seconds > 300) {
        await sendFormattedMessage(
            conn, 
            from, 
            "⏱️ *Media too long*\n\nMaximum 5 minutes allowed.", 
            sender, 
            pushname,
            "Convert to Audio - Error",
            "Too long"
        );
        return;
    }

    await sendFormattedMessage(
        conn, 
        from, 
        "🔄 *Converting to audio...*\n\n⏳ Please wait!", 
        sender, 
        pushname,
        "Convert to Audio",
        "Converting"
    );

    try {
        const buffer = await mek.quoted.download();
        const ext = mek.quoted.mtype === 'videoMessage' ? 'mp4' : 'm4a';
        const audio = await converter.toAudio(buffer, ext);

        await conn.sendMessage(from, {
            audio: audio,
            mimetype: 'audio/mpeg'
        }, { quoted: mek });

        await sendFormattedMessage(
            conn, 
            from, 
            "✅ *Audio converted successfully!*\n\nYour media has been converted to MP3.", 
            sender, 
            pushname,
            "Convert to Audio - Success",
            "Audio delivered"
        );

    } catch (e) {
        console.error('Conversion error:', e.message);
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Failed to process audio*\n\nPlease try again later.", 
            sender, 
            pushname,
            "Convert to Audio - Error",
            "Conversion failed"
        );
    }
});

cmd({
    pattern: 'toptt',
    alias: ['tovoice'],
    desc: 'Convert media to voice message',
    category: 'audio',
    react: '🎙️',
    filename: __filename
}, async (conn, mek, m, { from, sender, pushname }) => {
    if (!mek.quoted) {
        await sendFormattedMessage(
            conn, 
            from, 
            "🎙️ *Please reply to a video/audio message*\n\n📌 *Usage:* Reply to a video with .toptt", 
            sender, 
            pushname,
            "Convert to Voice - Error",
            "No media"
        );
        return;
    }

    if (!['videoMessage', 'audioMessage'].includes(mek.quoted.mtype)) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Only video/audio messages can be converted*", 
            sender, 
            pushname,
            "Convert to Voice - Error",
            "Invalid type"
        );
        return;
    }

    if (mek.quoted.seconds > 60) {
        await sendFormattedMessage(
            conn, 
            from, 
            "⏱️ *Media too long for voice*\n\nMaximum 1 minute allowed.", 
            sender, 
            pushname,
            "Convert to Voice - Error",
            "Too long"
        );
        return;
    }

    await sendFormattedMessage(
        conn, 
        from, 
        "🔄 *Converting to voice message...*\n\n⏳ Please wait!", 
        sender, 
        pushname,
        "Convert to Voice",
        "Converting"
    );

    try {
        const buffer = await mek.quoted.download();
        const ext = mek.quoted.mtype === 'videoMessage' ? 'mp4' : 'm4a';
        const ptt = await converter.toPTT(buffer, ext);

        await conn.sendMessage(from, {
            audio: ptt,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
        }, { quoted: mek });

        await sendFormattedMessage(
            conn, 
            from, 
            "✅ *Voice message created successfully!*\n\nYour media has been converted to voice.", 
            sender, 
            pushname,
            "Convert to Voice - Success",
            "Voice delivered"
        );

    } catch (e) {
        console.error('PTT conversion error:', e.message);
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Failed to create voice message*\n\nPlease try again later.", 
            sender, 
            pushname,
            "Convert to Voice - Error",
            "Conversion failed"
        );
    }
});
