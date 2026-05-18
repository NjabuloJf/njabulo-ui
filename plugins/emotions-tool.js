const { cmd } = require('../command');
const config = require("../config");

// Formatted message function for errors
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
                    body: externalBody || "Dynamic Emojis",
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
    pattern: "happy",
    desc: "Displays a dynamic edit msg for fun.",
    category: "tools",
    react: "😂",
    filename: __filename
},
async (conn, mek, m, { from, reply, sender, pushname }) => {
    try {
        const loadingMessage = await conn.sendMessage(from, { text: '😂' });
        const emojiMessages = [
            "😃", "😄", "😁", "😊", "😎", "🥳",
            "😸", "😹", "🌞", "🌈", "😃", "😄",
            "😁", "😊", "😎", "🥳", "😸", "😹",
            "🌞", "🌈", "😃", "😄", "😁", "😊"
        ];

        for (const line of emojiMessages) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await conn.relayMessage(
                from,
                {
                    protocolMessage: {
                        key: loadingMessage.key,
                        type: 14,
                        editedMessage: {
                            conversation: line,
                        },
                    },
                },
                {}
            );
        }
    } catch (e) {
        console.log(e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error!* ${e.message}`, 
            sender, 
            pushname,
            "Dynamic Emoji - Error",
            "Command failed"
        );
    }
});

cmd({
    pattern: "heart",
    desc: "Displays a dynamic edit msg for fun.",
    category: "tools",
    react: "❤️",
    filename: __filename
},
async (conn, mek, m, { from, reply, sender, pushname }) => {
    try {
        const loadingMessage = await conn.sendMessage(from, { text: '🖤' });
        const emojiMessages = [
            "💖", "💗", "💕", "🩷", "💛", "💚",
            "🩵", "💙", "💜", "🖤", "🩶", "🤍",
            "🤎", "❤️‍🔥", "💞", "💓", "💘", "💝",
            "♥️", "💟", "❤️‍🩹", "❤️"
        ];

        for (const line of emojiMessages) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await conn.relayMessage(
                from,
                {
                    protocolMessage: {
                        key: loadingMessage.key,
                        type: 14,
                        editedMessage: {
                            conversation: line,
                        },
                    },
                },
                {}
            );
        }
    } catch (e) {
        console.log(e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error!* ${e.message}`, 
            sender, 
            pushname,
            "Dynamic Emoji - Error",
            "Command failed"
        );
    }
});

cmd({
    pattern: "angry",
    desc: "Displays a dynamic edit msg for fun.",
    category: "tools",
    react: "🤡",
    filename: __filename
},
async (conn, mek, m, { from, reply, sender, pushname }) => {
    try {
        const loadingMessage = await conn.sendMessage(from, { text: '👽' });
        const emojiMessages = [
            "😡", "😠", "🤬", "😤", "😾", "😡",
            "😠", "🤬", "😤", "😾"
        ];

        for (const line of emojiMessages) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await conn.relayMessage(
                from,
                {
                    protocolMessage: {
                        key: loadingMessage.key,
                        type: 14,
                        editedMessage: {
                            conversation: line,
                        },
                    },
                },
                {}
            );
        }
    } catch (e) {
        console.log(e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error!* ${e.message}`, 
            sender, 
            pushname,
            "Dynamic Emoji - Error",
            "Command failed"
        );
    }
});

cmd({
    pattern: "sad",
    desc: "Displays a dynamic edit msg for fun.",
    category: "tools",
    react: "😶",
    filename: __filename
},
async (conn, mek, m, { from, reply, sender, pushname }) => {
    try {
        const loadingMessage = await conn.sendMessage(from, { text: '😔' });
        const emojiMessages = [
            "🥺", "😟", "😕", "😖", "😫", "🙁",
            "😩", "😥", "😓", "😪", "😢", "😔",
            "😞", "😭", "💔", "😭", "😿"
        ];

        for (const line of emojiMessages) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await conn.relayMessage(
                from,
                {
                    protocolMessage: {
                        key: loadingMessage.key,
                        type: 14,
                        editedMessage: {
                            conversation: line,
                        },
                    },
                },
                {}
            );
        }
    } catch (e) {
        console.log(e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error!* ${e.message}`, 
            sender, 
            pushname,
            "Dynamic Emoji - Error",
            "Command failed"
        );
    }
});

