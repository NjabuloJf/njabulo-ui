const axios = require('axios'); 
const config = require('../config');
const { cmd, commands } = require('../command');
const fetch = require('node-fetch'); 

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
                    body: externalBody || "Prayer Times",
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
    pattern: "praytime", 
    alias: ["prayertimes", "prayertime", "ptime", "salah"], 
    react: "✅", 
    desc: "Get the prayer times, weather, and location for the city.", 
    category: "information", 
    filename: __filename,
},
async(conn, mek, m, {from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, isItzcp, groupAdmins, isBotAdmins, isAdmins, reply}) => {
    try {
        const city = args.length > 0 ? args.join(" ") : "bhakkar";

        await sendFormattedMessage(
            conn, 
            from, 
            `🕌 *Fetching prayer times...*\n\n📍 *City:* ${city}\n⏳ Please wait!`, 
            sender, 
            pushname,
            "Prayer Times",
            "Fetching data"
        );

        const apiUrl = `https://api.nexoracle.com/islamic/prayer-times?city=${encodeURIComponent(city)}`;
        const response = await fetch(apiUrl, { timeout: 15000 });

        if (!response.ok) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Error fetching prayer times*\n\nPlease try again later.", 
                sender, 
                pushname,
                "Prayer Times - Error",
                "API request failed"
            );
            return;
        }

        const data = await response.json();

        if (data.status !== 200) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Failed to get prayer times*\n\nPlease check the city name and try again.\n\n📌 *Example:* .praytime london", 
                sender, 
                pushname,
                "Prayer Times - Error",
                "City not found"
            );
            return;
        }

        const prayerTimes = data.result.items[0];
        const weather = data.result.today_weather;
        const location = data.result.city;

        let dec = `🕌 *PRAYER TIMES* 🕌

📍 *Location:* ${location}, ${data.result.state}
📌 *Country:* ${data.result.country}
🕌 *Method:* ${data.result.prayer_method_name}

━━━━━━━━━━━━━━━━

🌅 *Fajr:* ${prayerTimes.fajr}
🌄 *Shurooq:* ${prayerTimes.shurooq}
☀️ *Dhuhr:* ${prayerTimes.dhuhr}
🌇 *Asr:* ${prayerTimes.asr}
🌆 *Maghrib:* ${prayerTimes.maghrib}
🌃 *Isha:* ${prayerTimes.isha}

━━━━━━━━━━━━━━━━

🧭 *Qibla Direction:* ${data.result.qibla_direction}°

🌡️ *Temperature:* ${weather.temperature !== null ? `${weather.temperature}°C` : 'Data not available'}

━━━━━━━━━━━━━━━━
✅ *Prayer times fetched successfully!*`;

        await sendFormattedMessage(
            conn, 
            from, 
            dec, 
            sender, 
            pushname,
            `Prayer Times - ${location}`,
            `${city} prayer times`
        );

        // Send Islamic audio
        await conn.sendMessage(from, {
            audio: { url: 'https://github.com/XdTechPro/KHAN-DATA/raw/refs/heads/main/autovoice/Islamic.m4a' },
            mimetype: 'audio/mp4',
            ptt: false
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error occurred*\n\n${e.message}\n\nPlease try again later.`, 
            sender, 
            pushname,
            "Prayer Times - Error",
            "Request failed"
        );
    }
});
