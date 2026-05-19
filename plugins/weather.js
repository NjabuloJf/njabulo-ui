const axios = require('axios');
const config = require('../config');
const { cmd, commands } = require('../command');

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
                    body: externalBody || "Weather Info",
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
    pattern: "weather",
    alias: ["w", "climate", "forecast"],
    desc: "🌤 Get weather information for a location",
    react: "🌤",
    category: "other",
    filename: __filename
},
async (conn, mek, m, { from, q, reply, sender, pushname }) => {
    try {
        if (!q) {
            await sendFormattedMessage(
                conn, 
                from, 
                "🌤 *Please provide a city name*\n\n📌 *Usage:* .weather London\n🔍 *Example:* .weather New York\n\n_You can also use country codes like: .weather London,UK_", 
                sender, 
                pushname,
                "Weather - Error",
                "No city"
            );
            return;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `🌤 *Fetching weather information...*\n\n📍 *Location:* ${q}\n⏳ Please wait!`, 
            sender, 
            pushname,
            "Weather Info",
            "Fetching data"
        );

        const apiKey = '2d61a72574c11c4f36173b627f8cb177'; 
        const city = q;
        const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const response = await axios.get(url, { timeout: 15000 });
        const data = response.data;
        
        const weather = `🌤 *WEATHER INFORMATION* 🌤

📍 *Location:* ${data.name}, ${data.sys.country}

🌡️ *Temperature:* ${data.main.temp}°C
🌡️ *Feels Like:* ${data.main.feels_like}°C
📉 *Min Temp:* ${data.main.temp_min}°C
📈 *Max Temp:* ${data.main.temp_max}°C

💧 *Humidity:* ${data.main.humidity}%
☁️ *Weather:* ${data.weather[0].main}
🌫️ *Description:* ${data.weather[0].description}
💨 *Wind Speed:* ${data.wind.speed} m/s
🔽 *Pressure:* ${data.main.pressure} hPa

━━━━━━━━━━━━━━━━
✅ *Weather information fetched successfully!*`;

        await sendFormattedMessage(
            conn, 
            from, 
            weather, 
            sender, 
            pushname,
            "Weather Information",
            `${data.name}, ${data.sys.country}`
        );
        
    } catch (e) {
        console.log(e);
        if (e.response && e.response.status === 404) {
            await sendFormattedMessage(
                conn, 
                from, 
                "🚫 *City not found*\n\nPlease check the spelling and try again.\n\n📌 *Example:* .weather London", 
                sender, 
                pushname,
                "Weather - Error",
                "City not found"
            );
        } else if (e.code === 'ECONNABORTED') {
            await sendFormattedMessage(
                conn, 
                from, 
                "⏰ *Request timeout*\n\nPlease try again in a few moments.", 
                sender, 
                pushname,
                "Weather - Error",
                "Timeout"
            );
        } else {
            await sendFormattedMessage(
                conn, 
                from, 
                "⚠️ *An error occurred*\n\nPlease try again later.", 
                sender, 
                pushname,
                "Weather - Error",
                "Request failed"
            );
        }
    }
});
