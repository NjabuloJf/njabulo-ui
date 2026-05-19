const { cmd } = require('../command');
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
                    body: externalBody || "Channel Stalker",
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
    pattern: "wstalk",
    alias: ["channelstalk", "chinfo", "whatsappchannel"],
    desc: "Get WhatsApp channel information",
    category: "utility",
    react: "🔍",
    filename: __filename
},
async (conn, mek, m, { from, reply, args, sender, pushname }) => {
    try {
        // Check if URL is provided
        if (!args || !args[0]) {
            await sendFormattedMessage(
                conn, 
                from, 
                "🔍 *Please provide a WhatsApp channel URL*\n\n📌 *Example:* .wstalk https://whatsapp.com/channel/0029Vb0HIV2G3R3s2II4181g", 
                sender, 
                pushname,
                "Channel Stalker - Error",
                "No URL"
            );
            return;
        }

        const url = args[0];
        
        // Extract channel ID from URL
        const channelId = url.match(/channel\/([0-9A-Za-z]+)/i)?.[1];
        if (!channelId) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Invalid WhatsApp channel URL*\n\nPlease provide a valid channel link.", 
                sender, 
                pushname,
                "Channel Stalker - Error",
                "Invalid URL"
            );
            return;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `🔍 *Fetching WhatsApp channel information...*\n\n⏳ Please wait!`, 
            sender, 
            pushname,
            "Channel Stalker",
            "Fetching data"
        );

        // API endpoint
        const apiUrl = `https://itzpire.com/stalk/whatsapp-channel?url=https://whatsapp.com/channel/${channelId}`;

        // Fetch channel info
        const response = await axios.get(apiUrl, { timeout: 15000 });
        const data = response.data.data;

        // Format the information
        const channelInfo = `🔍 *WHATSAPP CHANNEL INFO* 🔍

📢 *Title:* ${data.title}
👥 *Followers:* ${data.followers}
📝 *Description:*
${data.description || 'No description available'}

━━━━━━━━━━━━━━━━
✅ *Channel information fetched!*`;

        await conn.sendMessage(from, {
            image: { url: data.img },
            caption: channelInfo
        }, { quoted: mek });

        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *Channel info retrieved successfully!*\n\n📢 *${data.title}*\n👥 *Followers:* ${data.followers}`, 
            sender, 
            pushname,
            "Channel Stalker - Success",
            "Info delivered"
        );

    } catch (e) {
        console.error("Error in wstalk command:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error:* ${e.response?.data?.message || e.message}`, 
            sender, 
            pushname,
            "Channel Stalker - Error",
            "Request failed"
        );
    }
});
