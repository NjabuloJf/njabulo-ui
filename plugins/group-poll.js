const { cmd, commands } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;
const fs = require('fs');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions2');
const { writeFileSync } = require('fs');
const path = require('path');

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
                    body: externalBody || "Poll Creator",
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
  pattern: "poll",
  alias: ["createpoll", "makevote", "vote"],
  category: "group",
  desc: "Create a poll with a question and options in the group.",
  filename: __filename,
}, async (conn, mek, m, { from, isGroup, body, sender, groupMetadata, participants, prefix, pushname, reply }) => {
  try {
    if (!body) {
      await sendFormattedMessage(
        conn, 
        from, 
        `📊 *Create a Poll*\n\n📌 *Usage:* ${prefix}poll question;option1,option2,option3\n\n🔍 *Example:* ${prefix}poll What's your favorite color?;Red,Blue,Green,Yellow\n\n💡 *Separate options with commas*`, 
        sender, 
        pushname,
        "Poll Creator - Error",
        "No input"
      );
      return;
    }

    let [question, optionsString] = body.split(";");
    
    if (!question) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *Please provide a question*\n\n📌 *Example:* .poll What is your favorite food?;Pizza,Burger,Pasta", 
        sender, 
        pushname,
        "Poll Creator - Error",
        "No question"
      );
      return;
    }
    
    if (!optionsString) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *Please provide options*\n\n📌 *Example:* .poll Best programming language?;JavaScript,Python,Java,C++", 
        sender, 
        pushname,
        "Poll Creator - Error",
        "No options"
      );
      return;
    }

    let options = [];
    for (let option of optionsString.split(",")) {
      if (option && option.trim() !== "") {
        options.push(option.trim());
      }
    }

    if (options.length < 2) {
      await sendFormattedMessage(
        conn, 
        from, 
        "❌ *Please provide at least two options*\n\n📊 You need at least 2 choices for the poll.\n\n📌 *Example:* .poll Question;Option1,Option2", 
        sender, 
        pushname,
        "Poll Creator - Error",
        "Not enough options"
      );
      return;
    }

    if (options.length > 12) {
      await sendFormattedMessage(
        conn, 
        from, 
        "⚠️ *Too many options*\n\nMaximum 12 options allowed.\n\nYou provided " + options.length + " options.", 
        sender, 
        pushname,
        "Poll Creator - Warning",
        "Options limit exceeded"
      );
      return;
    }

    await sendFormattedMessage(
      conn, 
      from, 
      `📊 *Creating poll...*\n\n📋 *Question:* ${question}\n🔘 *Options:* ${options.length}\n⏳ Please wait!`, 
      sender, 
      pushname,
      "Poll Creator",
      "Creating poll"
    );

    await conn.sendMessage(from, {
      poll: {
        name: question,
        values: options,
        selectableCount: 1,
        toAnnouncementGroup: false,
      }
    }, { quoted: mek });
    
  } catch (e) {
    console.error("Poll error:", e);
    await sendFormattedMessage(
      conn, 
      from, 
      `❌ *An error occurred*\n\n${e.message}\n\nPlease try again later.`, 
      sender, 
      pushname,
      "Poll Creator - Error",
      "Creation failed"
    );
  }
});
