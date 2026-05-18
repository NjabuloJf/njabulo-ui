const { cmd } = require("../command");
const axios = require("axios");
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
                    body: externalBody || "Google Image Search",
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
    pattern: "img",
    alias: ["image", "googleimage", "searchimg"],
    react: "🦋",
    desc: "Search and download Google images",
    category: "fun",
    use: ".img <keywords>",
    filename: __filename
}, async (conn, mek, m, { reply, args, from, sender, pushname }) => {
    try {
        const query = args.join(" ");
        if (!query) {
            await sendFormattedMessage(
                conn, 
                from, 
                "🖼️ *Please provide a search query*\n\n📌 *Usage:* .img cute cats\n🔍 *Example:* .img beautiful nature", 
                sender, 
                pushname,
                "Image Search - Missing Query",
                "No keywords provided"
            );
            return;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `🔍 *Searching images for* "${query}"...\n\n⏳ Please wait while we find the best images for you.`, 
            sender, 
            pushname,
            "Image Search",
            `Searching: ${query}`
        );

        const url = `https://apis.davidcyriltech.my.id/googleimage?query=${encodeURIComponent(query)}`;
        const response = await axios.get(url, { timeout: 20000 });

        // Validate response
        if (!response.data?.success || !response.data.results?.length) {
            await sendFormattedMessage(
                conn, 
                from, 
                `❌ *No images found*\n\nTry different keywords for "${query}".\n\n📌 *Example:* .img flowers`, 
                sender, 
                pushname,
                "Image Search - No Results",
                "No images found"
            );
            return;
        }

        const results = response.data.results;
        // Get 5 random images
        const selectedImages = results
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);

        const totalImages = selectedImages.length;

        await sendFormattedMessage(
            conn, 
            from, 
            `🖼️ *Found ${totalImages} images for* "${query}"\n\n📸 Sending images...`, 
            sender, 
            pushname,
            "Image Search",
            `${totalImages} images found`
        );

        let sentCount = 0;
        for (const imageUrl of selectedImages) {
            sentCount++;
            await conn.sendMessage(
                from,
                { 
                    image: { url: imageUrl },
                    caption: `📷 *Image ${sentCount}/${totalImages}*\n🔍 *Search:* ${query}`
                },
                { quoted: mek }
            );
            // Add delay between sends to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *All images sent successfully!*\n\n📸 Total: ${totalImages} images\n🔍 Search: "${query}"`, 
            sender, 
            pushname,
            "Image Search - Complete",
            `${totalImages} images delivered`
        );

    } catch (error) {
        console.error('Image Search Error:', error);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error searching images*\n\n⚠️ ${error.message || "Failed to fetch images"}\n\nPlease try again later.`, 
            sender, 
            pushname,
            "Image Search - Error",
            "Request failed"
        );
    }
});
