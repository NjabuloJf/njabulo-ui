const { fana } = require('../njabulo');
const config = require("../config");

// Helper function to send formatted messages
async function sendFormattedMessage(conn, from, text, sender, type = 'error') {
    const userName = sender?.split('@')[0] || "User";
    const bodyText = type === 'success' ? '✅ Success' : type === 'warning' ? '⚠️ Warning' : '❌ Error';
    const externalBody = type === 'success' ? '📸 View Once Retrieved' : type === 'warning' ? '📢 Notice' : '🚫 Operation Failed';
    
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

// VV (View Once) Command - Owner Only
fana({
    name: "vv",
    alias: ["viewonce", "retrive"],
    desc: "Owner Only - retrieve quoted view once message",
    category: "owner",
    fromMe: true,  // Owner only command
    filename: __filename
}, async (conn, mek, args, { from, sender, isOwner, reply }) => {
    try {
        // Check if owner
        if (!isOwner) {
            const errorText = "📛 *This is an owner command.*\n\n🔒 You don't have permission to use this command.";
            await sendFormattedMessage(conn, from, errorText, sender, 'error');
            return;
        }

        // Add reaction
        await conn.sendMessage(from, { react: { text: "🐳", key: mek.key } });

        // Check if replying to a message
        if (!mek.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            const warningText = "🍁 *Please reply to a view once message!*\n\n📌 *Usage:* Reply to any view once image, video, or audio with `.vv`\n\n💡 *Aliases:* viewonce, retrive";
            await sendFormattedMessage(conn, from, warningText, sender, 'warning');
            return;
        }

        const quotedMsg = mek.message.extendedTextMessage.contextInfo.quotedMessage;
        const quotedImage = quotedMsg.imageMessage;
        const quotedVideo = quotedMsg.videoMessage;
        const quotedAudio = quotedMsg.audioMessage;
        
        if (!quotedImage && !quotedVideo && !quotedAudio) {
            const errorText = "❌ *Unsupported Media Type*\n\n📝 Only image, video, and audio view once messages are supported.\n\n🔍 Please reply to a valid view once message.";
            await sendFormattedMessage(conn, from, errorText, sender, 'error');
            return;
        }

        let messageContent = {};
        
        if (quotedImage) {
            const buffer = await conn.downloadMediaMessage(quotedImage);
            messageContent = {
                image: buffer,
                caption: quotedImage.caption || '',
                mimetype: quotedImage.mimetype || "image/jpeg"
            };
        } 
        else if (quotedVideo) {
            const buffer = await conn.downloadMediaMessage(quotedVideo);
            messageContent = {
                video: buffer,
                caption: quotedVideo.caption || '',
                mimetype: quotedVideo.mimetype || "video/mp4"
            };
        }
        else if (quotedAudio) {
            const buffer = await conn.downloadMediaMessage(quotedAudio);
            messageContent = {
                audio: buffer,
                mimetype: "audio/mp4",
                ptt: quotedAudio.ptt || false
            };
        }

        // Send success notification
        const successText = "✅ *View Once Message Retrieved!*\n\n📤 Sending the media now...";
        await sendFormattedMessage(conn, from, successText, sender, 'success');
        
        // Send the retrieved media
        await conn.sendMessage(from, messageContent, { quoted: mek });
        
        // Add success reaction
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
        
    } catch (error) {
        console.error("VV Error:", error);
        const errorText = `❌ *Error fetching view once message*\n\n📡 *Error Details:* ${error.message}\n\n🔄 Please make sure you're replying to a valid view once message and try again.`;
        await sendFormattedMessage(conn, from, errorText, sender, 'error');
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    }
}); 
