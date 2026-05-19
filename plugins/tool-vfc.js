const fs = require('fs');
const config = require('../config')
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')

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
                    body: externalBody || "Contact Saver",
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

//vcf//
cmd({
    pattern: 'savecontact',
    alias: ["vcf", "scontact", "savecontacts", "getcontacts"],
    desc: 'Save all group contacts as VCF file',
    category: 'tools',
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isGroup) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *This command is for groups only.*", 
                sender, 
                pushname,
                "Save Contacts - Error",
                "Not a group"
            );
            return;
        }
        
        if (!isOwner) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *This command is for the owner only.*", 
                sender, 
                pushname,
                "Save Contacts - Access Denied",
                "Owner only"
            );
            return;
        }

        const cmiggc = groupMetadata;
        const participants = cmiggc.participants;
        
        await sendFormattedMessage(
            conn, 
            from, 
            `📇 *Saving group contacts...*\n\n📛 *Group:* ${cmiggc.subject}\n👥 *Members:* ${participants.length}\n⏳ Please wait!`, 
            sender, 
            pushname,
            "Save Contacts",
            "Creating VCF"
        );

        let vcard = '';
        let noPort = 0;
        
        for (let a of participants) {
            vcard += `BEGIN:VCARD\nVERSION:3.0\nFN:${a.id.split("@")[0]}\nTEL;type=CELL;type=VOICE;waid=${a.id.split("@")[0]}:+${a.id.split("@")[0]}\nEND:VCARD\n`;
        }

        const nmfilect = './contacts.vcf';
        
        fs.writeFileSync(nmfilect, vcard.trim());
        await sleep(2000);

        await conn.sendMessage(from, {
            document: fs.readFileSync(nmfilect), 
            mimetype: 'text/vcard', 
            fileName: `${cmiggc.subject}.vcf`, 
            caption: `📇 *CONTACTS SAVED*

📛 *Group Name:* ${cmiggc.subject}
👥 *Total Contacts:* ${participants.length}

✅ *VCF file attached above*`
        }, { quoted: mek });

        fs.unlinkSync(nmfilect);

        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *Contacts saved successfully!*\n\n📛 *Group:* ${cmiggc.subject}\n👥 *Contacts:* ${participants.length}\n\nVCF file sent above.`, 
            sender, 
            pushname,
            "Save Contacts - Success",
            `${participants.length} contacts saved`
        );
        
    } catch (err) {
        console.error(err);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error:* ${err.toString()}`, 
            sender, 
            pushname,
            "Save Contacts - Error",
            "Operation failed"
        );
    }
});
