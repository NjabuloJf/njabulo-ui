const axios = require('axios');
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
                    body: externalBody || "Latest News",
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
    pattern: "news",
    alias: ["headlines", "latestnews", "topnews"],
    desc: "Get the latest news headlines.",
    category: "news",
    react: "🗞️",
    filename: __filename
},
async (conn, mek, m, { from, reply, sender, pushname }) => {
    try {
        await sendFormattedMessage(
            conn, 
            from, 
            "🗞️ *Fetching latest news headlines...*\n\n⏳ Please wait!", 
            sender, 
            pushname,
            "News",
            "Fetching headlines"
        );

        const apiKey = "0f2c43ab11324578a7b1709651736382";
        const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`, { timeout: 15000 });
        const articles = response.data.articles;

        if (!articles.length) {
            await sendFormattedMessage(
                conn, 
                from, 
                "📰 *No news articles found.*\n\nPlease try again later.", 
                sender, 
                pushname,
                "News - Error",
                "No articles"
            );
            return;
        }

        const articlesToSend = Math.min(articles.length, 5);
        
        await sendFormattedMessage(
            conn, 
            from, 
            `🗞️ *TOP ${articlesToSend} HEADLINES* 🗞️\n\n📢 Latest news for you!`, 
            sender, 
            pushname,
            "News",
            "Sending headlines"
        );

        // Send each article as a separate message with image and title
        for (let i = 0; i < articlesToSend; i++) {
            const article = articles[i];
            let message = `📰 *TOP NEWS ${i+1}/${articlesToSend}* 📰

📌 *Title:* ${article.title}

📝 *Description:*
${article.description || "No description available"}

🔗 *Read more:* ${article.url}

━━━━━━━━━━━━━━━━
🗞️ *Stay informed!*`;

            if (article.urlToImage) {
                await conn.sendMessage(from, { 
                    image: { url: article.urlToImage }, 
                    caption: message 
                }, { quoted: mek });
            } else {
                await sendFormattedMessage(
                    conn, 
                    from, 
                    message, 
                    sender, 
                    pushname,
                    "News Headline",
                    article.title.substring(0, 50)
                );
            }
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `✅ *${articlesToSend} news articles delivered!*\n\n🗞️ Stay updated with the latest news.`, 
            sender, 
            pushname,
            "News - Complete",
            `${articlesToSend} articles sent`
        );

    } catch (e) {
        console.error("Error fetching news:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Could not fetch news*\n\n${e.message}\n\nPlease try again later.`, 
            sender, 
            pushname,
            "News - Error",
            "Request failed"
        );
    }
});
