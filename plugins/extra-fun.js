const { cmd } = require("../command");
const config = require('../config');

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
                    body: externalBody || "Fun Commands",
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
  pattern: "compatibility",
  alias: ["friend", "fcheck"],
  desc: "Calculate the compatibility score between two users.",
  category: "fun",
  react: "💖",
  filename: __filename,
  use: "@tag1 @tag2",
}, async (conn, mek, m, { args, reply, sender, pushname }) => {
  try {
    if (args.length < 2) {
      await sendFormattedMessage(
        conn, 
        mek.chat, 
        "💖 *Please mention two users to calculate compatibility*\n\n📌 *Usage:* .compatibility @user1 @user2", 
        sender, 
        pushname,
        "Compatibility - Error",
        "Missing users"
      );
      return;
    }

    let user1 = m.mentionedJid[0]; 
    let user2 = m.mentionedJid[1]; 

    const specialNumber = config.DEV ? `${config.DEV}@s.whatsapp.net` : null;

    let compatibilityScore = Math.floor(Math.random() * 1000) + 1;

    if (user1 === specialNumber || user2 === specialNumber) {
      compatibilityScore = 1000;
      await sendFormattedMessage(
        conn, 
        mek.chat, 
        `💖 *Compatibility Result* 💖\n\n@${user1.split('@')[0]} ❤️ @${user2.split('@')[0]}\n\n📊 *Score:* ${compatibilityScore}+/1000\n\n✨ *Special Match!* ✨`, 
        sender, 
        pushname,
        "Compatibility Test",
        "Special score"
      );
      return;
    }

    let loveMessage = "";
    if (compatibilityScore >= 900) loveMessage = "💖 *Perfect match!* Soulmates detected!";
    else if (compatibilityScore >= 700) loveMessage = "😍 *Great compatibility!* Strong bond!";
    else if (compatibilityScore >= 500) loveMessage = "😊 *Good connection!* Can work out!";
    else if (compatibilityScore >= 300) loveMessage = "🤔 *It's complicated!* Needs effort!";
    else loveMessage = "💔 *Not the best match!* Maybe just friends!";

    await sendFormattedMessage(
      conn, 
      mek.chat, 
      `💖 *Compatibility Result* 💖\n\n@${user1.split('@')[0]} ❤️ @${user2.split('@')[0]}\n\n📊 *Score:* ${compatibilityScore}/1000\n\n${loveMessage}`, 
      sender, 
      pushname,
      "Compatibility Test",
      `${compatibilityScore}/1000`
    );

  } catch (error) {
    console.log(error);
    await sendFormattedMessage(
      conn, 
      mek.chat, 
      `❌ *Error:* ${error.message}`, 
      sender, 
      pushname,
      "Error",
      "Command failed"
    );
  }
});

cmd({
  pattern: "aura",
  desc: "Calculate aura score of a user.",
  category: "fun",
  react: "💀",
  filename: __filename,
  use: "@tag",
}, async (conn, mek, m, { args, reply, sender, pushname }) => {
  try {
    if (args.length < 1) {
      await sendFormattedMessage(
        conn, 
        mek.chat, 
        "💀 *Please mention a user to calculate their aura*\n\n📌 *Usage:* .aura @user", 
        sender, 
        pushname,
        "Aura - Error",
        "Missing user"
      );
      return;
    }

    let user = m.mentionedJid[0]; 
    const specialNumber = config.DEV ? `${config.DEV}@s.whatsapp.net` : null;

    let auraScore = Math.floor(Math.random() * 1000) + 1;

    if (user === specialNumber) {
      auraScore = 999999;
      await sendFormattedMessage(
        conn, 
        mek.chat, 
        `💀 *Aura Result* 💀\n\n👤 @${user.split('@')[0]}\n\n📊 *Score:* ${auraScore}+\n\n🗿 *Legendary Aura!* 🗿`, 
        sender, 
        pushname,
        "Aura Test",
        "Legendary"
      );
      return;
    }

    let auraMessage = "";
    if (auraScore >= 900) auraMessage = "💫 *Godly Aura!* Truly legendary!";
    else if (auraScore >= 700) auraMessage = "✨ *Strong Aura!* Very impressive!";
    else if (auraScore >= 500) auraMessage = "🌟 *Decent Aura!* Keep going!";
    else if (auraScore >= 300) auraMessage = "⚡ *Average Aura!* Room for improvement!";
    else auraMessage = "🍂 *Weak Aura!* Time for a glow up!";

    await sendFormattedMessage(
      conn, 
      mek.chat, 
      `💀 *Aura Result* 💀\n\n👤 @${user.split('@')[0]}\n\n📊 *Score:* ${auraScore}/1000\n\n${auraMessage}`, 
      sender, 
      pushname,
      "Aura Test",
      `${auraScore}/1000`
    );

  } catch (error) {
    console.log(error);
    await sendFormattedMessage(
      conn, 
      mek.chat, 
      `❌ *Error:* ${error.message}`, 
      sender, 
      pushname,
      "Error",
      "Command failed"
    );
  }
});

