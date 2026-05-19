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
                    body: externalBody || "Ban System",
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

// Initialize ban.json if not exists
const banFilePath = path.join(__dirname, '../lib/ban.json');
if (!fs.existsSync(banFilePath)) {
    fs.writeFileSync(banFilePath, JSON.stringify([], null, 2));
}

cmd({
    pattern: "ban",
    alias: ["blockuser", "addban", "banuser"],
    desc: "Ban a user from using the bot",
    category: "owner",
    react: "⛔",
    filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply, sender, pushname }) => {
    try {
        if (!isCreator) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Only the bot owner can use this command!*", 
                sender, 
                pushname,
                "Ban - Access Denied",
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
                "❌ *Please provide a number or tag/reply a user.*\n\n📌 *Usage:* .ban @user OR reply to a message", 
                sender, 
                pushname,
                "Ban - Error",
                "No user"
            );
            return;
        }

        let banned = JSON.parse(fs.readFileSync(banFilePath, "utf-8"));

        if (banned.includes(target)) {
            await sendFormattedMessage(
                conn, 
                from, 
                `❌ *User @${target.split('@')[0]} is already banned.*`, 
                sender, 
                pushname,
                "Ban - Error",
                "Already banned"
            );
            return;
        }

        banned.push(target);
        fs.writeFileSync(banFilePath, JSON.stringify([...new Set(banned)], null, 2));

        await sendFormattedMessage(
            conn, 
            from, 
            `⛔ *USER BANNED* ⛔

👤 *User:* @${target.split('@')[0]}
📊 *Status:* Banned

✅ *User has been banned from using the bot.*`, 
            sender, 
            pushname,
            "Ban - Success",
            `Banned: ${target.split('@')[0]}`
        );

    } catch (err) {
        console.error(err);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error:* ${err.message}`, 
            sender, 
            pushname,
            "Ban - Error",
            "Command failed"
        );
    }
});

cmd({
    pattern: "unban",
    alias: ["removeban", "unbanuser"],
    desc: "Unban a user",
    category: "owner",
    react: "✅",
    filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply, sender, pushname }) => {
    try {
        if (!isCreator) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Only the bot owner can use this command!*", 
                sender, 
                pushname,
                "Unban - Access Denied",
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
                "❌ *Please provide a number or tag/reply a user.*\n\n📌 *Usage:* .unban @user OR reply to a message", 
                sender, 
                pushname,
                "Unban - Error",
                "No user"
            );
            return;
        }

        let banned = JSON.parse(fs.readFileSync(banFilePath, "utf-8"));

        if (!banned.includes(target)) {
            await sendFormattedMessage(
                conn, 
                from, 
                `❌ *User @${target.split('@')[0]} is not banned.*`, 
                sender, 
                pushname,
                "Unban - Error",
                "Not banned"
            );
            return;
        }

        const updated = banned.filter(u => u !== target);
        fs.writeFileSync(banFilePath, JSON.stringify(updated, null, 2));

        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *USER UNBANNED* ✅

👤 *User:* @${target.split('@')[0]}
📊 *Status:* Unbanned

✅ *User can now use the bot again.*`, 
            sender, 
            pushname,
            "Unban - Success",
            `Unbanned: ${target.split('@')[0]}`
        );

    } catch (err) {
        console.error(err);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error:* ${err.message}`, 
            sender, 
            pushname,
            "Unban - Error",
            "Command failed"
        );
    }
});

cmd({
    pattern: "listban",
    alias: ["banlist", "bannedusers", "bannedlist"],
    desc: "List all banned users",
    category: "owner",
    react: "📋",
    filename: __filename
}, async (conn, mek, m, { from, isCreator, reply, sender, pushname }) => {
    try {
        if (!isCreator) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Only the bot owner can use this command!*", 
                sender, 
                pushname,
                "List Ban - Access Denied",
                "Owner only"
            );
            return;
        }

        let banned = JSON.parse(fs.readFileSync(banFilePath, "utf-8"));
        banned = [...new Set(banned)];

        if (banned.length === 0) {
            await sendFormattedMessage(
                conn, 
                from, 
                "📋 *No banned users found.*\n\n✅ The ban list is empty.", 
                sender, 
                pushname,
                "Ban List",
                "Empty list"
            );
            return;
        }

        let msg = `📋 *BANNED USERS* 📋\n\n📊 *Total:* ${banned.length}\n\n`;
        banned.forEach((id, i) => {
            msg += `${i + 1}. @${id.split("@")[0]}\n`;
        });

        await sendFormattedMessage(
            conn, 
            from, 
            msg, 
            sender, 
            pushname,
            "Ban List",
            `${banned.length} users banned`
        );

    } catch (err) {
        console.error(err);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error:* ${err.message}`, 
            sender, 
            pushname,
            "List Ban - Error",
            "Command failed"
        );
    }
});
