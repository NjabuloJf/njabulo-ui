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
                    body: externalBody || "Temp Number",
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
    pattern: "tempnum",
    alias: ["fakenum", "tempnumber", "temp"],
    desc: "Get temporary numbers & OTP instructions",
    category: "tools",
    react: "📱",
    use: "<country-code>"
},
async (conn, mek, m, { from, args, reply, sender, pushname }) => {
    try {
        if (!args || args.length < 1) {
            await sendFormattedMessage(
                conn, 
                from, 
                "📱 *Please provide a country code*\n\n📌 *Usage:* .tempnum us\n🔍 *Example:* .tempnum us\n\n📦 *After getting number, use .otpbox <number>*", 
                sender, 
                pushname,
                "Temp Number - Error",
                "No country code"
            );
            return;
        }

        const countryCode = args[0].toLowerCase();
        
        await sendFormattedMessage(
            conn, 
            from, 
            `📱 *Fetching temporary numbers for ${countryCode.toUpperCase()}...*\n\n⏳ Please wait!`, 
            sender, 
            pushname,
            "Temp Number",
            "Fetching"
        );

        const { data } = await axios.get(
            `https://api.vreden.my.id/api/tools/fakenumber/listnumber?id=${countryCode}`,
            { timeout: 10000 }
        );

        if (!data?.result || !Array.isArray(data.result)) {
            await sendFormattedMessage(
                conn, 
                from, 
                `⚠ *Invalid API response*\n\nTry .tempnum us`, 
                sender, 
                pushname,
                "Temp Number - Error",
                "Invalid response"
            );
            return;
        }

        if (data.result.length === 0) {
            await sendFormattedMessage(
                conn, 
                from, 
                `📭 *No numbers available for ${countryCode.toUpperCase()}*\n\nTry another country code!\n\nUse .otpbox <number> after selection`, 
                sender, 
                pushname,
                "Temp Number - Error",
                "No numbers"
            );
            return;
        }

        const numbers = data.result.slice(0, 25);
        let numberList = `📱 *TEMPORARY NUMBERS* 📱

🌍 *Country:* ${countryCode.toUpperCase()}
📊 *Numbers Found:* ${numbers.length}

━━━━━━━━━━━━━━━━
📞 *Available Numbers:*

`;
        numbers.forEach((num, i) => {
            numberList += `${String(i+1).padStart(2, ' ')}. ${num.number}\n`;
        });

        numberList += `\n━━━━━━━━━━━━━━━━
📦 *Use .otpbox <number> to check OTPs*
🔍 *Example:* .otpbox +1234567890`;

        await sendFormattedMessage(
            conn, 
            from, 
            numberList, 
            sender, 
            pushname,
            "Temp Numbers",
            `${numbers.length} numbers found`
        );

    } catch (err) {
        console.error("API Error:", err);
        const errorMessage = err.code === "ECONNABORTED" ? 
            "⏳ *Timeout: API took too long*\nTry smaller country codes like 'us', 'gb'" :
            `⚠ *Error:* ${err.message}\nUse format: .tempnum <country-code>`;
        
        await sendFormattedMessage(
            conn, 
            from, 
            errorMessage, 
            sender, 
            pushname,
            "Temp Number - Error",
            "Request failed"
        );
    }
});

cmd({
    pattern: "templist",
    alias: ["tempnumberlist", "tempnlist", "listnumbers", "countries"],
    desc: "Show list of countries with temp numbers",
    category: "tools",
    react: "🌍",
    filename: __filename,
    use: ".templist"
},
async (conn, mek, m, { from, reply, sender, pushname }) => {
    try {
        await sendFormattedMessage(
            conn, 
            from, 
            "🌍 *Fetching country list...*\n\n⏳ Please wait!", 
            sender, 
            pushname,
            "Temp Numbers",
            "Fetching"
        );

        const { data } = await axios.get("https://api.vreden.my.id/api/tools/fakenumber/country", { timeout: 10000 });

        if (!data || !data.result) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Couldn't fetch country list.*", 
                sender, 
                pushname,
                "Temp Numbers - Error",
                "Fetch failed"
            );
            return;
        }

        const countries = data.result.map((c, i) => `${i + 1}. ${c.title} (${c.id})`).join("\n");

        const message = `🌍 *AVAILABLE COUNTRIES* 🌍

📊 *Total Countries:* ${data.result.length}

━━━━━━━━━━━━━━━━
${countries}
━━━━━━━━━━━━━━━━
📌 *Use .tempnum <country-code> to get numbers*
🔍 *Example:* .tempnum us`;

        await sendFormattedMessage(
            conn, 
            from, 
            message, 
            sender, 
            pushname,
            "Temp Numbers",
            `${data.result.length} countries`
        );
    } catch (e) {
        console.error("TEMP LIST ERROR:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *Failed to fetch temporary number country list.*", 
            sender, 
            pushname,
            "Temp Numbers - Error",
            "Request failed"
        );
    }
});

