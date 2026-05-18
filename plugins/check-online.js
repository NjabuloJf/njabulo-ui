const { cmd } = require('../command');
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
                    body: externalBody || "Online Members System",
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
    pattern: "online",
    alias: ["whosonline", "onlinemembers"],
    desc: "Check who's online in the group (Admins & Owner only)",
    category: "main",
    react: "🟢",
    filename: __filename
},
async (conn, mek, m, { from, quoted, isGroup, isAdmins, isCreator, fromMe, reply, sender, pushname }) => {
    try {
        // Check if the command is used in a group
        if (!isGroup) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *This command can only be used in a group!*", 
                sender, 
                pushname,
                "Online Command - Error",
                "Not a group chat"
            );
            return;
        }

        // Check if user is either creator or admin
        if (!isCreator && !isAdmins && !fromMe) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Access Denied*\n\nOnly bot owner and group admins can use this command!", 
                sender, 
                pushname,
                "Online Command - Access Denied",
                "Admin/Owner only command"
            );
            return;
        }

        // Inform user that we're checking
        await sendFormattedMessage(
            conn, 
            from, 
            "🔄 *Scanning for online members...*\n\nThis may take 15-20 seconds.\n_Please wait..._", 
            sender, 
            pushname,
            "Online Members - Scanning",
            "Detecting online users"
        );

        const onlineMembers = new Set();
        const groupData = await conn.groupMetadata(from);
        const presencePromises = [];

        // Request presence updates for all participants
        for (const participant of groupData.participants) {
            presencePromises.push(
                conn.presenceSubscribe(participant.id)
                    .then(() => {
                        return conn.sendPresenceUpdate('composing', participant.id);
                    })
                    .catch(() => {}) // Ignore errors for individual participants
            );
        }

        await Promise.all(presencePromises);

        // Presence update handler
        const presenceHandler = (json) => {
            for (const id in json.presences) {
                const presence = json.presences[id]?.lastKnownPresence;
                if (['available', 'composing', 'recording', 'online'].includes(presence)) {
                    onlineMembers.add(id);
                }
            }
        };

        conn.ev.on('presence.update', presenceHandler);

        // Longer timeout and multiple checks
        const checks = 3;
        const checkInterval = 5000; // 5 seconds
        let checksDone = 0;

        const checkOnline = async () => {
            checksDone++;
            
            if (checksDone >= checks) {
                clearInterval(interval);
                conn.ev.off('presence.update', presenceHandler);
                
                if (onlineMembers.size === 0) {
                    await sendFormattedMessage(
                        conn, 
                        from, 
                        "⚠️ *Couldn't detect any online members*\n\nThey might be hiding their presence or offline.", 
                        sender, 
                        pushname,
                        "Online Members - No Results",
                        "No online members detected"
                    );
                    return;
                }
                
                const onlineArray = Array.from(onlineMembers);
                const onlineList = onlineArray.map((member, index) => 
                    `${index + 1}. @${member.split('@')[0]}`
                ).join('\n');
                
                const totalMembers = groupData.participants.length;
                const onlineCount = onlineArray.length;
                
                const message = `🟢 *ONLINE MEMBERS* 🟢

╭───〔 *GROUP STATUS* 〕───◉
│
├▢ *Group:* ${groupData.subject || "Unknown"}
├▢ *Total Members:* ${totalMembers}
├▢ *Online Now:* ${onlineCount}
├▢ *Status:* ${onlineCount > 0 ? '🟢 Active' : '⚫ Inactive'}
│
╰──────────────────◉

*Online Members List:*\n
${onlineList}

━━━━━━━━━━━━━━━━
_Last updated: Just now_`;

                await sendFormattedMessage(
                    conn, 
                    from, 
                    message, 
                    sender, 
                    pushname,
                    "Online Members Report",
                    `${onlineCount}/${totalMembers} members online`
                );
            }
        };

        const interval = setInterval(checkOnline, checkInterval);

        // Auto-cleanup after 30 seconds if something goes wrong
        setTimeout(() => {
            if (checksDone < checks) {
                clearInterval(interval);
                conn.ev.off('presence.update', presenceHandler);
                sendFormattedMessage(
                    conn, 
                    from, 
                    "⚠️ *Timeout*\n\nCould not complete the scan. Please try again.", 
                    sender, 
                    pushname,
                    "Online Command - Timeout",
                    "Scan timed out"
                );
            }
        }, 30000);

    } catch (e) {
        console.error("Error in online command:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error:* ${e.message}`, 
            sender, 
            pushname,
            "Online Command - Error",
            "Something went wrong"
        );
    }
});