cmd({
    pattern: "shy",
    desc: "Displays a dynamic edit msg for fun.",
    category: "tools",
    react: "🧐",
    filename: __filename
},
async (conn, mek, m, { from, reply, sender, pushname }) => {
    try {
        const loadingMessage = await conn.sendMessage(from, { text: '🧐' });
        const emojiMessages = [
            "😳", "😊", "😶", "🙈", "🙊",
            "😳", "😊", "😶", "🙈", "🙊"
        ];

        for (const line of emojiMessages) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await conn.relayMessage(
                from,
                {
                    protocolMessage: {
                        key: loadingMessage.key,
                        type: 14,
                        editedMessage: {
                            conversation: line,
                        },
                    },
                },
                {}
            );
        }
    } catch (e) {
        console.log(e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error!* ${e.message}`, 
            sender, 
            pushname,
            "Dynamic Emoji - Error",
            "Command failed"
        );
    }
});

cmd({
    pattern: "moon",
    desc: "Displays a dynamic edit msg for fun.",
    category: "tools",
    react: "🌚",
    filename: __filename
},
async (conn, mek, m, { from, reply, sender, pushname }) => {
    try {
        const loadingMessage = await conn.sendMessage(from, { text: '🌝' });
        const emojiMessages = [
            "🌗", "🌘", "🌑", "🌒", "🌓", "🌔",
            "🌕", "🌖", "🌗", "🌘", "🌑", "🌒",
            "🌓", "🌔", "🌕", "🌖", "🌗", "🌘",
            "🌑", "🌒", "🌓", "🌔", "🌕", "🌖",
            "🌗", "🌘", "🌑", "🌒", "🌓", "🌔",
            "🌕", "🌖", "🌝🌚"
        ];

        for (const line of emojiMessages) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await conn.relayMessage(
                from,
                {
                    protocolMessage: {
                        key: loadingMessage.key,
                        type: 14,
                        editedMessage: {
                            conversation: line,
                        },
                    },
                },
                {}
            );
        }
    } catch (e) {
        console.log(e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error!* ${e.message}`, 
            sender, 
            pushname,
            "Dynamic Emoji - Error",
            "Command failed"
        );
    }
});

cmd({
    pattern: "confused",
    desc: "Displays a dynamic edit msg for fun.",
    category: "tools",
    react: "🤔",
    filename: __filename
},
async (conn, mek, m, { from, reply, sender, pushname }) => {
    try {
        const loadingMessage = await conn.sendMessage(from, { text: '🤔' });
        const emojiMessages = [
            "😕", "😟", "😵", "🤔", "😖", 
            "😲", "😦", "🤷", "🤷‍♂️", "🤷‍♀️"
        ];

        for (const line of emojiMessages) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await conn.relayMessage(
                from,
                {
                    protocolMessage: {
                        key: loadingMessage.key,
                        type: 14,
                        editedMessage: {
                            conversation: line,
                        },
                    },
                },
                {}
            );
        }
    } catch (e) {
        console.log(e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error!* ${e.message}`, 
            sender, 
            pushname,
            "Dynamic Emoji - Error",
            "Command failed"
        );
    }
});

cmd({
    pattern: "hot",
    desc: "Displays a dynamic edit msg for fun.",
    category: "tools",
    react: "💋",
    filename: __filename
},
async (conn, mek, m, { from, reply, sender, pushname }) => {
    try {
        const loadingMessage = await conn.sendMessage(from, { text: '💋' });
        const emojiMessages = [
            "🥵", "❤️", "💋", "😫", "🤤", 
            "😋", "🥵", "🥶", "🙊", "😻", 
            "🙈", "💋", "🫂", "🫀", "👅", 
            "👄", "💋"
        ];

        for (const line of emojiMessages) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await conn.relayMessage(
                from,
                {
                    protocolMessage: {
                        key: loadingMessage.key,
                        type: 14,
                        editedMessage: {
                            conversation: line,
                        },
                    },
                },
                {}
            );
        }
    } catch (e) {
        console.log(e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error!* ${e.message}`, 
            sender, 
            pushname,
            "Dynamic Emoji - Error",
            "Command failed"
        );
    }
});

