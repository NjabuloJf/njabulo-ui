const { sleep } = require('../lib/functions');
const {cmd , commands} = require('../command');
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
                    body: externalBody || "Utility Tools",
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
    pattern: "rcolor",
    alias: ["randomcolor", "color"],
    desc: "Generate a random color with name and code.",
    category: "utility",
    filename: __filename,
}, 
async (conn, mek, m, { reply, from, sender, pushname }) => {
    try {
        const colorNames = [
            "Red", "Green", "Blue", "Yellow", "Orange", "Purple", "Pink", "Brown", "Black", "White", 
            "Gray", "Cyan", "Magenta", "Violet", "Indigo", "Teal", "Lavender", "Turquoise"
        ];
        
        const randomColorHex = "#" + Math.floor(Math.random()*16777215).toString(16);
        const randomColorName = colorNames[Math.floor(Math.random() * colorNames.length)];

        await sendFormattedMessage(
            conn, 
            from, 
            `🎨 *RANDOM COLOR* 🎨\n\n📛 *Name:* ${randomColorName}\n🎨 *Code:* ${randomColorHex}`, 
            sender, 
            pushname,
            "Random Color",
            randomColorHex
        );
    } catch (e) {
        console.error("Error in .randomcolor command:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *An error occurred while generating the random color.*", 
            sender, 
            pushname,
            "Random Color - Error",
            "Failed"
        );
    }
});

cmd({
    pattern: "binary",
    alias: ["tobin"],
    desc: "Convert text into binary format.",
    category: "utility",
    filename: __filename,
}, 
async (conn, mek, m, { args, reply, from, sender, pushname }) => {
    try {
        if (!args.length) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Please provide the text to convert to binary*\n\n📌 *Usage:* .binary Hello", 
                sender, 
                pushname,
                "Binary - Error",
                "No text"
            );
            return;
        }

        const textToConvert = args.join(" ");
        const binaryText = textToConvert.split('').map(char => {
            return `00000000${char.charCodeAt(0).toString(2)}`.slice(-8);
        }).join(' ');

        await sendFormattedMessage(
            conn, 
            from, 
            `🔑 *BINARY REPRESENTATION* 🔑\n\n📝 *Text:* ${textToConvert}\n\n💻 ${binaryText}`, 
            sender, 
            pushname,
            "Binary Converter",
            `${textToConvert.substring(0, 30)}`
        );
    } catch (e) {
        console.error("Error in .binary command:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *An error occurred while converting to binary.*", 
            sender, 
            pushname,
            "Binary - Error",
            "Failed"
        );
    }
});

cmd({
    pattern: "dbinary",
    alias: ["frombin"],
    desc: "Decode binary string into text.",
    category: "utility",
    filename: __filename,
}, 
async (conn, mek, m, { args, reply, from, sender, pushname }) => {
    try {
        if (!args.length) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Please provide the binary string to decode*\n\n📌 *Usage:* .dbinary 01001000 01100101", 
                sender, 
                pushname,
                "Binary Decode - Error",
                "No binary"
            );
            return;
        }

        const binaryString = args.join(" ");
        const textDecoded = binaryString.split(' ').map(bin => {
            return String.fromCharCode(parseInt(bin, 2));
        }).join('');

        await sendFormattedMessage(
            conn, 
            from, 
            `🔓 *DECODED TEXT* 🔓\n\n🔢 *Binary:* ${binaryString}\n\n📝 *Text:* ${textDecoded}`, 
            sender, 
            pushname,
            "Binary Decoder",
            textDecoded.substring(0, 30)
        );
    } catch (e) {
        console.error("Error in .binarydecode command:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *An error occurred while decoding the binary string.*", 
            sender, 
            pushname,
            "Binary Decode - Error",
            "Failed"
        );
    }
});

