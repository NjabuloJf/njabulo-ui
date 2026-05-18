const config = require('../config')
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('../lib/functions')

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
                    body: externalBody || "Group Joiner",
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
    pattern: "join",
    react: "📬",
    alias: ["joinme", "f_join", "joinlink"],
    desc: "To Join a Group from Invite link",
    category: "group",
    use: '.join < Group Link >',
    filename: __filename
}, async (conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator, isDev, isAdmins, reply }) => {
    try {
        // Only allow the creator to use the command
        if (!isCreator) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *You don't have permission to use this command.*\n\nOnly the bot owner can use this command.", 
                sender, 
                pushname,
                "Group Joiner - Access Denied",
                "Owner only command"
            );
            return;
        }

        // If there's no input, check if the message is a reply with a link
        if (!q && !quoted) {
            await sendFormattedMessage(
                conn, 
                from, 
                "📬 *Please provide a group invite link*\n\n📌 *Usage:* .join https://chat.whatsapp.com/xxxxx\n🔍 *Example:* .join https://chat.whatsapp.com/AbCdEfGhIjKl\n\n_Or reply to a message containing the invite link_", 
                sender, 
                pushname,
                "Group Joiner - Error",
                "No link provided"
            );
            return;
        }

        let groupLink;

        // If the message is a reply to a group invite link
        if (quoted && quoted.type === 'conversation' && isUrl(quoted.text)) {
            groupLink = quoted.text.split('https://chat.whatsapp.com/')[1];
            if (!groupLink && quoted.text.includes('whatsapp.com')) {
                groupLink = quoted.text.split('whatsapp.com/')[1];
            }
        } else if (q && (q.includes('https://chat.whatsapp.com/') || q.includes('whatsapp.com'))) {
            // If the user provided the link in the command
            if (q.includes('https://chat.whatsapp.com/')) {
                groupLink = q.split('https://chat.whatsapp.com/')[1];
            } else if (q.includes('whatsapp.com')) {
                groupLink = q.split('whatsapp.com/')[1];
            } else {
                groupLink = q;
            }
        }

        if (!groupLink || groupLink.length < 10) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Invalid Group Link*\n\nPlease provide a valid WhatsApp group invite link.\n\n📌 *Valid format:* https://chat.whatsapp.com/xxxxx", 
                sender, 
                pushname,
                "Group Joiner - Error",
                "Invalid link"
            );
            return;
        }

        // Clean the link
        groupLink = groupLink.replace(/\/$/, '').trim();

        await sendFormattedMessage(
            conn, 
            from, 
            `📬 *Joining group...*\n\n🔗 *Link:* chat.whatsapp.com/${groupLink}\n⏳ Please wait!`, 
            sender, 
            pushname,
            "Group Joiner",
            "Joining group"
        );

        // Accept the group invite
        await conn.groupAcceptInvite(groupLink);
        
        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *Successfully Joined!*\n\n📬 Bot has successfully joined the group.\n\n🔗 *Link:* chat.whatsapp.com/${groupLink}`, 
            sender, 
            pushname,
            "Group Joiner - Success",
            "Group joined"
        );

    } catch (e) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        console.log(e);
        
        let errorMessage = "❌ *Error Occurred!*\n\n";
        if (e.message && e.message.includes('expired')) {
            errorMessage += "⚠️ *The invite link has expired!*\n\nPlease use a valid and active group link.";
        } else if (e.message && e.message.includes('already')) {
            errorMessage += "⚠️ *Bot is already in this group!*";
        } else {
            errorMessage += `${e.message || e}\n\nPlease try again with a valid invite link.`;
        }
        
        await sendFormattedMessage(
            conn, 
            from, 
            errorMessage, 
            sender, 
            pushname,
            "Group Joiner - Error",
            "Join failed"
        );
    }
});
