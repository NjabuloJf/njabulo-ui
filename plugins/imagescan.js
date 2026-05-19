const axios = require("axios");
const FormData = require('form-data');
const fs = require('fs');
const os = require('os');
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
                    body: externalBody || "Image Scanner",
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
  pattern: "imgscan",
  alias: ["scanimg", "imagescan", "analyzeimg", "aiimage"],
  react: '🔍',
  desc: "Scan and analyze images using AI",
  category: "utility",
  use: ".imgscan [reply to image]",
  filename: __filename
}, async (conn, mek, m, { from, reply, quoted, sender, pushname }) => {
  try {
    // Check if quoted message exists and has media
    const quotedMsg = quoted || mek;
    const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';
    
    if (!mimeType || !mimeType.startsWith('image/')) {
      await sendFormattedMessage(
        conn, 
        from, 
        "🔍 *Please reply to an image file*\n\n📌 *Usage:* Reply to an image with .imgscan\n\n📝 *Supported formats:* JPEG, PNG", 
        sender, 
        pushname,
        "Image Scan - Error",
        "No image provided"
      );
      return;
    }

    await sendFormattedMessage(
      conn, 
      from, 
      `🔍 *Scanning image...*\n\n📸 *Type:* ${mimeType}\n⏳ Please wait!`, 
      sender, 
      pushname,
      "Image Scanner",
      "Processing image"
    );

    // Download the media
    const mediaBuffer = await quotedMsg.download();
    const fileSize = formatBytes(mediaBuffer.length);
    
    // Get file extension based on mime type
    let extension = '';
    if (mimeType.includes('image/jpeg')) extension = '.jpg';
    else if (mimeType.includes('image/png')) extension = '.png';
    else {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *Unsupported image format*\n\nPlease use JPEG or PNG format only.", 
        sender, 
        pushname,
        "Image Scan - Error",
        "Unsupported format"
      );
      return;
    }

    const tempFilePath = path.join(os.tmpdir(), `imgscan_${Date.now()}${extension}`);
    fs.writeFileSync(tempFilePath, mediaBuffer);

    // Upload to Catbox
    const form = new FormData();
    form.append('fileToUpload', fs.createReadStream(tempFilePath), `image${extension}`);
    form.append('reqtype', 'fileupload');

    const uploadResponse = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders(),
      timeout: 30000
    });

    const imageUrl = uploadResponse.data;
    fs.unlinkSync(tempFilePath);

    if (!imageUrl) {
      throw new Error("Failed to upload image");
    }

    await sendFormattedMessage(
      conn, 
      from, 
      `📤 *Image uploaded successfully*\n\n🔗 *URL:* ${imageUrl.substring(0, 50)}...\n🤖 *Analyzing with AI...*`, 
      sender, 
      pushname,
      "Image Scanner",
      "Analyzing"
    );

    // Scan the image using the API
    const scanUrl = `https://apis.davidcyriltech.my.id/imgscan?url=${encodeURIComponent(imageUrl)}`;
    const scanResponse = await axios.get(scanUrl, { timeout: 30000 });

    if (!scanResponse.data.success) {
      throw new Error(scanResponse.data.message || "Failed to analyze image");
    }

    const resultMessage = `🔍 *IMAGE ANALYSIS RESULTS* 🔍

📸 *File Size:* ${fileSize}
📝 *Format:* ${mimeType.split('/')[1].toUpperCase()}

━━━━━━━━━━━━━━━━

${scanResponse.data.result}

━━━━━━━━━━━━━━━━
✅ *Analysis complete!*`;

    await sendFormattedMessage(
      conn, 
      from, 
      resultMessage, 
      sender, 
      pushname,
      "Image Scanner",
      "Analysis complete"
    );

  } catch (error) {
    console.error('Image Scan Error:', error);
    await sendFormattedMessage(
      conn, 
      from, 
      `❌ *Error scanning image*\n\n${error.message || "Please try again later."}\n\nMake sure the image is clear and try again.`, 
      sender, 
      pushname,
      "Image Scan - Error",
      "Scan failed"
    );
  }
});