cmd({
    pattern: "otpbox",
    alias: ["checkotp", "getotp", "otpmessages"],
    desc: "Check OTP messages for temporary number",
    category: "tools",
    react: "🔑",
    use: "<full-number>"
},
async (conn, mek, m, { from, args, reply, sender, pushname }) => {
    try {
        if (!args[0] || !args[0].startsWith("+")) {
            await sendFormattedMessage(
                conn, 
                from, 
                "🔑 *Please provide a full phone number*\n\n📌 *Usage:* .otpbox +1234567890\n🔍 *Example:* .otpbox +9231034481xx", 
                sender, 
                pushname,
                "OTP Check - Error",
                "Invalid number"
            );
            return;
        }

        const phoneNumber = args[0].trim();
        
        await sendFormattedMessage(
            conn, 
            from, 
            `🔑 *Checking OTP messages for ${phoneNumber}...*\n\n⏳ Please wait!`, 
            sender, 
            pushname,
            "OTP Check",
            "Fetching"
        );

        const { data } = await axios.get(
            `https://api.vreden.my.id/api/tools/fakenumber/message?nomor=${encodeURIComponent(phoneNumber)}`,
            { timeout: 10000 }
        );

        if (!data?.result || !Array.isArray(data.result)) {
            await sendFormattedMessage(
                conn, 
                from, 
                "⚠ *No OTP messages found for this number*", 
                sender, 
                pushname,
                "OTP Check - Error",
                "No messages"
            );
            return;
        }

        if (data.result.length === 0) {
            await sendFormattedMessage(
                conn, 
                from, 
                `📭 *No OTP messages found for ${phoneNumber}*`, 
                sender, 
                pushname,
                "OTP Check",
                "Empty inbox"
            );
            return;
        }

        let otpMessages = `🔑 *OTP MESSAGES* 🔑

📱 *Number:* ${phoneNumber}
📊 *Messages Found:* ${data.result.length}

━━━━━━━━━━━━━━━━

`;
        for (let i = 0; i < Math.min(data.result.length, 10); i++) {
            const msg = data.result[i];
            const otpMatch = msg.content.match(/\b\d{4,8}\b/g);
            const otpCode = otpMatch ? otpMatch[0] : "Not found";
            
            otpMessages += `📌 *Message ${i+1}*
📨 *From:* ${msg.from || "Unknown"}
🔐 *OTP Code:* ${otpCode}
⏰ *Time:* ${msg.time_wib || msg.timestamp || "Unknown"}
💬 *Content:* ${msg.content.substring(0, 100)}${msg.content.length > 100 ? "..." : ""}

━━━━━━━━━━━━━━━━
\n`;
        }

        if (data.result.length > 10) {
            otpMessages += `\n⚠ *Showing first 10 of ${data.result.length} messages*`;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            otpMessages, 
            sender, 
            pushname,
            "OTP Messages",
            `${data.result.length} messages`
        );

    } catch (err) {
        console.error("OTP Check Error:", err);
        const errorMsg = err.code === "ECONNABORTED" ?
            "⌛ *OTP check timed out. Try again later*" :
            `⚠ *Error:* ${err.response?.data?.error || err.message}`;
        
        await sendFormattedMessage(
            conn, 
            from, 
            `${errorMsg}\n\n📌 *Usage:* .otpbox +9231034481xx`, 
            sender, 
            pushname,
            "OTP Check - Error",
            "Request failed"
        );
    }
});
