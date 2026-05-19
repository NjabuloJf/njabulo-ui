const { cmd } = require('../command');
const axios = require('axios');
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
                    body: externalBody || "AI Voice Generator",
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
    pattern: "aivoice",
    alias: ["vai", "voicex", "voiceai", "ttsai"],
    desc: "Text to speech with different AI voices",
    category: "main",
    react: "🪃",
    filename: __filename
},
async (conn, mek, m, { 
    from, 
    quoted, 
    body, 
    isCmd, 
    command, 
    args, 
    q, 
    isGroup, 
    sender, 
    senderNumber, 
    botNumber2, 
    botNumber, 
    pushname, 
    isMe, 
    isOwner, 
    groupMetadata, 
    groupName, 
    participants, 
    groupAdmins, 
    isBotAdmins, 
    isAdmins, 
    reply 
}) => {
    try {
        if (!args[0]) {
            await sendFormattedMessage(
                conn, 
                from, 
                "🎙️ *Please provide text for voice generation*\n\n📌 *Usage:* .aivoice Hello world\n🔍 *Example:* .aivoice Welcome to NJABULO UI", 
                sender, 
                pushname,
                "AI Voice - Error",
                "No text"
            );
            return;
        }

        const inputText = args.join(' ');

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        // Voice model menu
        const voiceModels = [
            { number: "1", name: "Hatsune Miku", model: "miku" },
            { number: "2", name: "Nahida (Exclusive)", model: "nahida" },
            { number: "3", name: "Nami", model: "nami" },
            { number: "4", name: "Ana (Female)", model: "ana" },
            { number: "5", name: "Optimus Prime", model: "optimus_prime" },
            { number: "6", name: "Goku", model: "goku" },
            { number: "7", name: "Taylor Swift", model: "taylor_swift" },
            { number: "8", name: "Elon Musk", model: "elon_musk" },
            { number: "9", name: "Mickey Mouse", model: "mickey_mouse" },
            { number: "10", name: "Kendrick Lamar", model: "kendrick_lamar" },
            { number: "11", name: "Angela Adkinsh", model: "angela_adkinsh" },
            { number: "12", name: "Eminem", model: "eminem" }
        ];

        let menuText = `🎙️ *AI VOICE MODELS* 🎙️\n\n`;
        voiceModels.forEach(model => {
            menuText += `${model.number}. ${model.name}\n`;
        });
        menuText += `\n📌 *Reply with the number to select voice model for:*\n"${inputText.substring(0, 50)}${inputText.length > 50 ? '...' : ''}"`;

        await sendFormattedMessage(
            conn, 
            from, 
            menuText, 
            sender, 
            pushname,
            "Voice Models",
            `Text: ${inputText.substring(0, 30)}`
        );

        let handlerActive = true;

        const handlerTimeout = setTimeout(() => {
            handlerActive = false;
            conn.ev.off("messages.upsert", messageHandler);
            sendFormattedMessage(
                conn, 
                from, 
                "⌛ *Voice selection timed out*\n\nPlease try the command again.", 
                sender, 
                pushname,
                "AI Voice - Timeout",
                "Selection timed out"
            );
        }, 120000);

        const messageHandler = async (msgData) => {  
            if (!handlerActive) return;
            
            const receivedMsg = msgData.messages[0];  
            if (!receivedMsg || !receivedMsg.message) return;  

            const receivedText = receivedMsg.message.conversation || 
                              receivedMsg.message.extendedTextMessage?.text || 
                              receivedMsg.message.buttonsResponseMessage?.selectedButtonId;  
            const senderID = receivedMsg.key.remoteJid;  
            const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === m.key.id;  

            if (isReplyToBot && senderID === from) {  
                clearTimeout(handlerTimeout);
                conn.ev.off("messages.upsert", messageHandler);
                handlerActive = false;

                await conn.sendMessage(senderID, { react: { text: '⬇️', key: receivedMsg.key } });  

                const selectedNumber = receivedText.trim();
                const selectedModel = voiceModels.find(model => model.number === selectedNumber);

                if (!selectedModel) {
                    await sendFormattedMessage(
                        conn, 
                        from, 
                        "❌ *Invalid option*\n\nPlease reply with a number from the menu (1-12).", 
                        sender, 
                        pushname,
                        "AI Voice - Error",
                        "Invalid selection"
                    );
                    return;
                }

                try {
                    await sendFormattedMessage(
                        conn, 
                        from, 
                        `🔊 *Generating audio with ${selectedModel.name} voice...*\n\n⏳ Please wait!`, 
                        sender, 
                        pushname,
                        "AI Voice",
                        `Voice: ${selectedModel.name}`
                    );

                    const apiUrl = `https://api.agatz.xyz/api/voiceover?text=${encodeURIComponent(inputText)}&model=${selectedModel.model}`;
                    const response = await axios.get(apiUrl, { timeout: 30000 });
                    const data = response.data;

                    if (data.status === 200) {
                        await conn.sendMessage(from, {  
                            audio: { url: data.data.oss_url },  
                            mimetype: "audio/mpeg"
                        }, { quoted: receivedMsg });
                        
                        await sendFormattedMessage(
                            conn, 
                            from, 
                            `✅ *Audio generated successfully!*\n\n🎙️ *Voice:* ${selectedModel.name}\n📝 *Text:* ${inputText.substring(0, 50)}${inputText.length > 50 ? '...' : ''}`, 
                            sender, 
                            pushname,
                            "AI Voice - Success",
                            "Audio delivered"
                        );
                    } else {
                        await sendFormattedMessage(
                            conn, 
                            from, 
                            "❌ *Error generating audio*\n\nPlease try again.", 
                            sender, 
                            pushname,
                            "AI Voice - Error",
                            "Generation failed"
                        );
                    }
                } catch (error) {
                    console.error("API Error:", error);
                    await sendFormattedMessage(
                        conn, 
                        from, 
                        `❌ *Error processing your request*\n\n${error.message}`, 
                        sender, 
                        pushname,
                        "AI Voice - Error",
                        "Request failed"
                    );
                }
            }  
        };

        conn.ev.on("messages.upsert", messageHandler);

    } catch (error) {
        console.error("Command Error:", error);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *An error occurred*\n\n${error.message}`, 
            sender, 
            pushname,
            "AI Voice - Error",
            "Command failed"
        );
    }
});
