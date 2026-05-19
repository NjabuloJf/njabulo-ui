const fs = require("fs");
const path = require("path");
const { cmd } = require("../command");
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
                    body: externalBody || "Owner Manager",
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

const OWNER_PATH = path.join(__dirname, "../lib/sudo.json");

// Ensure the sudo.json file exists
const ensureOwnerFile = () => {
    if (!fs.existsSync(OWNER_PATH)) {
        fs.writeFileSync(OWNER_PATH, JSON.stringify([]));
    }
};
ensureOwnerFile();

// Command: Add a temporary owner
cmd({
    pattern: "setsudo",
    alias: ["addsudo", "addowner", "makeowner"],
    desc: "Add a temporary owner",
    category: "owner",
    react: "😇",
    filename: __filename
}, async (conn, mek, m, { from, args, q, isCreator, reply, sender, pushname }) => {
    try {
        if (!isCreator) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *This command can only be used by the bot owner!*", 
                sender, 
                pushname,
                "Add Owner - Access Denied",
                "Owner only"
            );
            return;
        }

        let target = m.mentionedJid?.[0] 
            || (mek.quoted?.sender ?? null)
            || (args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net");

        if (!target) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Please provide a number or tag/reply a user.*\n\n📌 *Usage:* .addsudo @user OR reply to a message", 
                sender, 
                pushname,
                "Add Owner - Error",
                "No user"
            );
            return;
        }

        let owners = JSON.parse(fs.readFileSync(OWNER_PATH, "utf-8"));

        if (owners.includes(target)) {
            await sendFormattedMessage(
                conn, 
                from, 
                `❌ *User @${target.split('@')[0]} is already a temporary owner.*`, 
                sender, 
                pushname,
                "Add Owner - Error",
                "Already owner"
            );
            return;
        }

        owners.push(target);
        const uniqueOwners = [...new Set(owners)];
        fs.writeFileSync(OWNER_PATH, JSON.stringify(uniqueOwners, null, 2));

        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *TEMPORARY OWNER ADDED* ✅

👤 *User:* @${target.split('@')[0]}
📊 *Status:* Temporary Owner

✅ *User now has owner privileges.*`, 
            sender, 
            pushname,
            "Add Owner - Success",
            `Added: ${target.split('@')[0]}`
        );

    } catch (err) {
        console.error(err);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error:* ${err.message}`, 
            sender, 
            pushname,
            "Add Owner - Error",
            "Command failed"
        );
    }
});

// Command: Remove a temporary owner
cmd({
    pattern: "delsudo",
    alias: ["delowner", "deletesudo", "removeowner"],
    desc: "Remove a temporary owner",
    category: "owner",
    react: "🫩",
    filename: __filename
}, async (conn, mek, m, { from, args, q, isCreator, reply, sender, pushname }) => {
    try {
        if (!isCreator) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *This command can only be used by the bot owner!*", 
                sender, 
                pushname,
                "Remove Owner - Access Denied",
                "Owner only"
            );
            return;
        }

        let target = m.mentionedJid?.[0] 
            || (mek.quoted?.sender ?? null)
            || (args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net");

        if (!target) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Please provide a number or tag/reply a user.*\n\n📌 *Usage:* .delowner @user OR reply to a message", 
                sender, 
                pushname,
                "Remove Owner - Error",
                "No user"
            );
            return;
        }

        let owners = JSON.parse(fs.readFileSync(OWNER_PATH, "utf-8"));

        if (!owners.includes(target)) {
            await sendFormattedMessage(
                conn, 
                from, 
                `❌ *User @${target.split('@')[0]} not found in owner list.*`, 
                sender, 
                pushname,
                "Remove Owner - Error",
                "Not an owner"
            );
            return;
        }

        const updated = owners.filter(x => x !== target);
        fs.writeFileSync(OWNER_PATH, JSON.stringify(updated, null, 2));

        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *TEMPORARY OWNER REMOVED* ✅

👤 *User:* @${target.split('@')[0]}
📊 *Status:* Removed

✅ *User no longer has owner privileges.*`, 
            sender, 
            pushname,
            "Remove Owner - Success",
            `Removed: ${target.split('@')[0]}`
        );

    } catch (err) {
        console.error(err);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error:* ${err.message}`, 
            sender, 
            pushname,
            "Remove Owner - Error",
            "Command failed"
        );
    }
});

// Command: List all temporary owners
cmd({
    pattern: "listsudo",
    alias: ["listowner", "sudoers", "ownerlist"],
    desc: "List all temporary owners",
    category: "owner",
    react: "📋",
    filename: __filename
}, async (conn, mek, m, { from, isCreator, reply, sender, pushname }) => {
    try {
        if (!isCreator) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *This command can only be used by the bot owner!*", 
                sender, 
                pushname,
                "List Owners - Access Denied",
                "Owner only"
            );
            return;
        }

        let owners = JSON.parse(fs.readFileSync(OWNER_PATH, "utf-8"));
        owners = [...new Set(owners)];

        if (owners.length === 0) {
            await sendFormattedMessage(
                conn, 
                from, 
                "📋 *No temporary owners found.*\n\n✅ The owner list is empty.", 
                sender, 
                pushname,
                "Owner List",
                "Empty list"
            );
            return;
        }

        let listMessage = `📋 *TEMPORARY OWNERS* 📋\n\n📊 *Total:* ${owners.length}\n\n`;
        owners.forEach((owner, i) => {
            listMessage += `${i + 1}. @${owner.split("@")[0]}\n`;
        });

        await sendFormattedMessage(
            conn, 
            from, 
            listMessage, 
            sender, 
            pushname,
            "Owner List",
            `${owners.length} sudo users`
        );

    } catch (err) {
        console.error(err);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error:* ${err.message}`, 
            sender, 
            pushname,
            "List Owners - Error",
            "Command failed"
        );
    }
});
