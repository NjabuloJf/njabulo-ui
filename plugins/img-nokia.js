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
                    body: externalBody || "Image Editor",
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
  pattern: "nokia",
  alias: ["nokiaedit", "nokiaeffect", "oldphone"],
  react: '📸',
  desc: "Apply Nokia effect to images",
  category: "img_edit",
  use: ".nokia [reply to image]",
  filename: __filename
}, async (conn, mek, m, { from, reply, sender, pushname }) => {
  try {
    // Check if quoted message exists and has media
    const quotedMsg = mek.quoted ? mek.quoted : mek;
    const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';
    
    if (!mimeType || !mimeType.startsWith('image/')) {
      await sendFormattedMessage(
        conn, 
        from, 
        "📸 *Please reply to an image file*\n\n📌 *Usage:* Reply to an image with .nokia\n📝 *Supported formats:* JPEG, PNG", 
        sender, 
        pushname,
        "Nokia Effect - Error",
        "No image"
      );
      return;
    }

    await sendFormattedMessage(
      conn, 
      from, 
      `📸 *Applying Nokia effect to image...*\n\n📸 *Type:* ${mimeType}\n⏳ Please wait!`, 
      sender, 
      pushname,
      "Nokia Effect",
      "Processing"
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
        "Nokia Effect - Error",
        "Unsupported format"
      );
      return;
    }

    const tempFilePath = path.join(os.tmpdir(), `img_nokia_${Date.now()}${extension}`);
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
      `📤 *Image uploaded successfully*\n\n🔗 *Processing...*\n📱 *Applying Nokia effect...*`, 
      sender, 
      pushname,
      "Nokia Effect",
      "Processing"
    );

    // Apply Nokia effect using the API
    const apiUrl = `https://api.popcat.xyz/v2/nokia?image=${encodeURIComponent(imageUrl)}`;
    const response = await axios.get(apiUrl, { responseType: "arraybuffer", timeout: 30000 });

    if (!response || !response.data) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *Error processing image*\n\nAPI did not return a valid image. Try again later.", 
        sender, 
        pushname,
        "Nokia Effect - Error",
        "Processing failed"
      );
      return;
    }

    const imageBuffer = Buffer.from(response.data, "binary");

    await conn.sendMessage(from, {
      image: imageBuffer,
      caption: `📸 *Nokia Effect Applied!*\n\n📱 Old school Nokia effect added to your image!`
    }, { quoted: mek });

    await sendFormattedMessage(
      conn, 
      from, 
      `✅ *Nokia effect applied successfully!*\n\n📱 Your image now has a retro Nokia look.\n\nEnjoy your edited image!`, 
      sender, 
      pushname,
      "Nokia Effect - Success",
      "Image delivered"
    );

  } catch (error) {
    console.error("Nokia Error:", error);
    await sendFormattedMessage(
      conn, 
      from, 
      `❌ *An error occurred*\n\n${error.message || "Unknown error"}\n\nPlease try again later.`, 
      sender, 
      pushname,
      "Nokia Effect - Error",
      "Request failed"
    );
  }
});