cmd({
    pattern: "base64",
    alias: ["to64"],
    desc: "Encode text into Base64 format.",
    category: "utility",
    filename: __filename,
}, 
async (conn, mek, m, { args, reply, from, sender, pushname }) => {
    try {
        if (!args.length) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Please provide the text to encode into Base64*\n\n📌 *Usage:* .base64 Hello", 
                sender, 
                pushname,
                "Base64 - Error",
                "No text"
            );
            return;
        }

        const textToEncode = args.join(" ");
        const encodedText = Buffer.from(textToEncode).toString('base64');

        await sendFormattedMessage(
            conn, 
            from, 
            `🔑 *ENCODED BASE64* 🔑\n\n📝 *Text:* ${textToEncode}\n\n📦 *Base64:* ${encodedText}`, 
            sender, 
            pushname,
            "Base64 Encoder",
            `${textToEncode.substring(0, 30)}`
        );
    } catch (e) {
        console.error("Error in .base64 command:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *An error occurred while encoding the text into Base64.*", 
            sender, 
            pushname,
            "Base64 - Error",
            "Failed"
        );
    }
});

cmd({
    pattern: "unbase64",
    alias: ["from64"],
    desc: "Decode Base64 encoded text.",
    category: "utility",
    filename: __filename,
}, 
async (conn, mek, m, { args, reply, from, sender, pushname }) => {
    try {
        if (!args.length) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Please provide the Base64 encoded text to decode*\n\n📌 *Usage:* .unbase64 SGVsbG8=", 
                sender, 
                pushname,
                "Base64 Decode - Error",
                "No text"
            );
            return;
        }

        const base64Text = args.join(" ");
        const decodedText = Buffer.from(base64Text, 'base64').toString('utf-8');

        await sendFormattedMessage(
            conn, 
            from, 
            `🔓 *DECODED BASE64* 🔓\n\n📦 *Base64:* ${base64Text}\n\n📝 *Text:* ${decodedText}`, 
            sender, 
            pushname,
            "Base64 Decoder",
            decodedText.substring(0, 30)
        );
    } catch (e) {
        console.error("Error in .unbase64 command:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *An error occurred while decoding the Base64 text.*", 
            sender, 
            pushname,
            "Base64 Decode - Error",
            "Failed"
        );
    }
});

cmd({
    pattern: "urlencode",
    alias: ["touri"],
    desc: "Encode text into URL encoding.",
    category: "utility",
    filename: __filename,
}, 
async (conn, mek, m, { args, reply, from, sender, pushname }) => {
    try {
        if (!args.length) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Please provide the text to encode into URL encoding*\n\n📌 *Usage:* .urlencode Hello World", 
                sender, 
                pushname,
                "URL Encode - Error",
                "No text"
            );
            return;
        }

        const textToEncode = args.join(" ");
        const encodedText = encodeURIComponent(textToEncode);

        await sendFormattedMessage(
            conn, 
            from, 
            `🔑 *ENCODED URL TEXT* 🔑\n\n📝 *Original:* ${textToEncode}\n\n🔗 *Encoded:* ${encodedText}`, 
            sender, 
            pushname,
            "URL Encoder",
            `${textToEncode.substring(0, 30)}`
        );
    } catch (e) {
        console.error("Error in .urlencode command:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *An error occurred while encoding the text.*", 
            sender, 
            pushname,
            "URL Encode - Error",
            "Failed"
        );
    }
});

cmd({
    pattern: "urldecode",
    alias: ["fromuri"],
    desc: "Decode URL encoded text.",
    category: "utility",
    filename: __filename,
}, 
async (conn, mek, m, { args, reply, from, sender, pushname }) => {
    try {
        if (!args.length) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Please provide the URL encoded text to decode*\n\n📌 *Usage:* .urldecode Hello%20World", 
                sender, 
                pushname,
                "URL Decode - Error",
                "No text"
            );
            return;
        }

        const encodedText = args.join(" ");
        const decodedText = decodeURIComponent(encodedText);

        await sendFormattedMessage(
            conn, 
            from, 
            `🔓 *DECODED TEXT* 🔓\n\n🔗 *Encoded:* ${encodedText}\n\n📝 *Decoded:* ${decodedText}`, 
            sender, 
            pushname,
            "URL Decoder",
            decodedText.substring(0, 30)
        );
    } catch (e) {
        console.error("Error in .urldecode command:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *An error occurred while decoding the URL encoded text.*", 
            sender, 
            pushname,
            "URL Decode - Error",
            "Failed"
        );
    }
});

