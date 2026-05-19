const { cmd } = require('../command');
const crypto = require('crypto');
const webp = require('node-webpmux');
const axios = require('axios');
const fs = require('fs-extra');
const { exec } = require('child_process');
const { Sticker, createSticker, StickerTypes } = require("wa-sticker-formatter");
const Config = require('../config');

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
                    newsletterJid: Config.NEWSLETTER,
                    newsletterName: '╭••➤ɴᴊᴀʙᴜʟᴏ ᴜɪ',
                    serverMessageId: 143
                },
                forwardingScore: 999,
                externalAdReply: {
                    title: "ɴᴊᴀʙᴜʟᴏ ᴜɪ",
                    body: externalBody || "Sticker Maker",
                    thumbnailUrl: Config.FANAIMG,
                    sourceUrl: Config.NJABULOURL,
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

// Take Sticker - Rename existing sticker
cmd(
    {
        pattern: 'take',
        alias: ['rename', 'stake'],
        desc: 'Create a sticker with a custom pack name.',
        category: 'sticker',
        use: '<reply media or URL>',
        filename: __filename,
    },
    async (conn, mek, m, { quoted, args, q, reply, from, sender, pushname }) => {
        if (!mek.quoted) {
            await sendFormattedMessage(
                conn, 
                from, 
                "🎨 *Please reply to a sticker or image*\n\n📌 *Usage:* Reply to a sticker with .take PackName", 
                sender, 
                pushname,
                "Sticker Maker - Error",
                "No media"
            );
            return;
        }
        
        if (!q) {
            await sendFormattedMessage(
                conn, 
                from, 
                "🎨 *Please provide a pack name*\n\n📌 *Usage:* .take MyPack", 
                sender, 
                pushname,
                "Sticker Maker - Error",
                "No pack name"
            );
            return;
        }

        let mime = mek.quoted.mtype;
        let pack = q;

        if (mime === "imageMessage" || mime === "stickerMessage") {
            await sendFormattedMessage(
                conn, 
                from, 
                `🎨 *Creating sticker...*\n\n📦 *Pack:* ${pack}\n⏳ Please wait!`, 
                sender, 
                pushname,
                "Sticker Maker",
                "Creating sticker"
            );

            let media = await mek.quoted.download();
            let sticker = new Sticker(media, {
                pack: pack, 
                type: StickerTypes.FULL,
                categories: ["🤩", "🎉"],
                id: "12345",
                quality: 75,
                background: 'transparent',
            });
            const buffer = await sticker.toBuffer();
            
            await conn.sendMessage(mek.chat, { sticker: buffer }, { quoted: mek });
            
            await sendFormattedMessage(
                conn, 
                from, 
                `✅ *Sticker created successfully!*\n\n📦 *Pack:* ${pack}\n\nEnjoy your custom sticker!`, 
                sender, 
                pushname,
                "Sticker Maker - Success",
                "Sticker delivered"
            );
        } else {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Please reply to an image or sticker.*", 
                sender, 
                pushname,
                "Sticker Maker - Error",
                "Invalid media"
            );
        }
    }
);

// Sticker create - Create new sticker from image
cmd(
    {
        pattern: 'sticker',
        alias: ['s', 'stickergif', 'sgif'],
        desc: 'Create a sticker from an image, video, or URL.',
        category: 'sticker',
        use: '<reply media or URL>',
        filename: __filename,
    },
    async (conn, mek, m, { quoted, args, q, reply, from, sender, pushname }) => {
        if (!mek.quoted) {
            await sendFormattedMessage(
                conn, 
                from, 
                "🎨 *Please reply to an image or video*\n\n📌 *Usage:* Reply to an image with .sticker", 
                sender, 
                pushname,
                "Sticker Maker - Error",
                "No media"
            );
            return;
        }
        
        let mime = mek.quoted.mtype;
        let pack = Config.STICKER_NAME || "NJABULO UI";
        
        if (mime === "imageMessage" || mime === "stickerMessage" || mime === "videoMessage") {
            await sendFormattedMessage(
                conn, 
                from, 
                `🎨 *Creating sticker...*\n\n📦 *Pack:* ${pack}\n⏳ Please wait!`, 
                sender, 
                pushname,
                "Sticker Maker",
                "Creating sticker"
            );

            let media = await mek.quoted.download();
            let sticker = new Sticker(media, {
                pack: pack, 
                type: StickerTypes.FULL,
                categories: ["🤩", "🎉"], 
                id: "12345",
                quality: 75, 
                background: 'transparent',
            });
            const buffer = await sticker.toBuffer();
            
            await conn.sendMessage(mek.chat, { sticker: buffer }, { quoted: mek });
            
            await sendFormattedMessage(
                conn, 
                from, 
                `✅ *Sticker created successfully!*\n\n📦 *Pack:* ${pack}\n\nEnjoy your new sticker!`, 
                sender, 
                pushname,
                "Sticker Maker - Success",
                "Sticker delivered"
            );
        } else {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Please reply to an image or video.*", 
                sender, 
                pushname,
                "Sticker Maker - Error",
                "Invalid media"
            );
        }
    }
);
