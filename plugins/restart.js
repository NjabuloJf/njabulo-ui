const { cmd } = require("../command");  
const { sleep } = require("../lib/functions");  
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
                    body: externalBody || "Bot Restart",
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
    pattern: "restart",  
    alias: ["reboot", "res"],
    desc: "Restart Njabulo-ui",  
    category: "owner",  
    filename: __filename  
},  
async (conn, mek, m, { from, reply, isCreator, sender, pushname }) => {  
    try {  
        if (!isCreator) {  
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Only the bot owner can use this command.*", 
                sender, 
                pushname,
                "Restart - Access Denied",
                "Owner only"
            );
            return;
        }  

        const { exec } = require("child_process");  
        
        await sendFormattedMessage(
            conn, 
            from, 
            "🔄 *Restarting bot...*\n\n⏳ Please wait! Bot will be back online shortly.", 
            sender, 
            pushname,
            "Restart",
            "Bot restarting"
        );
        
        await sleep(2000);
        exec("pm2 restart all");  
    } catch (e) {  
        console.error(e);  
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Restart error:* ${e.message}`, 
            sender, 
            pushname,
            "Restart - Error",
            "Restart failed"
        );
    }  
});