cmd({
    pattern: "roll",
    alias: ["dice"],
    desc: "Roll a dice (1-6).",
    category: "fun",
    filename: __filename,
}, 
async (conn, mek, m, { reply, from, sender, pushname }) => {
    try {
        const result = Math.floor(Math.random() * 6) + 1;
        await sendFormattedMessage(
            conn, 
            from, 
            `🎲 *DICE ROLL* 🎲\n\nYou rolled: *${result}*`, 
            sender, 
            pushname,
            "Dice Roll",
            `Rolled ${result}`
        );
    } catch (e) {
        console.error("Error in .roll command:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *An error occurred while rolling the dice.*", 
            sender, 
            pushname,
            "Dice Roll - Error",
            "Failed"
        );
    }
});

cmd({
    pattern: "coinflip",
    alias: ["flipcoin"],
    desc: "Flip a coin and get Heads or Tails.",
    category: "fun",
    filename: __filename,
}, 
async (conn, mek, m, { reply, from, sender, pushname }) => {
    try {
        const result = Math.random() < 0.5 ? "Heads" : "Tails";
        await sendFormattedMessage(
            conn, 
            from, 
            `🪙 *COIN FLIP* 🪙\n\nResult: *${result}*`, 
            sender, 
            pushname,
            "Coin Flip",
            result
        );
    } catch (e) {
        console.error("Error in .coinflip command:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *An error occurred while flipping the coin.*", 
            sender, 
            pushname,
            "Coin Flip - Error",
            "Failed"
        );
    }
});

cmd({
    pattern: "flip",
    alias: ["reverse"],
    desc: "Flip the text you provide.",
    category: "fun",
    filename: __filename,
}, 
async (conn, mek, m, { args, reply, from, sender, pushname }) => {
    try {
        if (!args.length) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Please provide the text to flip*\n\n📌 *Usage:* .flip Hello", 
                sender, 
                pushname,
                "Text Flip - Error",
                "No text"
            );
            return;
        }

        const flippedText = args.join(" ").split('').reverse().join('');

        await sendFormattedMessage(
            conn, 
            from, 
            `🔄 *FLIPPED TEXT* 🔄\n\n📝 *Original:* ${args.join(" ")}\n\n🔄 *Flipped:* ${flippedText}`, 
            sender, 
            pushname,
            "Text Flipper",
            flippedText.substring(0, 30)
        );
    } catch (e) {
        console.error("Error in .flip command:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *An error occurred while flipping the text.*", 
            sender, 
            pushname,
            "Text Flip - Error",
            "Failed"
        );
    }
});

cmd({
    pattern: "pick",
    alias: ["choose"],
    desc: "Pick between two choices.",
    category: "fun",
    filename: __filename,
}, 
async (conn, mek, m, { args, reply, from, sender, pushname }) => {
    try {
        if (args.length < 2) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Please provide two choices to pick from*\n\n📌 *Example:* .pick Ice Cream, Pizza", 
                sender, 
                pushname,
                "Picker - Error",
                "Not enough choices"
            );
            return;
        }

        const option = args.join(" ").split(',')[Math.floor(Math.random() * 2)].trim();

        await sendFormattedMessage(
            conn, 
            from, 
            `🎉 *BOT PICKS* 🎉\n\n*${option}*`, 
            sender, 
            pushname,
            "Choice Picker",
            option
        );
    } catch (e) {
        console.error("Error in .pick command:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *An error occurred while processing your request.*", 
            sender, 
            pushname,
            "Picker - Error",
            "Failed"
        );
    }
});

cmd({
    pattern: "timenow",
    alias: ["time", "currenttime"],
    desc: "Check the current local time.",
    category: "utility",
    filename: __filename,
}, 
async (conn, mek, m, { reply, from, sender, pushname }) => {
    try {
        const now = new Date();
        const localTime = now.toLocaleTimeString("en-US", { 
            hour: "2-digit", 
            minute: "2-digit", 
            second: "2-digit", 
            hour12: true,
            timeZone: "Asia/Karachi"
        });
        
        await sendFormattedMessage(
            conn, 
            from, 
            `🕒 *CURRENT LOCAL TIME* 🕒\n\n${localTime}`, 
            sender, 
            pushname,
            "Current Time",
            localTime
        );
    } catch (e) {
        console.error("Error in .timenow command:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *An error occurred. Please try again later.*", 
            sender, 
            pushname,
            "Time - Error",
            "Failed"
        );
    }
});

