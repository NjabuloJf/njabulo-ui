const { cmd, commands } = require('../command');
const fs = require('fs');
const path = require('path');
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
                    body: externalBody || "Command Source Viewer",
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
    pattern: "get",
    alias: ["source", "js", "getcode"],
    desc: "Fetch the full source code of a command",
    category: "owner",
    react: "📜",
    filename: __filename
},
async (conn, mek, m, { from, args, reply, isOwner, sender, pushname }) => {
    try {
        if (!isOwner) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *You don't have permission to use this command!*\n\nOnly the bot owner can access source code.", 
                sender, 
                pushname,
                "Access Denied",
                "Owner only command"
            );
            return;
        }

        if (!args[0]) {
            await sendFormattedMessage(
                conn, 
                from, 
                "📜 *Please provide a command name*\n\n📌 *Usage:* .get alive\n🔍 *Example:* .get ping\n\n_Fetches the full source code of any command._", 
                sender, 
                pushname,
                "Command Source - Error",
                "No command name"
            );
            return;
        }

        const commandName = args[0].toLowerCase();
        const commandData = commands.find(cmd => cmd.pattern === commandName || (cmd.alias && cmd.alias.includes(commandName)));

        if (!commandData) {
            await sendFormattedMessage(
                conn, 
                from, 
                `❌ *Command not found!*\n\nNo command named "${commandName}" exists.\n\n📌 *Available commands:* Use .menu to see all commands.`, 
                sender, 
                pushname,
                "Command Source - Error",
                "Command not found"
            );
            return;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `📜 *Fetching source code...*\n\n🔍 *Command:* ${commandName}\n⏳ Please wait!`, 
            sender, 
            pushname,
            "Command Source",
            "Reading file..."
        );

        // Get the command file path
        const commandPath = commandData.filename;

        // Read the full source code
        const fullCode = fs.readFileSync(commandPath, 'utf-8');

        // Truncate long messages for WhatsApp
        let truncatedCode = fullCode;
        let codeTruncated = false;
        
        if (truncatedCode.length > 3500) {
            truncatedCode = fullCode.substring(0, 3500) + "\n\n// Code too long, sending full file 📂";
            codeTruncated = true;
        }

        // Formatted message with code
        const formattedMessage = `📜 *COMMAND SOURCE CODE* 📜

🔍 *Command:* ${commandName}
📁 *File:* ${path.basename(commandPath)}
📏 *Size:* ${(fullCode.length / 1024).toFixed(2)} KB
${codeTruncated ? "⚠️ *Preview truncated* (full file attached below)" : "✅ *Full code shown*"}

━━━━━━━━━━━━━━━━
\`\`\`javascript
${truncatedCode}
\`\`\`
━━━━━━━━━━━━━━━━`;

        await sendFormattedMessage(
            conn, 
            from, 
            formattedMessage, 
            sender, 
            pushname,
            "Command Source Viewer",
            `Source: ${commandName}`
        );

        // Send full source file
        const fileName = `${commandName}.js`;
        const tempPath = path.join(__dirname, fileName);
        fs.writeFileSync(tempPath, fullCode);

        await conn.sendMessage(from, { 
            document: fs.readFileSync(tempPath),
            mimetype: 'text/javascript',
            fileName: fileName,
            caption: `📜 Source code for: ${commandName}`
        }, { quoted: mek });

        // Delete the temporary file
        fs.unlinkSync(tempPath);

        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *Source code sent successfully!*\n\n📜 *Command:* ${commandName}\n📁 *File attached above*`, 
            sender, 
            pushname,
            "Command Source - Complete",
            "File delivered"
        );

    } catch (e) {
        console.error("Error in .get command:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error fetching source code*\n\n${e.message}\n\nPlease try again later.`, 
            sender, 
            pushname,
            "Command Source - Error",
            "Failed to read file"
        );
    }
});