cmd({
    pattern: "roast",
    desc: "Roast someone in Hindi",
    category: "fun",
    react: "🔥",
    filename: __filename,
    use: "@tag"
}, async (conn, mek, m, { q, reply, sender, pushname }) => {
    let roasts = [
        "Abe bhai, tera IQ wifi signal se bhi kam hai!",
        "Bhai, teri soch WhatsApp status jaisi hai, 24 ghante baad gayab ho jaati hai!",
        "Abe sochta kitna hai, tu kya NASA ka scientist hai?",
        "Abe tu hai kaun? Google pe search karne se bhi tera naam nahi aata!",
        "Tera dimaag 2G network pe chal raha hai kya?",
        "Itna overthink mat kar bhai, teri battery jaldi down ho jayegi!",
        "Teri soch cricket ke match jaisi hai, baarish aate hi band ho jati hai!",
        "Tu VIP hai, 'Very Idiotic Person'!",
        "Tera style bilkul WiFi password ki tarah hai, sabko pata nahi!",
        "Bhai, teri soch ke liye ek dedicated server hona chahiye!",
        "Tere jokes bhi software update ki tarah hote hain, baar-baar lagte hain par kaam nahi karte!"
    ];                
        
    let randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
    let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);

    if (!mentionedUser) {
        await sendFormattedMessage(
            conn, 
            mek.chat, 
            "🔥 *Please mention a user to roast*\n\n📌 *Usage:* .roast @user", 
            sender, 
            pushname,
            "Roast - Error",
            "Missing user"
        );
        return;
    }

    let target = `@${mentionedUser.split("@")[0]}`;
    let message = `${target}\n\n🔥 *${randomRoast}*\n\n> *This is all for fun, don't take it seriously!*`;

    await sendFormattedMessage(
        conn, 
        mek.chat, 
        message, 
        sender, 
        pushname,
        "Roast Command",
        "🔥 Roasted!"
    );
});

cmd({
    pattern: "8ball",
    desc: "Magic 8-Ball gives answers",
    category: "fun",
    react: "🎱",
    filename: __filename
}, 
async (conn, mek, m, { from, q, reply, sender, pushname }) => {
    if (!q) {
        await sendFormattedMessage(
            conn, 
            from, 
            "🎱 *Ask a yes/no question!*\n\n📌 *Usage:* .8ball Will I be rich?", 
            sender, 
            pushname,
            "8Ball - Error",
            "No question"
        );
        return;
    }
    
    let responses = [
        "✅ Yes!", "❌ No.", "🤔 Maybe...", "💯 Definitely!", 
        "❓ Not sure.", "🔄 Ask again later.", "🚫 I don't think so.", 
        "😎 Absolutely!", "😤 No way!", "📈 Looks promising!"
    ];
    
    let answer = responses[Math.floor(Math.random() * responses.length)];
    
    await sendFormattedMessage(
        conn, 
        from, 
        `🎱 *Magic 8-Ball says:*\n\n${answer}`, 
        sender, 
        pushname,
        "Magic 8Ball",
        `Question: ${q.substring(0, 50)}`
    );
});

cmd({
    pattern: "compliment",
    desc: "Give a nice compliment",
    category: "fun",
    react: "😊",
    filename: __filename,
    use: "@tag (optional)"
}, async (conn, mek, m, { reply, sender, pushname }) => {
    let compliments = [
        "You're amazing just the way you are! 💖",
        "You light up every room you walk into! 🌟",
        "Your smile is contagious! 😊",
        "You're a genius in your own way! 🧠",
        "You bring happiness to everyone around you! 🥰",
        "You're like a human sunshine! ☀️",
        "Your kindness makes the world a better place! ❤️",
        "You're unique and irreplaceable! ✨",
        "You're a great listener and a wonderful friend! 🤗",
        "Your positive vibes are truly inspiring! 💫",
        "You're stronger than you think! 💪"
    ];

    let randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
    let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
    let target = mentionedUser ? `@${mentionedUser.split("@")[0]}` : "";

    let message = mentionedUser 
        ? `😊 *Compliment for* ${target}\n\n💖 ${randomCompliment}`
        : `😊 *Here's a compliment for you!*\n\n💖 ${randomCompliment}`;

    await sendFormattedMessage(
        conn, 
        mek.chat, 
        message, 
        sender, 
        pushname,
        "Compliment",
        "💖 Kind words"
    );
});

