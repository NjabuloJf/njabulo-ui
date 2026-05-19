const { cmd } = require("../command");
const axios = require('axios');
const fs = require('fs');
const path = require("path");
const AdmZip = require("adm-zip");
const { setCommitHash, getCommitHash } = require('../data/updateDB');
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
                    body: externalBody || "Update System",
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
    pattern: "update",
    alias: ["upgrade", "sync", "gitpull"],
    react: '🆕',
    desc: "Update the bot to the latest version.",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { from, reply, isOwner, sender, pushname }) => {
    if (!isOwner) {
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *This command is only for the bot owner.*", 
            sender, 
            pushname,
            "Update - Access Denied",
            "Owner only"
        );
        return;
    }

    try {
        await sendFormattedMessage(
            conn, 
            from, 
            "🔍 *Checking for updates...*\n\n⏳ Please wait!", 
            sender, 
            pushname,
            "Update",
            "Checking"
        );

        // Fetch the latest commit hash from GitHub
        const { data: commitData } = await axios.get("https://api.github.com/repos/NjabuloJf/njabulo-ui/commits/main", { timeout: 15000 });
        const latestCommitHash = commitData.sha;

        // Get the stored commit hash from the database
        const currentHash = await getCommitHash();

        if (latestCommitHash === currentHash) {
            await sendFormattedMessage(
                conn, 
                from, 
                "✅ *Your bot is already up-to-date!*", 
                sender, 
                pushname,
                "Update",
                "Already latest"
            );
            return;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            "🚀 *Updating bot...*\n\n📦 Downloading latest version...", 
            sender, 
            pushname,
            "Update",
            "Downloading"
        );

        // Download the latest code
        const zipPath = path.join(__dirname, "latest.zip");
        const { data: zipData } = await axios.get("https://github.com/NjabuloJf/njabulo-ui/archive/main.zip", { 
            responseType: "arraybuffer",
            timeout: 60000 
        });
        fs.writeFileSync(zipPath, zipData);

        await sendFormattedMessage(
            conn, 
            from, 
            "📦 *Extracting the latest code...*", 
            sender, 
            pushname,
            "Update",
            "Extracting"
        );

        // Extract ZIP file
        const extractPath = path.join(__dirname, 'latest');
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(extractPath, true);

        await sendFormattedMessage(
            conn, 
            from, 
            "🔄 *Replacing files...*", 
            sender, 
            pushname,
            "Update",
            "Replacing"
        );

        // Copy updated files, preserving config.js and app.json
        const sourcePath = path.join(extractPath, "njabulo-ui-main");
        const destinationPath = path.join(__dirname, '..');
        copyFolderSync(sourcePath, destinationPath);

        // Save the latest commit hash to the database
        await setCommitHash(latestCommitHash);

        // Cleanup
        fs.unlinkSync(zipPath);
        fs.rmSync(extractPath, { recursive: true, force: true });

        await sendFormattedMessage(
            conn, 
            from, 
            "✅ *Update complete!*\n\n🔄 Restarting the bot...", 
            sender, 
            pushname,
            "Update",
            "Complete"
        );
        
        process.exit(0);
    } catch (error) {
        console.error("Update error:", error);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Update failed:* ${error.message}\n\nPlease try manually.`, 
            sender, 
            pushname,
            "Update - Error",
            "Failed"
        );
    }
});

// Helper function to copy directories while preserving config.js and app.json
function copyFolderSync(source, target) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    const items = fs.readdirSync(source);
    for (const item of items) {
        const srcPath = path.join(source, item);
        const destPath = path.join(target, item);

        // Skip config.js and app.json
        if (item === "config.js" || item === "app.json") {
            console.log(`Skipping ${item} to preserve custom settings.`);
            continue;
        }

        if (fs.lstatSync(srcPath).isDirectory()) {
            copyFolderSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
            }