cmd({
    pattern: "date",
    alias: ["currentdate"],
    desc: "Check the current date.",
    category: "utility",
    filename: __filename,
}, 
async (conn, mek, m, { reply, from, sender, pushname }) => {
    try {
        const now = new Date();
        const currentDate = now.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
        
        await sendFormattedMessage(
            conn, 
            from, 
            `📅 *CURRENT DATE* 📅\n\n${currentDate}`, 
            sender, 
            pushname,
            "Current Date",
            currentDate
        );
    } catch (e) {
        console.error("Error in .date command:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *An error occurred. Please try again later.*", 
            sender, 
            pushname,
            "Date - Error",
            "Failed"
        );
    }
});

cmd({
    pattern: "shapar",
    desc: "Send shapar ASCII art with mentions.",
    category: "fun",
    filename: __filename,
}, 
async (conn, mek, m, { from, isGroup, reply, sender, pushname }) => {
    try {
        if (!isGroup) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *This command can only be used in groups.*", 
                sender, 
                pushname,
                "Shapar - Error",
                "Not a group"
            );
            return;
        }

        const mentionedUser = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!mentionedUser) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Please mention a user to send the ASCII art to.*\n\n📌 *Usage:* .shapar @user", 
                sender, 
                pushname,
                "Shapar - Error",
                "No user"
            );
            return;
        }

        const asciiArt = `
          _______
       .-'       '-.
      /           /|
     /           / |
    /___________/  |
    |   _______ |  |
    |  |  \\ \\  ||  |
    |  |   \\ \\ ||  |
    |  |____\\ \\||  |
    |  '._  _.'||  |
    |    .' '.  ||  |
    |   '.___.' ||  |
    |___________||  |
    '------------'  |
     \\_____________\\|
`;

        const message = `😂 @${mentionedUser.split("@")[0]}!\n😂 that for you:\n\n${asciiArt}`;

        await conn.sendMessage(from, {
            text: message,
            mentions: [mentionedUser],
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in .shapar command:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *An error occurred while processing the command.*", 
            sender, 
            pushname,
            "Shapar - Error",
            "Failed"
        );
    }
});

cmd({
    pattern: "rate",
    alias: ["rating"],
    desc: "Rate someone out of 10.",
    category: "fun",
    filename: __filename,
}, 
async (conn, mek, m, { from, isGroup, reply, sender, pushname }) => {
    try {
        if (!isGroup) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *This command can only be used in groups.*", 
                sender, 
                pushname,
                "Rate - Error",
                "Not a group"
            );
            return;
        }

        const mentionedUser = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!mentionedUser) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Please mention someone to rate.*\n\n📌 *Usage:* .rate @user", 
                sender, 
                pushname,
                "Rate - Error",
                "No user"
            );
            return;
        }

        const randomRating = Math.floor(Math.random() * 10) + 1;
        
        await sendFormattedMessage(
            conn, 
            from, 
            `⭐ *RATING* ⭐\n\n@${mentionedUser.split("@")[0]} is rated *${randomRating}/10*.`, 
            sender, 
            pushname,
            "Rating",
            `${randomRating}/10`
        );

    } catch (e) {
        console.error("Error in .rate command:", e);
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *An error occurred. Please try again.*", 
            sender, 
            pushname,
            "Rate - Error",
            "Failed"
        );
    }
});

