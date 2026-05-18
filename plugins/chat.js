const { fana } = require('../njabulo');
const axios = require('axios');
const config = require('../config');

// Helper function to send formatted messages
async function sendFormattedMessage(conn, from, text, userName, sender, type = 'success') {
    const bodyText = type === 'error' ? `⚠️ Error for ${userName}` : `${userName}, ${type === 'ai' ? 'AI Response' : type === 'openai' ? 'OpenAI Response' : 'DeepSeek Response'}`;
    const externalBody = type === 'error' ? `❌ Error Occurred for ${userName}` : `${type === 'ai' ? '🤖' : '🧠'} Response for ${userName}`;
    
    await conn.sendMessage(from, {
        text: text,
        contextInfo: {
            isForwarded: true,
            title: "ɴᴊᴀʙᴜʟᴏ ᴜɪ",
            body: bodyText,
            forwardedNewsletterMessageInfo: {
                newsletterJid: config.NEWSLETTER,
                newsletterName: '╭••➤ɴᴊᴀʙᴜʟᴏ ᴜɪ',
                serverMessageId: 143
            },
            forwardingScore: 999,
            externalAdReply: {
                title: "ɴᴊᴀʙᴜʟᴏ ᴜɪ",
                body: externalBody,
                thumbnailUrl: config.FANAIMG,
                sourceUrl: config.NJABULOURL,
                mediaType: 1,
                renderSmallThumbnail: true
            }
        }
    }, { quoted: {
        key: {
            fromMe: false,
            participant: `0@s.whatsapp.net`,
            remoteJid: "status@broadcast"
        },
        message: {
            contactMessage: {
                displayName: userName,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${userName};USER;;;\nFN:${userName}\nitem1.TEL;waid=${sender.split('@')[0]}:${sender.split('@')[0]}\nitem1.X-ABLabel:User\nEND:VCARD`
            }
        }
    } });
}

// AI COMMAND
fana({
    name: "ai",
    alias: ["bot", "dj", "gpt", "gpt4", "bing"],
    desc: "Chat with an AI model",
    category: "ai",
    fromMe: false,
    filename: __filename
},
async (conn, mek, args, { from, sender, pushname, q }) => {
    try {
        await conn.sendMessage(from, { react: { text: "🤖", key: mek.key } });
        
        if (!q) {
            const errorText = "❌ Please provide a message for the AI.\n\n📝 *Example:* `.ai Hello`\n\n💡 *Available aliases:* bot, dj, gpt, gpt4, bing";
            const userName = pushname || sender.split('@')[0] || "User";
            await sendFormattedMessage(conn, from, errorText, userName, sender, 'error');
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return;
        }

        const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.message) {
            const errorText = "❌ AI failed to respond. Please try again later.\n\n🔧 *Tip:* Make sure your message is clear and try again.";
            const userName = pushname || sender.split('@')[0] || "User";
            await sendFormattedMessage(conn, from, errorText, userName, sender, 'error');
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return;
        }

        const userName = pushname || sender.split('@')[0] || "User";
        await sendFormattedMessage(conn, from, data.message, userName, sender, 'ai');
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
        
    } catch (e) {
        console.error("Error in AI command:", e);
        const userName = pushname || sender.split('@')[0] || "User";
        const errorText = `❌ An error occurred while communicating with the AI.\n\n📡 *Error Details:* ${e.message}\n\n🔄 Please try again later.`;
        await sendFormattedMessage(conn, from, errorText, userName, sender, 'error');
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    }
});

// OPENAI COMMAND
fana({
    name: "openai",
    alias: ["chatgpt", "gpt3", "open-gpt"],
    desc: "Chat with OpenAI",
    category: "ai",
    fromMe: false,
    filename: __filename
},
async (conn, mek, args, { from, sender, pushname, q }) => {
    try {
        await conn.sendMessage(from, { react: { text: "🧠", key: mek.key } });
        
        if (!q) {
            const errorText = "❌ Please provide a message for OpenAI.\n\n📝 *Example:* `.openai Hello`\n\n💡 *Available aliases:* chatgpt, gpt3, open-gpt";
            const userName = pushname || sender.split('@')[0] || "User";
            await sendFormattedMessage(conn, from, errorText, userName, sender, 'error');
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return;
        }

        const apiUrl = `https://vapis.my.id/api/openai?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.result) {
            const errorText = "❌ OpenAI failed to respond. Please try again later.\n\n🔧 *Tip:* Check your internet connection and try again.";
            const userName = pushname || sender.split('@')[0] || "User";
            await sendFormattedMessage(conn, from, errorText, userName, sender, 'error');
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return;
        }

        const userName = pushname || sender.split('@')[0] || "User";
        const responseText = `🧠 *OpenAI Response:*\n\n${data.result}`;
        await sendFormattedMessage(conn, from, responseText, userName, sender, 'openai');
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
        
    } catch (e) {
        console.error("Error in OpenAI command:", e);
        const userName = pushname || sender.split('@')[0] || "User";
        const errorText = `❌ An error occurred while communicating with OpenAI.\n\n📡 *Error Details:* ${e.message}\n\n🔄 Please try again later.`;
        await sendFormattedMessage(conn, from, errorText, userName, sender, 'error');
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    }
});

// DEEPSEEK COMMAND
fana({
    name: "deepseek",
    alias: ["deep", "seekai"],
    desc: "Chat with DeepSeek AI",
    category: "ai",
    fromMe: false,
    filename: __filename
},
async (conn, mek, args, { from, sender, pushname, q }) => {
    try {
        await conn.sendMessage(from, { react: { text: "🧠", key: mek.key } });
        
        if (!q) {
            const errorText = "❌ Please provide a message for DeepSeek AI.\n\n📝 *Example:* `.deepseek Hello`\n\n💡 *Available aliases:* deep, seekai";
            const userName = pushname || sender.split('@')[0] || "User";
            await sendFormattedMessage(conn, from, errorText, userName, sender, 'error');
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return;
        }

        const apiUrl = `https://api.ryzendesu.vip/api/ai/deepseek?text=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.answer) {
            const errorText = "❌ DeepSeek AI failed to respond. Please try again later.\n\n🔧 *Tip:* Make sure your question is clear and try again.";
            const userName = pushname || sender.split('@')[0] || "User";
            await sendFormattedMessage(conn, from, errorText, userName, sender, 'error');
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return;
        }

        const userName = pushname || sender.split('@')[0] || "User";
        const responseText = `🧠 *DeepSeek AI Response:*\n\n${data.answer}`;
        await sendFormattedMessage(conn, from, responseText, userName, sender, 'deepseek');
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
        
    } catch (e) {
        console.error("Error in DeepSeek AI command:", e);
        const userName = pushname || sender.split('@')[0] || "User";
        const errorText = `❌ An error occurred while communicating with DeepSeek AI.\n\n📡 *Error Details:* ${e.message}\n\n🔄 Please try again later.`;
        await sendFormattedMessage(conn, from, errorText, userName, sender, 'error');
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    }
});
