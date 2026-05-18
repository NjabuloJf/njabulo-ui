
const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "", 
AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN || "true",
AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || "false", 
AUTO_STATUS_REACT: process.env.AUTO_STATUS_REACT || "true", 
AUTO_STATUS_MSG: process.env.AUTO_STATUS_MSG || "*SEEN YOUR STATUS BY NJABULO JB🤍*",  
WELCOME: process.env.WELCOME || "false",    
ADMIN_EVENTS: process.env.ADMIN_EVENTS || "false",
ANTI_LINK: process.env.ANTI_LINK || "false", 
MENTION_REPLY: process.env.MENTION_REPLY || "false", 
MENU_IMAGE_URL: process.env.MENU_IMAGE_URL || "https://files.catbox.moe/0mmreh.jpg",
PREFIX: process.env.PREFIX || ".",   
BOT_NAME: process.env.BOT_NAME || "Njabulo Jb",
STICKER_NAME: process.env.STICKER_NAME || "Njabulo Jb", 
CUSTOM_REACT: process.env.CUSTOM_REACT || "false",    
CUSTOM_REACT_EMOJIS: process.env.CUSTOM_REACT_EMOJIS || "💝,💖,💗,❤️‍🩹,❤️,🧡,💛,💚,💙,💜,🤎,🖤,🤍",
OWNER_NUMBER: process.env.OWNER_NUMBER || "26777821911",
OWNER_NAME: process.env.OWNER_NAME || "NjabuloJb",
DESCRIPTION: process.env.DESCRIPTION || "> *✆︎Pσɯҽɾҽԃ Ⴆყ NנɐႦυℓσ נႦ*",    
ALIVE_IMG: process.env.ALIVE_IMG || "https://files.catbox.moe/0ikqoy.jpg",
LIVE_MSG: process.env.LIVE_MSG || "> Zinda Hun Yar *Njabulo Jb*⚡", 
READ_MESSAGE: process.env.READ_MESSAGE || "false",
AUTO_REACT: process.env.AUTO_REACT || "false",
ANTI_BAD: process.env.ANTI_BAD || "false",  
MODE: process.env.MODE || "public", 
NEWSLETTER: process.env.NEWSLETTER || "120363424849971461@newsletter",
NJABULOURL: process.env.NJABULOURL || "https://njabulobot.vercel.app",
FANAIMG: process.env.FANAIMG || "https://files.catbox.moe/0ikqoy.jpg",
ANTI_LINK_KICK: process.env.ANTI_LINK_KICK || "true", 
AUTO_VOICE: process.env.AUTO_VOICE || "false",
AUTO_STICKER: process.env.AUTO_STICKER || "false", 
AUTO_REPLY: process.env.AUTO_REPLY || "false", 
ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || "false", 
PUBLIC_MODE: process.env.PUBLIC_MODE || "true",
AUTO_TYPING: process.env.AUTO_TYPING || "false",   
READ_CMD: process.env.READ_CMD || "false",
// true if want mark commands as read 
DEV: process.env.DEV || "26777821911",
//replace with your whatsapp number        
ANTI_VV: process.env.ANTI_VV || "true",
// true for anti once view 
ANTI_DEL_PATH: process.env.ANTI_DEL_PATH || "log", 
// change it to 'same' if you want to resend deleted message in same chat 
AUTO_RECORDING: process.env.AUTO_RECORDING || "false"
// make it true for auto recoding 
};
