const { sleep } = require('../lib/functions');
const config = require('../config')
const { cmd, commands } = require('../command')

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
                    body: externalBody || "Group Manager",
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

// JawadTechX

cmd({
    pattern: "leave",
    alias: ["left", "leftgc", "leavegc", "exit"],
    desc: "Leave the group",
    react: "🎉",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, {
    from, quoted, body, isCmd, command, args, q, isGroup, senderNumber, reply, sender, pushname
}) => {
    try {

        if (!isGroup) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *This command can only be used in groups.*", 
                sender, 
                pushname,
                "Leave Group - Error",
                "Not a group"
            );
            return;
        }
        
        const botOwner = conn.user.id.split(":")[0]; 
        if (senderNumber !== botOwner) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Only the bot owner can use this command.*", 
                sender, 
                pushname,
                "Leave Group - Access Denied",
                "Owner only command"
            );
            return;
        }

        // Get group name for better message
        let groupName = "this group";
        try {
            const groupMetadata = await conn.groupMetadata(from);
            groupName = groupMetadata.subject || groupName;
        } catch (e) {
            // Ignore error, use default name
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `🎉 *Leaving group...*\n\n📛 *Group:* ${groupName}\n⏳ Please wait!`, 
            sender, 
            pushname,
            "Leave Group",
            `Leaving: ${groupName}`
        );
        
        await sleep(1500);
        await conn.groupLeave(from);
        
        // Note: This message may not be delivered since bot already left
        // But we try to send it anyway
        try {
            await sendFormattedMessage(
                conn, 
                from, 
                `👋 *Goodbye!*\n\n🎉 Bot has left ${groupName}.\n\nThank you for using NJABULO UI!`, 
                sender, 
                pushname,
                "Leave Group - Complete",
                "Group left"
            );
        } catch (e) {
            // Bot already left, message won't send - that's expected
            console.log("Bot has left the group, goodbye message not delivered");
        }
        
    } catch (e) {
        console.error(e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error leaving group*\n\n${e.message || e}\n\nPlease try again later.`, 
            sender, 
            pushname,
            "Leave Group - Error",
            "Leave failed"
        );
    }
});
