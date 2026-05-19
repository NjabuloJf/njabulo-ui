const config = require('../config');
const { cmd, commands } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');

cmd({
    pattern: "menu",
    desc: "Show interactive menu system",
    category: "menu",
    react: "🧾",
    filename: __filename
}, async (conn, mek, m, { from, reply, sender, pushname, userName }) => {
    try {
        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        const now = new Date();
        const hours = now.getHours();
        let greeting = "🌇Hello everyone good morning";
        if (hours >= 12 && hours < 18) greeting = "🌃it's time to say goodafternoon";
        else if (hours >= 18) greeting = "🏙️Am here good evening";

        const totalCommands = 350;

        const menuCaption = `*╭━─━─━─━─━─━─━─━⊷*
┊ ┏────────────⊷
┊ ┊▢ʙᴏᴛ ɴᴀᴍᴇ :  *ɴᴊᴀʙᴜʟᴏ ᴊʙ*
┊ ┊▢ᴅᴀᴛᴇ: ${now.toLocaleDateString()} 
┊ ┊▢ᴛɪᴍᴇ: ${now.toLocaleTimeString()}      
┊ ┊▢ᴛᴏᴛᴀʟ ᴄᴏᴍᴍᴀɴᴅs: [${totalCommands}]
┊ ┗────────────⊷
┊      ┏─────────⊷
┊      【①】• *ᴅᴏᴡɴʟᴏᴀᴅ ᴍᴇɴᴜ*
┊      【②】• *ɢʀᴏᴜᴘ ᴍᴇɴᴜ*
┊      【③】• *ʀᴇᴀᴄᴛɪᴏɴs ᴍᴇɴᴜ*
┊      【④】• *ʟᴏɢᴏ ᴍᴀᴋᴇʀ*
┊      【⑤】• *ᴏᴡɴᴇʀ ᴍᴇɴᴜ*
┊      【⑥】• *ғᴜɴ ᴍᴇɴᴜ*
┊      【⑦】• *ᴄᴏɴᴠᴇʀᴛ ᴍᴇɴᴜ*
┊      【⑧】• *ᴀɪ ᴍᴇɴᴜ* 
┊      【⑨】• *ᴍᴀɪɴ ᴍᴇɴᴜ*
┊      【⑩】• *ᴀɴɪᴍᴇ ᴍᴇɴᴜ*
┊      【⑪】• *ᴏᴛʜᴇʀ ᴍᴇɴᴜ*
┊      【⑫】• *ᴘʀɪᴠᴀᴄʏ ᴍᴇɴᴜ*
┊      【⑬】• *ᴛᴏʟs ᴍᴇɴᴜ*
┊      【⑭】• *sᴛɪᴄᴋᴇʀ ᴍᴇɴᴜ*
┊      【⑮】• *sᴇᴀʀᴄʜ ᴍᴇɴᴜ*
┊      ┗─────────⊷
╰┬━━━━━━━━━━━━⊷⳹
┌┤ *ʀᴇᴘʟʏ ɴᴀᴍᴇ ᴄᴏᴍᴀɴᴅs 1ᴛᴏ15*
┊╰─────────────⊷
*╰━─━─━─━─━─━─━─━─━⊷*`;

        const sentMsg = await conn.sendMessage(from, {
         image: { url: config.FANAIMG},    
         caption: menuCaption,
         contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: config.NEWSLETTER,
                    newsletterName: '╭••➤ɴᴊᴀʙᴜʟᴏ ᴜɪ',
                    serverMessageId: 143
                }, 
             forwardingScore: 999,
                externalAdReply: {
                    title: "ɴᴊᴀʙᴜʟᴏ ᴜɪ",
                    body: greeting,
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
                        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${userName || "User"};USER;;;\nFN:${userName || "User"}\nitm1.TEL;waid=${sender?.split('@')[0] || '0'}:${sender?.split('@')[0] || '0'}\nitem1.X-ABLabel:User\nEND:VCARD`
                    }
                }
            }
        });




    
    await conn.sendMessage(from, {
        audio: { url: 'https://raw.githubusercontent.com/NjabuloJf/njabulo-data/main/audio/menu.mp3' },
        mimetype: 'audio/mpeg',
        ptt: false,  // ← Set to false for regular audio
        fileName: 'menu.mp3' ,// Optional: shows file name
        contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: config.NEWSLETTER,
                    newsletterName: '╭••➤ɴᴊᴀʙᴜʟᴏ ᴜɪ',
                    serverMessageId: 143
                }, 
             forwardingScore: 999,
                externalAdReply: {
                    title: "ɴᴊᴀʙᴜʟᴏ ᴜɪ",
                    body: "title njabulo song 2026 (official)",
                    thumbnailUrl: config.FANAIMG,
                    sourceUrl: config.NJABULOURL,
                    mediaType: 1,
                    renderLargerThumbnail: true,
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
                        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${userName || "User"};USER;;;\nFN:${userName || "User"}\nitm1.TEL;waid=${sender?.split('@')[0] || '0'}:${sender?.split('@')[0] || '0'}\nitem1.X-ABLabel:User\nEND:VCARD`
                    }
                }
            }
        }); 

        

        const messageID = sentMsg.key.id;

        const menuData = {
            '1': {
                title: "DOWNLOAD MENU",
                content: `━━━━━━━━━━━━━━━━━━━━━━
     DOWNLOAD MENU


• facebook / fb / fbdl
• mediafire / mfire
• tiktok / tt / tiktokdl
• twitter / twdl
• instagram / insta
• apk / apk2
• img / image
• tt2 / tiktok2
• pinterest / pin
• fb2
• spotify
• play / song
• play2
• audio
• video / mp4
• video2
• ytmp3
• ytmp4
• gdrive
• ssweb / screenshot
• tiktoksearch / tiks
• darama`
            },
            '2': {
                title: "GROUP MENU",
                content: `━━━━━━━━━━━━━━━━━━━━━━
     GROUP MENU
━━━━━━━━━━━━━━━━━━━━━━

• grouplink / invite
• kickall / removemembers
• kickall2 / removeall2
• kickall3 / removeadmins
• add
• remove / kick
• promote
• demote
• dismiss
• revoke / resetlink
• setgoodbye
• setwelcome
• delete / del
• getpic / getpp
• ginfo / groupinfo
• disappear on
• disappear off
• disappear 7D,24H
• allreq / requestlist
• updategname / setname
• updategdesc / setdesc
• joinrequests
• senddm
• nikal
• mute
• unmute
• lockgc
• unlockgc
• invite
• tag / hidetag
• tagall
• tagadmins
• out / removecc

━━━━━━━━━━━━━━━━━━━━━━
> ${config.DESCRIPTION}`
            },
            '3': {
                title: "REACTIONS MENU",
                content: `━━━━━━━━━━━━━━━━━━━━━━
     REACTIONS MENU
━━━━━━━━━━━━━━━━━━━━━━

• bully
• cuddle
• cry
• hug
• awoo
• kiss
• lick
• pat
• smug
• bonk
• yeet
• blush
• smile
• wave
• highfive
• handhold
• nom
• bite
• glomp
• slap
• kill
• happy
• wink
• poke
• dance
• cringe

━━━━━━━━━━━━━━━━━━━━━━
> ${config.DESCRIPTION}`
            },
            '4': {
                title: "LOGO MAKER",
                content: `━━━━━━━━━━━━━━━━━━━━━━
     LOGO MAKER
━━━━━━━━━━━━━━━━━━━━━━

• neonlight
• blackpink
• dragonball
• 3dcomic
• america
• naruto
• sadgirl
• clouds
• futuristic
• 3dpaper
• eraser
• sunset
• leaf
• galaxy
• sans
• boom
• hacker
• devilwings
• nigeria
• bulb
• angelwings
• zodiac
• luxury
• paint
• frozen
• castle
• tatoo
• valorant
• bear
• typography
• birthday

━━━━━━━━━━━━━━━━━━━━━━
> ${config.DESCRIPTION}`
            },
            '5': {
                title: "OWNER MENU",
                content: `━━━━━━━━━━━━━━━━━━━━━━
     OWNER MENU
━━━━━━━━━━━━━━━━━━━━━━

• owner / creator
• menu
• menu2
• vv / viewonce
• listcmd
• allmenu
• repo
• block
• unblock
• fullpp
• setpp
• restart
• shutdown
• update / upgrade
• alive / ping
• ping2
• gjid
• jid
• env / settings
• broadcast / bc
• forward / bulkforward
• savecontact / vcf

━━━━━━━━━━━━━━━━━━━━━━
> ${config.DESCRIPTION}`
            },
            '6': {
                title: "FUN MENU",
                content: `━━━━━━━━━━━━━━━━━━━━━━
     FUN MENU
━━━━━━━━━━━━━━━━━━━━━━

• shapar
• rate
• insult / roast
• hack
• ship / lovetest
• character
• pickup / pickupline
• joke
• hrt / heart
• hpy / happy
• syd / sad
• anger / angry
• shy
• kiss
• mon / moon
• cunfuzed / confused
• hand / handhold
• nikal
• hold
• hug
• hifi
• poke
• roll / dice
• coinflip
• rcolor

━━━━━━━━━━━━━━━━━━━━━━
> ${config.DESCRIPTION}`
            },
            '7': {
                title: "CONVERT MENU",
                content: `━━━━━━━━━━━━━━━━━━━━━━
     CONVERT MENU
━━━━━━━━━━━━━━━━━━━━━━

• sticker / s
• sticker2
• emix / emojimix
• fancy / font
• take / rename
• tomp3 / toaudio
• tts / speak
• trt / translate
• base64
• unbase64
• binary
• dbinary
• tiny / shorturl
• urldecode
• urlencode
• repeat
• ask
• readmore / rm
• topdf / makepdf

━━━━━━━━━━━━━━━━━━━━━━
> ${config.DESCRIPTION}`
            },
            '8': {
                title: "AI MENU",
                content: `━━━━━━━━━━━━━━━━━━━━━━
     AI MENU
━━━━━━━━━━━━━━━━━━━━━━

• ai / gpt
• gpt3 / openai
• gpt4
• gptmini
• meta
• blackbox
• luma
• dj
• khan
• jawad
• bing
• imagine / flux
• imagine2 / stablediffusion
• copilot
• deepseek

━━━━━━━━━━━━━━━━━━━━━━
> ${config.DESCRIPTION}`
            },
            '9': {
                title: "MAIN MENU",
                content: `━━━━━━━━━━━━━━━━━━━━━━
     MAIN MENU
━━━━━━━━━━━━━━━━━━━━━━

• ping
• ping2
• speed
• live
• alive
• runtime
• uptime
• repo
• owner
• menu
• menu2
• restart

━━━━━━━━━━━━━━━━━━━━━━
> ${config.DESCRIPTION}`
            },
            '10': {
                title: "ANIME MENU",
                content: `━━━━━━━━━━━━━━━━━━━━━━
     ANIME MENU
━━━━━━━━━━━━━━━━━━━━━━

• fack
• truth
• dare
• dog
• awoo
• garl
• waifu
• neko
• megumin
• maid
• loli
• animegirl
• animegirl1
• animegirl2
• animegirl3
• animegirl4
• animegirl5
• anime1
• anime2
• anime3
• anime4
• anime5
• animenews
• foxgirl
• naruto

━━━━━━━━━━━━━━━━━━━━━━
> ${config.DESCRIPTION}`
            },
            '11': {
                title: "OTHER MENU",
                content: `━━━━━━━━━━━━━━━━━━━━━━
     OTHER MENU
━━━━━━━━━━━━━━━━━━━━━━

• timenow
• date
• count
• calculate / calc
• countx
• flip / reverse
• coinflip
• rcolor / randomcolor
• roll / dice
• fact / funfact
• cpp / couplepp
• rw / randomwallpaper
• pair
• pair2
• pair3
• fancy
• logo
• define / dictionary
• news / headlines
• movie / imdb
• weather / climate
• srepo / repo
• insult
• save
• wikipedia / wiki
• gpass / password
• githubstalk / ghstalk
• yts / ytsearch
• ytv / ytvideo

━━━━━━━━━━━━━━━━━━━━━━
> ${config.DESCRIPTION}`
            },
            '12': {
                title: "PRIVACY MENU",
                content: `━━━━━━━━━━━━━━━━━━━━━━
     PRIVACY MENU
━━━━━━━━━━━━━━━━━━━━━━

• antidelete / antidel
• antilink / antilinks
• antilinkkick / kicklink
• deletelink / linksdelete
• anti-bad / antibadword
• auto-typing / autotyping
• auto-recording / autorecoding
• auto-seen / autostatusview
• auto-voice / autovoice
• auto-sticker / autosticker
• auto-reply / autoreply
• auto-react / autoreact
• read-message / autoread
• status-reply / autostatusreply
• mention-reply / mee
• setppall / profileprivacy
• setonline / onlineprivacy
• groupsprivacy / groupprivacy
• getprivacy / viewprivacy
• blocklist / blocked
• getbio / userbio
• getpp / fetchpp
• admin-events / adminevents
• welcome / welcomeset
• setprefix / prefix
• mode / setmode
• always-online / alwaysonline

━━━━━━━━━━━━━━━━━━━━━━
> ${config.DESCRIPTION}`
            },
            '13': {
                title: "TOOLS MENU",
                content: `━━━━━━━━━━━━━━━━━━━━━━
     TOOLS MENU
━━━━━━━━━━━━━━━━━━━━━━

• tempnum / fakenum
• templist / listnumbers
• otpbox / checkotp
• countryinfo / cinfo
• weather / climate
• movie / imdb
• news / headlines
• wikipedia / wiki
• ytstalk / ytinfo
• xstalk / twitterstalk
• tiktokstalk / ttstalk
• githubstalk / ghstalk
• npm / npmpackage
• timenow / time
• date / currentdate
• calculate / calc
• count / countx
• rcolor / randomcolor

━━━━━━━━━━━━━━━━━━━━━━
> ${config.DESCRIPTION}`
            },
            '14': {
                title: "STICKER MENU",
                content: `━━━━━━━━━━━━━━━━━━━━━━
     STICKER MENU
━━━━━━━━━━━━━━━━━━━━━━

• sticker / s
• take / rename
• emix / emojimix
• attp / texttosticker
• vsticker / videosticker
• gsticker
• convert / stickertoimage
• s2i / stoimg

━━━━━━━━━━━━━━━━━━━━━━
> ${config.DESCRIPTION}`
            },
            '15': {
                title: "SEARCH MENU",
                content: `━━━━━━━━━━━━━━━━━━━━━━
     SEARCH MENU
━━━━━━━━━━━━━━━━━━━━━━

• yts / ytsearch
• tiktoksearch / tiks
• wikipedia / wiki
• define / dictionary
• movie / imdb
• news / headlines
• weather / climate
• countryinfo / cinfo
• ytstalk / ytinfo
• xstalk / twitterstalk
• tiktokstalk / ttstalk
• githubstalk / ghstalk
• npm / npmpackage

━━━━━━━━━━━━━━━━━━━━━━
> ${config.DESCRIPTION}`
            }
        };

        const handler = async (msgData) => {
            const receivedMsg = msgData.messages[0];
            if (!receivedMsg?.message || !receivedMsg.key?.remoteJid) return;

            const isReplyToMenu = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;
            
            if (isReplyToMenu) {
                const receivedText = receivedMsg.message.conversation || 
                                  receivedMsg.message.extendedTextMessage?.text;
                const senderID = receivedMsg.key.remoteJid;

                await conn.sendMessage(senderID, { react: { text: '⏳', key: receivedMsg.key } });

                if (menuData[receivedText]) {
                    const selectedMenu = menuData[receivedText];
                    
               await conn.sendMessage(senderID, {
                text: selectedMenu.content,
                contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: config.NEWSLETTER,
                    newsletterName: '╭••➤ɴᴊᴀʙᴜʟᴏ ᴜɪ',
                    serverMessageId: 143
                },
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

                    await conn.sendMessage(senderID, { react: { text: '✅', key: receivedMsg.key } });

                } else if (receivedText >= 1 && receivedText <= 15) {
                    await conn.sendMessage(senderID, {
                        text: `Invalid Option!\n\nPlease reply with a number between 1-15 to select a menu.\n\nExample: Reply with "1" for Download Menu\n\n> ${config.DESCRIPTION}`,
                        contextInfo: {
                            mentionedJid: [m.sender],
                            forwardingScore: 999,
                            isForwarded: true
                        }
                    }, { quoted: receivedMsg });
                    await conn.sendMessage(senderID, { react: { text: '❌', key: receivedMsg.key } });
                }
            }
        };

        conn.ev.on("messages.upsert", handler);

        setTimeout(() => {
            conn.ev.off("messages.upsert", handler);
        }, 300000);

    } catch (e) {
        console.error('Menu Error:', e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(`Error: ${e.message}`);
    }
});
