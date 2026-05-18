const config = require('../config');
const { cmd } = require('../command');

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
                    body: externalBody || "Channel Reaction System",
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

const stylizedChars = {
    a: '🅐', b: '🅑', c: '🅒', d: '🅓', e: '🅔', f: '🅕', g: '🅖',
    h: '🅗', i: '🅘', j: '🅙', k: '🅚', l: '🅛', m: '🅜', n: '🅝',
    o: '🅞', p: '🅟', q: '🅠', r: '🅡', s: '🅢', t: '🅣', u: '🅤',
    v: '🅥', w: '🅦', x: '🅧', y: '🅨', z: '🅩',
    '0': '⓿', '1': '➊', '2': '➋', '3': '➌', '4': '➍',
    '5': '➎', '6': '➏', '7': '➐', '8': '➑', '9': '➒'
};

cmd({
    pattern: "chr",
    alias: ["creact", "channelreact"],
    react: "🔤",
    desc: "React to channel messages with stylized text",
    category: "owner",
    use: '.chr <channel-link> <text>',
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        // Owner only check
        if (!isCreator) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Owner Only Command*\n\nThis command can only be used by the bot owner.", 
                sender, 
                pushname,
                "Access Denied",
                "Owner only command"
            );
            return;
        }

        // Check if query exists
        if (!q) {
            await sendFormattedMessage(
                conn, 
                from, 
                `📝 *Usage:*\n\n\`${command} https://whatsapp.com/channel/1234567890/123 hello world\`\n\n*Example:*\n\`${command} https://whatsapp.com/channel/1234567890/456 criss\`\n\n*Converted text will be sent as a reaction to the channel message.*`, 
                sender, 
                pushname,
                "Channel Reaction - Help",
                "How to use the command"
            );
            return;
        }

        const [link, ...textParts] = q.split(' ');
        
        // Validate channel link
        if (!link || !link.includes("whatsapp.com/channel/")) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Invalid Channel Link*\n\nPlease provide a valid WhatsApp channel link.\nExample: https://whatsapp.com/channel/1234567890/123", 
                sender, 
                pushname,
                "Channel Reaction - Error",
                "Invalid link format"
            );
            return;
        }
        
        const inputText = textParts.join(' ').toLowerCase();
        
        // Check if text is provided
        if (!inputText) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *No Text Provided*\n\nPlease provide text to convert into stylized reaction.\n\nExample: `.chr https://whatsapp.com/channel/1234567890/456 hello`", 
                sender, 
                pushname,
                "Channel Reaction - Error",
                "Missing text to convert"
            );
            return;
        }

        // Convert text to stylized emoji reaction
        const emoji = inputText
            .split('')
            .map(char => {
                if (char === ' ') return '―';
                return stylizedChars[char] || char;
            })
            .join('');

        // Extract channel ID and message ID from link
        const channelId = link.split('/')[4];
        const messageId = link.split('/')[5];
        
        if (!channelId || !messageId) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Invalid Link*\n\nCould not extract channel or message ID from the link.", 
                sender, 
                pushname,
                "Channel Reaction - Error",
                "Missing IDs in link"
            );
            return;
        }

        // Get channel metadata and send reaction
        const channelMeta = await conn.newsletterMetadata("invite", channelId);
        await conn.newsletterReactMessage(channelMeta.id, messageId, emoji);

        // Success message with details
        const successMessage = `🎨 *STYLIZED REACTION SENT* 🎨

╭───〔 *CHANNEL REACTION* 〕───◉
│
├▢ *Channel:* ${channelMeta.name || channelId}
├▢ *Message ID:* ${messageId}
├▢ *Original Text:* "${inputText}"
├▢ *Reaction:* ${emoji}
├▢ *Status:* ✅ Success
│
╰──────────────────◉

*Stylized reaction has been sent to the channel message!* 🔤`;

        await sendFormattedMessage(
            conn, 
            from, 
            successMessage, 
            sender, 
            pushname,
            "Channel Reaction System",
            `Reacted with: ${emoji}`
        );
        
    } catch (e) {
        console.error("Channel Reaction Error:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error Sending Reaction*\n\n${e.message || "Failed to send reaction to channel message."}\n\nPlease check the link and try again.`, 
            sender, 
            pushname,
            "Channel Reaction - Error",
            "Failed to send reaction"
        );
    }
});