cmd({
    pattern: "lovetest",
    desc: "Check love compatibility between two users",
    category: "fun",
    react: "❤️",
    filename: __filename,
    use: "@tag1 @tag2"
}, async (conn, mek, m, { args, reply, sender, pushname }) => {
    if (args.length < 2) {
        await sendFormattedMessage(
            conn, 
            mek.chat, 
            "❤️ *Please mention two users to test love compatibility*\n\n📌 *Usage:* .lovetest @user1 @user2", 
            sender, 
            pushname,
            "Love Test - Error",
            "Missing users"
        );
        return;
    }

    let user1 = args[0].replace("@", "") + "@s.whatsapp.net";
    let user2 = args[1].replace("@", "") + "@s.whatsapp.net";

    let lovePercent = Math.floor(Math.random() * 100) + 1;

    let loveMessage = "";
    if (lovePercent >= 90) loveMessage = "💖 *A match made in heaven!* True love exists!";
    else if (lovePercent >= 75) loveMessage = "😍 *Strong connection!* This love is deep and meaningful!";
    else if (lovePercent >= 50) loveMessage = "😊 *Good compatibility!* You both can make it work!";
    else if (lovePercent >= 30) loveMessage = "🤔 *It's complicated!* Needs effort, but possible!";
    else if (lovePercent >= 10) loveMessage = "😅 *Not the best match!* Maybe try being just friends?";
    else loveMessage = "💔 *Uh-oh!* This love is not meant to be!";

    let message = `💘 *Love Compatibility Test* 💘\n\n❤️ @${user1.split('@')[0]} + @${user2.split('@')[0]}\n\n📊 *Love Score:* ${lovePercent}%\n\n${loveMessage}`;

    await sendFormattedMessage(
        conn, 
        mek.chat, 
        message, 
        sender, 
        pushname,
        "Love Test",
        `${lovePercent}% compatible`
    );
}); 

cmd({
    pattern: "emoji",
    desc: "Convert text into emoji form.",
    category: "fun",
    react: "🙂",
    filename: __filename,
    use: "<text>"
}, async (conn, mek, m, { args, q, reply, sender, pushname }) => {
    try {
        let text = args.join(" ");
        
        let emojiMapping = {
            "a": "🅰️", "b": "🅱️", "c": "🇨️", "d": "🇩️", "e": "🇪️", "f": "🇫️", "g": "🇬️",
            "h": "🇭️", "i": "🇮️", "j": "🇯️", "k": "🇰️", "l": "🇱️", "m": "🇲️", "n": "🇳️",
            "o": "🅾️", "p": "🇵️", "q": "🇶️", "r": "🇷️", "s": "🇸️", "t": "🇹️", "u": "🇺️",
            "v": "🇻️", "w": "🇼️", "x": "🇽️", "y": "🇾️", "z": "🇿️",
            "0": "0️⃣", "1": "1️⃣", "2": "2️⃣", "3": "3️⃣", "4": "4️⃣",
            "5": "5️⃣", "6": "6️⃣", "7": "7️⃣", "8": "8️⃣", "9": "9️⃣",
            " ": "␣",
        };

        if (!text) {
            await sendFormattedMessage(
                conn, 
                mek.chat, 
                "🙂 *Please provide some text to convert into emojis!*\n\n📌 *Usage:* .emoji hello world", 
                sender, 
                pushname,
                "Emoji Convert - Error",
                "No text"
            );
            return;
        }

        let emojiText = text.toLowerCase().split("").map(char => emojiMapping[char] || char).join("");

        await sendFormattedMessage(
            conn, 
            mek.chat, 
            `🔤 *Text to Emoji*\n\n📝 *Original:* ${text}\n\n🎨 *Emoji Form:*\n${emojiText}`, 
            sender, 
            pushname,
            "Emoji Converter",
            `Converted: ${text.substring(0, 30)}`
        );

    } catch (error) {
        console.log(error);
        await sendFormattedMessage(
            conn, 
            mek.chat, 
            `❌ *Error:* ${error.message}`, 
            sender, 
            pushname,
            "Error",
            "Command failed"
        );
    }
});