cmd({
    pattern: "nikal",
    desc: "Displays a dynamic edit msg for fun.",
    category: "tools",
    react: "🗿",
    filename: __filename
},
async (conn, mek, m, { from, reply, sender, pushname }) => {
    try {
        const loadingMessage = await conn.sendMessage(from, { text: 'NJABULO UI🗿' });
        
        const asciiMessages = [
            "⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀\n ⠀⣴⠿⠏⠀⠀⠀⠀⠀     ⢳⡀⠀⡏⠀⠀⠀   ⠀  ⢷\n⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀   ⣧⠀⢸⠀⠀⠀  ⠀    ⡇\n⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲     ⣿  ⣸   Nikal   ⡇\n ⣟⣿⡭⠀⠀⠀⠀⠀⢱⠀⠀      ⣿  ⢹⠀          ⡇\n  ⠙⢿⣯⠄⠀⠀⠀__⠀   ⠀   ⡿ ⠀⡇⠀⠀⠀⠀    ⡼\n⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀⡴⠃⠀   ⠘⠤⣄⣠⠞⠀\n⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀\n⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀\n⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀ ⠀⣄⢸⠀⠀⠀⠀⠀⠀", 
            "⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀\n ⠀⣴⠿⠏⠀⠀⠀⠀⠀  ⠀  ⢳⡀⠀⡏⠀⠀⠀   ⠀  ⢷\n⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀   ⣧⠀⢸⠀⠀⠀       ⡇\n⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲     ⣿  ⣸   Lavde   ⡇\n ⣟⣿⡭⠀⠀⠀⠀⠀⢱⠀⠀      ⣿  ⢹⠀          ⡇\n  ⠙⢿⣯⠄⠀⠀|__|⠀⠀   ⡿ ⠀⡇⠀⠀⠀⠀    ⡼\n⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀⡴⠃⠀   ⠘⠤⣄⣠⠞⠀\n⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀\n⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀\n⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀ ⠀⣄⢸⠀⠀⠀⠀⠀⠀", 
            "⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀\n ⠀⣴⠿⠏⠀⠀     ⠀   ⢳⡀⠀⡏⠀⠀    ⠀  ⢷\n⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀   ⣧⠀⢸⠀⠀⠀⠀      ⡇\n⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲    ⣿  ⣸   Pehli   ⡇\n ⣟⣿⡭⠀⠀⠀⠀⠀⢱⠀⠀     ⣿  ⢹⠀           ⡇\n  ⠙⢿⣯⠄⠀⠀(P)⠀⠀     ⡿ ⠀⡇⠀⠀⠀⠀    ⡼\n⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀⡴⠃⠀   ⠘⠤⣄⣠⠞⠀\n⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀\n⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀\n⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀ ⠀⣄⢸⠀⠀⠀⠀⠀⠀", 
            "⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀\n ⠀⣴⠿⠏⠀⠀     ⠀   ⢳⡀⠀⡏⠀⠀    ⠀  ⢷\n⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀   ⣧⠀⢸⠀   ⠀     ⡇\n⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲    ⣿  ⣸  Fursat  ⡇\n ⣟⣿⡭⠀⠀⠀⠀⠀⢱⠀        ⣿  ⢹⠀          ⡇\n  ⠙⢿⣯⠄⠀⠀⠀__ ⠀  ⠀   ⡿ ⠀⡇⠀⠀⠀⠀    ⡼\n⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀⡴⠃⠀   ⠘⠤⣄⣠⠞⠀\n⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀\n⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀\n⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀ ⠀⣄⢸⠀⠀⠀⠀⠀⠀", 
            "⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀\n ⠀⣴⠿⠏⠀⠀⠀⠀⠀      ⢳⡀⠀⡏⠀⠀    ⠀  ⢷\n⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀   ⣧⠀⢸⠀⠀ ⠀      ⡇\n⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲    ⣿  ⣸  Meeee   ⡇\n ⣟⣿⡭⠀⠀⠀⠀⠀⢱⠀⠀       ⣿  ⢹⠀          ⡇\n  ⠙⢿⣯⠄⠀⠀|__| ⠀    ⡿ ⠀⡇⠀⠀⠀⠀    ⡼\n⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀⡴⠃⠀   ⠘⠤⣄⣠⠞⠀\n⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀\n⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀\n⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀ ⠀⣄⢸⠀⠀⠀⠀⠀⠀", 
            "⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀\n ⠀⣴⠿⠏⠀⠀⠀⠀   ⠀  ⠀⢳⡀⠀⡏⠀⠀       ⢷\n⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀   ⣧⠀⢸⠀  ⠀       ⡇\n⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲   ⣿  ⣸   Nikal   ⡇\n ⣟⣿⡭⠀⠀⠀⠀⠀⢱⠀       ⣿  ⢹⠀           ⡇\n  ⠙⢿⣯⠄⠀⠀lodu⠀⠀   ⡿ ⠀⡇⠀⠀⠀⠀   ⡼\n⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀  ⡴⠃⠀   ⠘⠤⣄⣠⠞⠀\n⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀\n⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀\n⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀ ⠀⣄⢸⠀"
        ];

        for (const asciiMessage of asciiMessages) {
            await new Promise(resolve => setTimeout(resolve, 500));
            await conn.relayMessage(
                from,
                {
                    protocolMessage: {
                        key: loadingMessage.key,
                        type: 14,
                        editedMessage: {
                            conversation: asciiMessage,
                        },
                    },
                },
                {}
            );
        }
    } catch (e) {
        console.log(e);
        await sendFormattedMessage(
            conn, 
            from, 
            `❌ *Error!* ${e.message}`, 
            sender, 
            pushname,
            "Dynamic Ascii - Error",
            "Command failed"
        );
    }
});
