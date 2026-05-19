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
                    body: externalBody || "Country Info",
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
    pattern: "countryinfo",
    alias: ["cinfo", "country", "countrydata"],
    desc: "Get information about a country",
    category: "info",
    react: "🌍",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react, sender, pushname }) => {
    try {
        if (!q) {
            await sendFormattedMessage(
                conn, 
                from, 
                "🌍 *Please provide a country name*\n\n📌 *Usage:* .countryinfo Pakistan\n🔍 *Example:* .cinfo United States", 
                sender, 
                pushname,
                "Country Info - Error",
                "No country"
            );
            return;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `🌍 *Fetching country information for:* "${q}"\n\n⏳ Please wait!`, 
            sender, 
            pushname,
            "Country Info",
            "Fetching"
        );

        const apiUrl = `https://api.siputzx.my.id/api/tools/countryInfo?name=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl, { timeout: 15000 });

        if (!data.status || !data.data) {
            await react("❌");
            await sendFormattedMessage(
                conn, 
                from, 
                `❌ *No information found for:* "${q}"\n\nPlease check the country name and try again.`, 
                sender, 
                pushname,
                "Country Info - Error",
                "Not found"
            );
            return;
        }

        const info = data.data;
        
        let neighborsText = info.neighbors.length > 0
            ? info.neighbors.map(n => `🌍 ${n.name}`).join(", ")
            : "No neighboring countries found";

        const text = `🌍 *COUNTRY INFORMATION* 🌍

📛 *Name:* ${info.name}
🏛 *Capital:* ${info.capital}
📍 *Continent:* ${info.continent.name} ${info.continent.emoji}
📞 *Phone Code:* ${info.phoneCode}
📏 *Area:* ${info.area.squareKilometers} km² (${info.area.squareMiles} mi²)
🚗 *Driving Side:* ${info.drivingSide}
💱 *Currency:* ${info.currency}
🔤 *Languages:* ${info.languages.native.join(", ")}
🌟 *Famous For:* ${info.famousFor}
🌍 *ISO Codes:* ${info.isoCode.alpha2.toUpperCase()}, ${info.isoCode.alpha3.toUpperCase()}
🌎 *Internet TLD:* ${info.internetTLD}

━━━━━━━━━━━━━━━━
🔗 *Neighbors:* ${neighborsText}

✅ *Country information fetched!*`;

        await conn.sendMessage(from, {
            image: { url: info.flag },
            caption: text
        }, { quoted: mek });

        await react("✅");

    } catch (e) {
        console.error("Error in countryinfo command:", e);
        await react("❌");
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *An error occurred while fetching country information.*\n\n${e.message}`, 
            sender, 
            pushname,
            "Country Info - Error",
            "Request failed"
        );
    }
});
