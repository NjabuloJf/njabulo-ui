const { cmd } = require('../command');
const PDFDocument = require('pdfkit');
const { Buffer } = require('buffer');
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
                    body: externalBody || "PDF Converter",
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
    pattern: "topdf",
    alias: ["pdf", "makepdf", "txtpdf"],
    use: '.topdf',
    desc: "Convert provided text to a PDF file.",
    react: "📄",
    category: "utilities",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) {
            await sendFormattedMessage(
                conn, 
                from, 
                "📄 *Please provide the text you want to convert to PDF*\n\n📌 *Usage:* .topdf Hello World\n🔍 *Example:* .topdf This is my document", 
                sender, 
                pushname,
                "PDF Converter - Error",
                "No text"
            );
            return;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            "📄 *Converting text to PDF...*\n\n⏳ Please wait!", 
            sender, 
            pushname,
            "PDF Converter",
            "Converting"
        );

        // Create a new PDF document
        const doc = new PDFDocument();
        let buffers = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', async () => {
            const pdfData = Buffer.concat(buffers);

            // Send the PDF file
            await conn.sendMessage(from, {
                document: pdfData,
                mimetype: 'application/pdf',
                fileName: 'document.pdf',
                caption: `📄 *PDF CREATED SUCCESSFULLY!*

📝 *Content:* ${q.substring(0, 100)}${q.length > 100 ? '...' : ''}

✅ *File attached above*`
            }, { quoted: mek });

            await sendFormattedMessage(
                conn, 
                from, 
                "✅ *PDF created successfully!*\n\n📄 Your PDF document is ready.", 
                sender, 
                pushname,
                "PDF Converter - Success",
                "PDF delivered"
            );
        });

        // Add text to the PDF with formatting
        doc.fontSize(14)
           .text(q, {
               align: 'left',
               indent: 20
           });

        // Finalize the PDF and end the stream
        doc.end();

    } catch (e) {
        console.error(e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error:* ${e.message}`, 
            sender, 
            pushname,
            "PDF Converter - Error",
            "Conversion failed"
        );
    }
});
