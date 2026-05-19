

const path = require("path");
const { fetchGif, fetchImage, gifToSticker } = require('../lib/sticker-utils');
const { tmpdir } = require("os");
const fetch = require("node-fetch");
const Crypto = require("crypto");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require("../lib/functions");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const { cmd } = require('../command');
const { videoToWebp } = require('../lib/video-utils');
const { Sticker, createSticker, StickerTypes } = require("wa-sticker-formatter");
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
                    body: externalBody || "Sticker Maker",
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

cmd(
  {
    pattern: 'vsticker',
    alias: ['gsticker', 'g2s', 'gs', 'v2s', 'vs', 'videosticker'],
    desc: 'Convert GIF/Video to a sticker.',
    category: 'sticker',
    use: '<reply media or URL>',
    filename: __filename,
  },
  async (conn, mek, m, { quoted, args, reply, from, sender, pushname }) => {
    try {
      if (!mek.quoted) {
        await sendFormattedMessage(
          conn, 
          from, 
          "🎬 *Please reply to a video or GIF to convert it to a sticker!*\n\n📌 *Usage:* Reply to a video with .vsticker", 
          sender, 
          pushname,
          "Video Sticker - Error",
          "No media"
        );
        return;
      }

      const mime = mek.quoted.mtype;
      if (!['videoMessage', 'imageMessage'].includes(mime)) {
        await sendFormattedMessage(
          conn, 
          from, 
          "❌ *Please reply to a valid video or GIF.*", 
          sender, 
          pushname,
          "Video Sticker - Error",
          "Invalid media"
        );
        return;
      }

      await sendFormattedMessage(
        conn, 
        from, 
        "🎬 *Converting video to sticker...*\n\n⏳ Please wait!", 
        sender, 
        pushname,
        "Video Sticker",
        "Converting"
      );

      // Download the media file
      const media = await mek.quoted.download();

      // Convert the video to a WebP buffer
      const webpBuffer = await videoToWebp(media);

      // Generate sticker metadata
      const sticker = new Sticker(webpBuffer, {
        pack: config.STICKER_NAME || 'NJABULO UI',
        author: '',
        type: StickerTypes.FULL,
        categories: ['🤩', '🎉'],
        id: '12345',
        quality: 75,
        background: 'transparent',
      });

      // Convert sticker to buffer and send
      const stickerBuffer = await sticker.toBuffer();
      await conn.sendMessage(mek.chat, { sticker: stickerBuffer }, { quoted: mek });
      
      await sendFormattedMessage(
        conn, 
        from, 
        "✅ *Video sticker created successfully!*\n\nEnjoy your new sticker!", 
        sender, 
        pushname,
        "Video Sticker - Success",
        "Sticker delivered"
      );
      
    } catch (error) {
      console.error(error);
      await sendFormattedMessage(
        conn, 
        from, 
        `❌ *An error occurred:* ${error.message}`, 
        sender, 
        pushname,
        "Video Sticker - Error",
        "Conversion failed"
      );
    }
  }
);    

cmd({
    pattern: "attp",
    alias: ["texttosticker", "attpsticker"],
    desc: "Convert text to a GIF sticker.",
    react: "✨",
    category: "convert",
    use: ".attp HI",
    filename: __filename,
}, async (conn, mek, m, { args, reply, from, sender, pushname }) => {
    try {
        if (!args[0]) {
            await sendFormattedMessage(
              conn, 
              from, 
              "✨ *Please provide text to convert to sticker!*\n\n📌 *Usage:* .attp Hello\n🔍 *Example:* .attp NJABULO UI", 
              sender, 
              pushname,
              "Text Sticker - Error",
              "No text"
            );
            return;
        }

        await sendFormattedMessage(
          conn, 
          from, 
          `✨ *Converting text to sticker...*\n\n📝 *Text:* ${args.join(" ")}\n⏳ Please wait!`, 
          sender, 
          pushname,
          "Text Sticker",
          "Converting"
        );

        const gifBuffer = await fetchGif(`https://api-fix.onrender.com/api/maker/attp?text=${encodeURIComponent(args.join(" "))}`);
        const stickerBuffer = await gifToSticker(gifBuffer);

        await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: mek });
        
        await sendFormattedMessage(
          conn, 
          from, 
          "✅ *Text sticker created successfully!*\n\nEnjoy your new sticker!", 
          sender, 
          pushname,
          "Text Sticker - Success",
          "Sticker delivered"
        );
        
    } catch (error) {
        await sendFormattedMessage(
          conn, 
          from, 
          `❌ *Error:* ${error.message}`, 
          sender, 
          pushname,
          "Text Sticker - Error",
          "Conversion failed"
        );
    }
});
