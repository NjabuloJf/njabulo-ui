const { cmd } = require('../command');
const axios = require('axios');

// All replies will use this formatted message function
async function sendFormattedMessage(conn, from, text, sender, userName, externalBody = '', bodyText = '') {
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
                body: externalBody || "AI Assistant",
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
                    displayName: userName || pushname || "User",
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${userName || pushname || "User"};USER;;;\nFN:${userName || pushname || "User"}\nitem1.TEL;waid=${sender?.split('@')[0] || '0'}:${sender?.split('@')[0] || '0'}\nitem1.X-ABLabel:User\nEND:VCARD`
                }
            }
        }
    });
}

cmd({
    pattern: "ai",
    alias: ["bot", "dj", "gpt", "gpt4", "bing"],
    desc: "Chat with an AI model",
    category: "ai",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react, sender, pushname }) => {
    try {
        if (!q) {
            await sendFormattedMessage(
                conn, 
                from, 
                "🤖 *Please provide a message for the AI*\n\nExample: `.ai Hello`\n`.ai What is JavaScript?`", 
                sender, 
                pushname,
                "AI Command - Missing Input",
                "Type a message to chat with AI"
            );
            return;
        }

        const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.message) {
            await react("❌");
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *AI failed to respond*\nPlease try again later.", 
                sender, 
                pushname,
                "AI Error",
                "Service temporarily unavailable"
            );
            return;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `🤖 *AI Response:*\n\n${data.message}`, 
            sender, 
            pushname,
            "AI Assistant",
            `Answering: ${q.substring(0, 50)}...`
        );
        await react("✅");
    } catch (e) {
        console.error("Error in AI command:", e);
        await react("❌");
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error:* ${e.message}`, 
            sender, 
            pushname,
            "AI Error",
            "Please try again later"
        );
    }
});

cmd({
    pattern: "openai",
    alias: ["chatgpt", "gpt3", "open-gpt"],
    desc: "Chat with OpenAI",
    category: "ai",
    react: "🧠",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react, sender, pushname }) => {
    try {
        if (!q) {
            await sendFormattedMessage(
                conn, 
                from, 
                "🧠 *Please provide a message for OpenAI*\n\nExample: `.openai Hello`\n`.openai Explain quantum physics`", 
                sender, 
                pushname,
                "OpenAI - Missing Input",
                "Type a message to chat with OpenAI"
            );
            return;
        }

        const apiUrl = `https://vapis.my.id/api/openai?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.result) {
            await react("❌");
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *OpenAI failed to respond*\nPlease try again later.", 
                sender, 
                pushname,
                "OpenAI Error",
                "Service temporarily unavailable"
            );
            return;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `🧠 *OpenAI Response:*\n\n${data.result}`, 
            sender, 
            pushname,
            "OpenAI Assistant",
            `Answering: ${q.substring(0, 50)}...`
        );
        await react("✅");
    } catch (e) {
        console.error("Error in OpenAI command:", e);
        await react("❌");
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error:* ${e.message}`, 
            sender, 
            pushname,
            "OpenAI Error",
            "Please try again later"
        );
    }
});

cmd({
    pattern: "deepseek",
    alias: ["deep", "seekai"],
    desc: "Chat with DeepSeek AI",
    category: "ai",
    react: "🧠",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react, sender, pushname }) => {
    try {
        if (!q) {
            await sendFormattedMessage(
                conn, 
                from, 
                "🧠 *Please provide a message for DeepSeek AI*\n\nExample: `.deepseek Hello`\n`.deepseek What is machine learning?`", 
                sender, 
                pushname,
                "DeepSeek AI - Missing Input",
                "Type a message to chat with DeepSeek"
            );
            return;
        }

        const apiUrl = `https://api.ryzendesu.vip/api/ai/deepseek?text=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.answer) {
            await react("❌");
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *DeepSeek AI failed to respond*\nPlease try again later.", 
                sender, 
                pushname,
                "DeepSeek Error",
                "Service temporarily unavailable"
            );
            return;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `🧠 *DeepSeek AI Response:*\n\n${data.answer}`, 
            sender, 
            pushname,
            "DeepSeek AI Assistant",
            `Answering: ${q.substring(0, 50)}...`
        );
        await react("✅");
    } catch (e) {
        console.error("Error in DeepSeek AI command:", e);
        await react("❌");
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error:* ${e.message}`, 
            sender, 
            pushname,
            "DeepSeek Error",
            "Please try again later"
        );
    }
});
