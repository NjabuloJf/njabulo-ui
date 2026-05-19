const axios = require("axios");
const FormData = require('form-data');
const fs = require('fs');
const os = require('os');
const path = require("path");
const { cmd, commands } = require("../command");
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
                    body: externalBody || "Media Uploader",
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

// Helper function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

cmd({
  'pattern': "tourl",
  'alias': ["imgtourl", "imgurl", "url", "geturl", "upload", "tohost"],
  'react': '🖇',
  'desc': "Convert media to Catbox URL",
  'category': "utility",
  'use': ".tourl [reply to media]",
  'filename': __filename
}, async (conn, mek, m, { from, reply, sender, pushname }) => {
  try {
    // Check if quoted message exists and has media
    const quotedMsg = mek.quoted ? mek.quoted : mek;
    const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';
    
    if (!mimeType) {
      await sendFormattedMessage(
        conn, 
        from, 
        "🖇 *Please reply to an image, video, or audio file*\n\n📌 *Usage:* Reply to a media file with .tourl", 
        sender, 
        pushname,
        "Media Upload - Error",
        "No media"
      );
      return;
    }

    // Determine media type
    let mediaType = 'File';
    if (mimeType.includes('image')) mediaType = 'Image';
    else if (mimeType.includes('video')) mediaType = 'Video';
    else if (mimeType.includes('audio')) mediaType = 'Audio';

    await sendFormattedMessage(
      conn, 
      from, 
      `📤 *Uploading ${mediaType.toLowerCase()}...*\n\n📸 *Type:* ${mediaType}\n⏳ Please wait!`, 
      sender, 
      pushname,
      "Media Upload",
      `Uploading ${mediaType}`
    );

    // Download the media
    const mediaBuffer = await quotedMsg.download();
    const tempFilePath = path.join(os.tmpdir(), `catbox_upload_${Date.now()}`);
    fs.writeFileSync(tempFilePath, mediaBuffer);

    // Get file extension based on mime type
    let extension = '';
    if (mimeType.includes('image/jpeg')) extension = '.jpg';
    else if (mimeType.includes('image/png')) extension = '.png';
    else if (mimeType.includes('video/mp4')) extension = '.mp4';
    else if (mimeType.includes('video')) extension = '.mp4';
    else if (mimeType.includes('audio/mpeg')) extension = '.mp3';
    else if (mimeType.includes('audio')) extension = '.mp3';
    else extension = '.bin';
    
    const fileName = `file${extension}`;

    // Prepare form data for Catbox
    const form = new FormData();
    form.append('fileToUpload', fs.createReadStream(tempFilePath), fileName);
    form.append('reqtype', 'fileupload');

    // Upload to Catbox
    const response = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders(),
      timeout: 60000
    });

    if (!response.data) {
      throw new Error("Error uploading to Catbox");
    }

    const mediaUrl = response.data;
    fs.unlinkSync(tempFilePath);

    const message = `🖇 *MEDIA UPLOADED* 🖇

📁 *Type:* ${mediaType}
📏 *Size:* ${formatBytes(mediaBuffer.length)}
🔗 *URL:* ${mediaUrl}

✅ *Upload successful!*`;

    await sendFormattedMessage(
      conn, 
      from, 
      message, 
      sender, 
      pushname,
      "Media Uploader",
      `${mediaType} uploaded`
    );

  } catch (error) {
    console.error(error);
    await sendFormattedMessage(
      conn, 
      from, 
      `❌ *Error:* ${error.message || error}`, 
      sender, 
      pushname,
      "Media Upload - Error",
      "Upload failed"
    );
  }
});
