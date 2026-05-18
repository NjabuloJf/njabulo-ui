const { fana } = require('../njabulo');
const config = require("../config");

// Helper function to send formatted messages
async function sendFormattedMessage(conn, from, text, sender, type = 'error') {
    const userName = sender?.split('@')[0] || "User";
    const bodyText = type === 'success' ? '✅ Success' : type === 'warning' ? '⚠️ Warning' : '❌ Error';
    const externalBody = type === 'success' ? '📤 Message Retrieved' : type === 'warning' ? '📢 Notice' : '🚫 Operation Failed';
    
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
    name: "vv2",
    alias: ["wah", "ohh", "oho", "🙂", "nice", "ok"],
    desc: "Owner Only - retrieve quoted message back to user",
    category: "owner",
    fromMe: true,  // Owner only command
    filename: __filename
}, async (conn, mek, args, { from, sender, isOwner, reply, m }) => {
    try {
        // Check if owner
        if (!isOwner) {
            return; // Simply return without any response if not owner
        }

        // Check if replying to a message
        if (!mek.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            const warningText = "🍁 *Please reply to a view once message!*\n\n📌 *Usage:* Reply to any view once image, video, or audio with `.vv2`";
            await sendFormattedMessage(conn, from, warningText, sender, 'warning');
            return;
        }

        const quotedMsg = mek.message.extendedTextMessage.contextInfo.quotedMessage;
        const quotedMedia = quotedMsg.imageMessage || quotedMsg.videoMessage || quotedMsg.audioMessage;
        
        if (!quotedMedia) {
            const errorText = "❌ *Unsupported Media Type*\n\n📝 Only image, video, and audio view once messages are supported.";
            await sendFormattedMessage(conn, from, errorText, sender, 'error');
            return;
        }

        // Determine message type
        let mtype = '';
        let messageContent = {};
        
        if (quotedMsg.imageMessage) {
            mtype = 'imageMessage';
            const buffer = await conn.downloadMediaMessage(quotedMsg.imageMessage);
            messageContent = {
                image: buffer,
                caption: quotedMsg.imageMessage.caption || '',
                mimetype: quotedMsg.imageMessage.mimetype || "image/jpeg"
            };
        } 
        else if (quotedMsg.videoMessage) {
            mtype = 'videoMessage';
            const buffer = await conn.downloadMediaMessage(quotedMsg.videoMessage);
            messageContent = {
                video: buffer,
                caption: quotedMsg.videoMessage.caption || '',
                mimetype: quotedMsg.videoMessage.mimetype || "video/mp4"
            };
        }
        else if (quotedMsg.audioMessage) {
            mtype = 'audioMessage';
            const buffer = await conn.downloadMediaMessage(quotedMsg.audioMessage);
            messageContent = {
                audio: buffer,
                mimetype: "audio/mp4",
                ptt: quotedMsg.audioMessage.ptt || false
            };
        }

        // Send success notification in group
        const successText = "✅ *View Once Message Retrieved!*\n\n📤 Forwarding to your private message...";
        await sendFormattedMessage(conn, from, successText, sender, 'success');
        
        // Forward to user's DM
        await conn.sendMessage(sender, messageContent);
        
        // Add reaction
        await conn.sendMessage(from, { react: { text: "📤", key: mek.key } });
        
    } catch (error) {
        console.error("VV Error:", error);
        const errorText = `❌ *Error fetching view once message*\n\n📡 *Error Details:* ${error.message}\n\n🔄 Please try again with a valid view once message.`;
        await sendFormattedMessage(conn, from, errorText, sender, 'error');
    }
}); 
