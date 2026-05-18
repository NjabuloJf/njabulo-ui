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
                    body: externalBody || "Channel Emoji Reaction System",
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

// Default emoji set (50 emojis total - you can customize these)
const DEFAULT_EMOJIS = [
    '😊', '😂', '❤️', '🔥', '🥰', '😍', '🎉', '👍', '🙏', '🤣',
    '💯', '😭', '😘', '🥺', '😎', '🤗', '😁', '💔', '😱', '🤔',
    '😅', '🥳', '👏', '😜', '🤩', '😢', '💀', '✨', '💪', '😇',
    '🤪', '😡', '👀', '💕', '😤', '🤞', '😋', '💓', '👌', '🤍',
    '💗', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤎', '💝', '💖'
];

// Function to split emojis into chunks (max 50 per reaction)
function splitEmojis(emojis, maxPerReaction = 50) {
    const chunks = [];
    for (let i = 0; i < emojis.length; i += maxPerReaction) {
        chunks.push(emojis.slice(i, i + maxPerReaction));
    }
    return chunks;
}

// Function to send multiple emoji reactions with delay
async function sendMultipleReactions(conn, channelId, messageId, reactions, delay = 1000) {
    const results = [];
    for (let i = 0; i < reactions.length; i++) {
        try {
            const reactionString = reactions[i].join('');
            await conn.newsletterReactMessage(channelId, messageId, reactionString);
            results.push({ 
                reaction: reactionString, 
                emojiCount: reactions[i].length,
                status: 'success', 
                index: i + 1 
            });
            
            if (i < reactions.length - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        } catch (err) {
            results.push({ 
                reaction: reactions[i].join('').substring(0, 20), 
                emojiCount: reactions[i].length,
                status: 'failed', 
                error: err.message, 
                index: i + 1 
            });
        }
    }
    return results;
}

cmd({
    pattern: "chrs",
    alias: ["creacts", "channelreacts", "emojireacts"],
    react: "😊",
    desc: "React to channel messages with emojis (automatically uses default emojis if none provided)",
    category: "owner",
    use: '.chr <channel-link>',
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
                `📝 *Usage:*\n\n\`${command} https://whatsapp.com/channel/1234567890/123\`\n\n*Example:*\n\`${command} https://whatsapp.com/channel/0029Vb6uo9yJ3juwi9GYgS47/204\`\n\n*Auto sends 50+ emojis to the channel message!*\n*You can also add custom emojis:* \`${command} link 😊😂❤️🔥\``, 
                sender, 
                pushname,
                "Channel Emoji Reaction - Help",
                "How to use the command"
            );
            return;
        }

        // Extract link (first part is the link)
        const link = q.split(' ')[0];
        
        // Get remaining text as custom emojis (if any)
        const customEmojiText = q.substring(link.length).trim();
        
        // Validate channel link
        if (!link || !link.includes("whatsapp.com/channel/")) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Invalid Channel Link*\n\nPlease provide a valid WhatsApp channel link.\nExample: https://whatsapp.com/channel/0029Vb6uo9yJ3juwi9GYgS47/204", 
                sender, 
                pushname,
                "Channel Reaction - Error",
                "Invalid link format"
            );
            return;
        }
        
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

        // Get channel metadata
        let channelMeta;
        try {
            channelMeta = await conn.newsletterMetadata("invite", channelId);
        } catch (err) {
            await sendFormattedMessage(
                conn, 
                from, 
                `❌ *Channel Not Found*\n\nCould not find channel with ID: ${channelId}`, 
                sender, 
                pushname,
                "Channel Reaction - Error",
                "Invalid channel"
            );
            return;
        }
        
        // Determine which emojis to use
        let emojis = [];
        let emojiSource = "";
        
        if (customEmojiText) {
            // Extract custom emojis from the provided text
            const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{FE0F}]/gu;
            emojis = customEmojiText.match(emojiRegex) || [];
            emojiSource = "custom";
            
            if (emojis.length === 0) {
                await sendFormattedMessage(
                    conn, 
                    from, 
                    "❌ *No Valid Emojis Found*\n\nUsing default emojis instead. To use custom emojis, provide valid emojis like 😊😂❤️🔥", 
                    sender, 
                    pushname,
                    "Channel Reaction - Warning",
                    "Falling back to default emojis"
                );
                emojis = [...DEFAULT_EMOJIS];
                emojiSource = "default (fallback)";
            }
        } else {
            // Use default emojis
            emojis = [...DEFAULT_EMOJIS];
            emojiSource = "default";
        }
        
        // Split emojis into chunks (max 50 per reaction)
        const emojiChunks = splitEmojis(emojis, 50);
        const totalReactions = emojiChunks.length;
        
        // Show what we're sending
        const previewEmojis = emojis.slice(0, 10).join('');
        const moreIndicator = emojis.length > 10 ? ` +${emojis.length - 10} more` : '';
        
        await sendFormattedMessage(
            conn, 
            from, 
            `⏳ *Sending Emoji Reactions* ⏳\n\n*Channel:* ${channelMeta.name || channelId}\n*Source:* ${emojiSource} emojis\n*Total Emojis:* ${emojis.length}\n*Total Reactions:* ${totalReactions}\n*Preview:* ${previewEmojis}${moreIndicator}\n\n_Please wait..._`, 
            sender, 
            pushname,
            "Processing Reactions",
            `Sending ${totalReactions} reaction${totalReactions > 1 ? 's' : ''}`
        );

        // Send all reactions
        const results = await sendMultipleReactions(conn, channelMeta.id, messageId, emojiChunks, 1000);
        
        const successCount = results.filter(r => r.status === 'success').length;
        const failedCount = results.filter(r => r.status === 'failed').length;
        
        // Create reaction preview
        const firstReactionPreview = emojiChunks[0]?.join('').substring(0, 30) || '';
        const previewMore = emojiChunks[0]?.length > 10 ? '...' : '';

        // Success message with details
        const successMessage = `😊 *EMOJI REACTIONS SENT* 😊

╭───〔 *CHANNEL REACTION* 〕───◉
│
├▢ *Channel:* ${channelMeta.name || channelId}
├▢ *Message ID:* ${messageId}
├▢ *Emoji Source:* ${emojiSource}
├▢ *Total Emojis:* ${emojis.length}
├▢ *Total Reactions:* ${totalReactions}
├▢ *Successful:* ✅ ${successCount}
${failedCount > 0 ? `├▢ *Failed:* ❌ ${failedCount}\n` : ''}
├▢ *Preview:* ${firstReactionPreview}${previewMore}
├▢ *Status:* ${failedCount === 0 ? '✅ Complete Success' : '⚠️ Partial Success'}
│
╰──────────────────◉

*Successfully sent ${successCount} reaction${successCount > 1 ? 's' : ''} to the channel message!* 🎯

${totalReactions > 1 ? '\n_Note: Reactions were sent with 1 second delay to avoid rate limiting_' : ''}`;

        await sendFormattedMessage(
            conn, 
            from, 
            successMessage, 
            sender, 
            pushname,
            "Channel Emoji Reaction System",
            `${successCount}/${totalReactions} reactions sent`
        );
        
    } catch (e) {
        console.error("Channel Emoji Reaction Error:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error Sending Reaction*\n\n${e.message || "Failed to send emoji reaction to channel message."}\n\nPlease check the link and try again.`, 
            sender, 
            pushname,
            "Channel Reaction - Error",
            "Failed to send reaction"
        );
    }
});
