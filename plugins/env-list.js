const config = require('../config');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

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
                    body: externalBody || "Bot Settings",
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

function isEnabled(value) {
    return value && value.toString().toLowerCase() === "true";
}

// Store temporary user selections
const userSelections = {};

// Function to update config value
async function updateConfig(settingName, value) {
    const configPath = path.join(__dirname, '../config.js');
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Update the specific setting
    const regex = new RegExp(`(${settingName}:\\s*)(true|false)`, 'i');
    configContent = configContent.replace(regex, `$1${value}`);
    
    fs.writeFileSync(configPath, configContent, 'utf8');
    
    // Update runtime config
    config[settingName] = value;
}

cmd({
    pattern: "env",
    alias: ["setting", "allvar", "settings"],
    desc: "Settings of bot with toggle options",
    category: "menu",
    react: "⚙️",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, reply, sender, pushname, isCreator }) => {
    try {
        if (!isCreator) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Only bot owner can access settings*", 
                sender, 
                pushname,
                "Access Denied",
                "Owner only command"
            );
            return;
        }

        // Define settings list with numbers
        const settingsList = [
            { num: 1, name: "AUTO_STATUS_SEEN", status: isEnabled(config.AUTO_STATUS_SEEN) },
            { num: 2, name: "AUTO_STATUS_REPLY", status: isEnabled(config.AUTO_STATUS_REPLY) },
            { num: 3, name: "AUTO_REPLY", status: isEnabled(config.AUTO_REPLY) },
            { num: 4, name: "AUTO_STICKER", status: isEnabled(config.AUTO_STICKER) },
            { num: 5, name: "AUTO_VOICE", status: isEnabled(config.AUTO_VOICE) },
            { num: 6, name: "CUSTOM_REACT", status: isEnabled(config.CUSTOM_REACT) },
            { num: 7, name: "AUTO_REACT", status: isEnabled(config.AUTO_REACT) },
            { num: 8, name: "DELETE_LINKS", status: isEnabled(config.DELETE_LINKS) },
            { num: 9, name: "ANTI_LINK", status: isEnabled(config.ANTI_LINK) },
            { num: 10, name: "ANTI_BAD", status: isEnabled(config.ANTI_BAD) },
            { num: 11, name: "AUTO_TYPING", status: isEnabled(config.AUTO_TYPING) },
            { num: 12, name: "AUTO_RECORDING", status: isEnabled(config.AUTO_RECORDING) },
            { num: 13, name: "ALWAYS_ONLINE", status: isEnabled(config.ALWAYS_ONLINE) },
            { num: 14, name: "PUBLIC_MODE", status: isEnabled(config.PUBLIC_MODE) },
            { num: 15, name: "READ_MESSAGE", status: isEnabled(config.READ_MESSAGE) }
        ];

        // Build settings menu
        let settingsMenu = `⚙️ *BOT SETTINGS* ⚙️

📌 *Reply with the number to toggle ON/OFF*

━━━━━━━━━━━━━━━━\n`;

        for (const setting of settingsList) {
            const statusEmoji = setting.status ? "✅" : "❌";
            settingsMenu += `\n${setting.num}. ${setting.name}\n   └─ Status: ${statusEmoji}\n`;
        }

        settingsMenu += `\n━━━━━━━━━━━━━━━━
💡 *Example:* Reply with "5" to toggle AUTO_VOICE

⚡ *NJABULO UI*`;

        // Send settings menu with formatted message
        await sendFormattedMessage(
            conn, 
            from, 
            settingsMenu, 
            sender, 
            pushname,
            "Bot Settings Menu",
            "Toggle settings by number"
        );

        // Store that user is in settings mode
        userSelections[sender] = { active: true };

        // Set timeout to clear selection after 30 seconds
        setTimeout(() => {
            if (userSelections[sender]) {
                delete userSelections[sender];
            }
        }, 30000);

    } catch (error) {
        console.log(error);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error:* ${error.message}`, 
            sender, 
            pushname,
            "Settings Error",
            "Something went wrong"
        );
    }
});

// Handler for user replies to toggle settings
cmd({
    on: "body"
}, async (conn, m, store, { from, body, sender, isCreator, pushname }) => {
    try {
        // Check if user is owner and in settings mode
        if (!isCreator) return;
        if (!userSelections[sender] || !userSelections[sender].active) return;

        const selection = parseInt(body.trim());
        
        // Define settings mapping
        const settingsMap = {
            1: "AUTO_STATUS_SEEN",
            2: "AUTO_STATUS_REPLY",
            3: "AUTO_REPLY",
            4: "AUTO_STICKER",
            5: "AUTO_VOICE",
            6: "CUSTOM_REACT",
            7: "AUTO_REACT",
            8: "DELETE_LINKS",
            9: "ANTI_LINK",
            10: "ANTI_BAD",
            11: "AUTO_TYPING",
            12: "AUTO_RECORDING",
            13: "ALWAYS_ONLINE",
            14: "PUBLIC_MODE",
            15: "READ_MESSAGE"
        };

        if (settingsMap[selection]) {
            const settingName = settingsMap[selection];
            const currentStatus = isEnabled(config[settingName]);
            const newStatus = !currentStatus;
            
            // Update config
            await updateConfig(settingName, newStatus);
            
            // Send confirmation with formatted message
            const statusText = newStatus ? "✅ ENABLED" : "❌ DISABLED";
            await sendFormattedMessage(
                conn, 
                from, 
                `⚙️ *Setting Updated*

📌 *Setting:* ${settingName}
🔄 *Status:* ${statusText}

✅ Successfully ${newStatus ? "enabled" : "disabled"} ${settingName}!`, 
                sender, 
                pushname,
                "Settings Updated",
                `${settingName} is now ${newStatus ? "ON" : "OFF"}`
            );
            
            // Clear user selection
            delete userSelections[sender];
        } else if (selection && !isNaN(selection) && selection >= 1 && selection <= 15) {
            await sendFormattedMessage(
                conn, 
                from, 
                `❌ *Invalid selection!*\n\nPlease reply with a number from 1 to 15.`, 
                sender, 
                pushname,
                "Invalid Input",
                "Number out of range"
            );
        }
        
    } catch (error) {
        console.error("Settings handler error:", error);
        if (userSelections[sender]) {
            delete userSelections[sender];
        }
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error:* ${error.message}`, 
            sender, 
            pushname,
            "Settings Error",
            "Failed to update setting"
        );
    }
});
