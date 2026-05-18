const { cmd, commands } = require('../command');
const axios = require('axios');
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
                    body: externalBody || "Pairing System",
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
    pattern: "pair",
    alias: ["getpair", "clonebot", "paircode"],
    react: "✅",
    desc: "Get pairing code for bot",
    category: "download",
    use: ".pair +255687068XXX",
    filename: __filename
}, async (conn, mek, m, {
    from, quoted, body, isCmd, command, args, q, isGroup,
    sender, senderNumber, botNumber2, botNumber, pushname,
    isMe, isOwner, groupMetadata, groupName, participants,
    groupAdmins, isBotAdmins, isAdmins, reply
}) => {
    try {
        const phoneNumber = q ? q.trim() : null;

        // Validate phone number format
        if (!phoneNumber || !phoneNumber.match(/^\+?\d{10,15}$/)) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Please provide a valid phone number*\n\n📌 *Format:* Include country code\n🔍 *Example:* .pair +255687068XXX\n\n📱 *Use international format with + and country code*", 
                sender, 
                pushname,
                "Pairing - Error",
                "Invalid phone number"
            );
            return;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *Requesting pairing code...*\n\n📱 *Phone:* ${phoneNumber}\n⏳ Please wait!`, 
            sender, 
            pushname,
            "Pairing System",
            "Fetching code"
        );

        // Request pairing code from backend
        const response = await axios.get(`https://session.crissvevo.co.tz/pair?phone=${encodeURIComponent(phoneNumber)}`, { timeout: 20000 });

        if (!response.data || !response.data.code) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Failed to retrieve pairing code*\n\nPlease try again later.\n\n📌 Make sure the phone number is correct and has WhatsApp installed.", 
                sender, 
                pushname,
                "Pairing - Error",
                "API request failed"
            );
            return;
        }

        const pairingCode = response.data.code;

        const message = `✅ *PAIRING SUCCESSFUL* ✅

📱 *Phone Number:* ${phoneNumber}
🔐 *Pairing Code:* \`${pairingCode}\`

📌 *Instructions:*
1. Open WhatsApp on your phone
2. Go to Settings → Linked Devices
3. Tap on "Link a Device"
4. Enter this code

⚡ *Code expires in 5 minutes!*`;

        await sendFormattedMessage(
            conn, 
            from, 
            message, 
            sender, 
            pushname,
            "Pairing Code",
            `Code: ${pairingCode}`
        );

    } catch (error) {
        console.error("Pair command error:", error);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *An error occurred*\n\n${error.message || "Failed to fetch pairing code"}\n\nPlease try again later.`, 
            sender, 
            pushname,
            "Pairing - Error",
            "Request failed"
        );
    }
});