cmd({
    pattern: "countx",
    alias: ["countdown"],
    desc: "Start a reverse countdown from the specified number to 1.",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { args, reply, senderNumber, from, sender, pushname }) => {
    try {
        const botOwner = conn.user.id.split(":")[0];
        if (senderNumber !== botOwner) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Only the bot owner can use this command.*", 
                sender, 
                pushname,
                "Countdown - Access Denied",
                "Owner only"
            );
            return;
        }

        if (!args[0]) {
            await sendFormattedMessage(
                conn, 
                from, 
                "✳️ *Use this command like:*\n\n📌 *Example:* .countx 10", 
                sender, 
                pushname,
                "Countdown - Error",
                "No number"
            );
            return;
        }

        const count = parseInt(args[0].trim());

        if (isNaN(count) || count <= 0 || count > 50) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Please specify a valid number between 1 and 50.*", 
                sender, 
                pushname,
                "Countdown - Error",
                "Invalid number"
            );
            return;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `⏳ *Starting reverse countdown from ${count}...*`, 
            sender, 
            pushname,
            "Countdown",
            "Starting"
        );

        for (let i = count; i >= 1; i--) {
            await conn.sendMessage(from, { text: `${i}` }, { quoted: mek });
            await sleep(1000);
        }

        await sendFormattedMessage(
            conn, 
            from, 
            "✅ *Countdown completed.*", 
            sender, 
            pushname,
            "Countdown",
            "Completed"
        );
    } catch (e) {
        console.error(e);
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *An error occurred while processing your request.*", 
            sender, 
            pushname,
            "Countdown - Error",
            "Failed"
        );
    }
});

cmd({
    pattern: "count",
    alias: ["upto"],
    desc: "Start a countdown from 1 to the specified number.",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { args, reply, senderNumber, from, sender, pushname }) => {
    try {
        const botOwner = conn.user.id.split(":")[0];
        if (senderNumber !== botOwner) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Only the bot owner can use this command.*", 
                sender, 
                pushname,
                "Count Up - Access Denied",
                "Owner only"
            );
            return;
        }

        if (!args[0]) {
            await sendFormattedMessage(
                conn, 
                from, 
                "✳️ *Use this command like:*\n\n📌 *Example:* .count 10", 
                sender, 
                pushname,
                "Count Up - Error",
                "No number"
            );
            return;
        }

        const count = parseInt(args[0].trim());

        if (isNaN(count) || count <= 0 || count > 50) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Please specify a valid number between 1 and 50.*", 
                sender, 
                pushname,
                "Count Up - Error",
                "Invalid number"
            );
            return;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `⏳ *Starting count up to ${count}...*`, 
            sender, 
            pushname,
            "Count Up",
            "Starting"
        );

        for (let i = 1; i <= count; i++) {
            await conn.sendMessage(from, { text: `${i}` }, { quoted: mek });
            await sleep(1000);
        }

        await sendFormattedMessage(
            conn, 
            from, 
            "✅ *Count up completed.*", 
            sender, 
            pushname,
            "Count Up",
            "Completed"
        );
    } catch (e) {
        console.error(e);
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *An error occurred while processing your request.*", 
            sender, 
            pushname,
            "Count Up - Error",
            "Failed"
        );
    }
});

cmd({
    pattern: "calculate",
    alias: ["calc", "math"],
    desc: "Evaluate a mathematical expression.",
    category: "utilities",
    filename: __filename
},
async (conn, mek, m, { args, reply, from, sender, pushname }) => {
    try {
        if (!args[0]) {
            await sendFormattedMessage(
                conn, 
                from, 
                "✳️ *Use this command like:*\n\n📌 *Example:* .calculate 5+3*2", 
                sender, 
                pushname,
                "Calculator - Error",
                "No expression"
            );
            return;
        }

        const expression = args.join(" ").trim();

        if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Invalid expression.*\n\nOnly numbers and +, -, *, /, ( ) are allowed.", 
                sender, 
                pushname,
                "Calculator - Error",
                "Invalid expression"
            );
            return;
        }

        let result;
        try {
            result = eval(expression);
        } catch (e) {
            await sendFormattedMessage(
                conn, 
                from, 
                "❌ *Error in calculation.*\n\nPlease check your expression.", 
                sender, 
                pushname,
                "Calculator - Error",
                "Evaluation failed"
            );
            return;
        }

        await sendFormattedMessage(
            conn, 
            from, 
            `🧮 *CALCULATION RESULT* 🧮\n\n📝 *Expression:* ${expression}\n\n✅ *Result:* ${result}`, 
            sender, 
            pushname,
            "Calculator",
            `${expression} = ${result}`
        );
    } catch (e) {
        console.error(e);
        await sendFormattedMessage(
            conn, 
            from, 
            "❌ *An error occurred while processing your request.*", 
            sender, 
            pushname,
            "Calculator - Error",
            "Failed"
        );
    }
});
