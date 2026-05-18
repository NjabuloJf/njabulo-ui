const fs = require('fs');
const path = require('path');
const config = require('../config');
const { fana } = require('../njabulo');

// Auto recording presence
fana({
    on: "body",
    fromMe: false,
    filename: __filename
}, async (conn, mek, args, { from, body, isOwner }) => {
    try {
        if (config.AUTO_RECORDING === 'true') {
            await conn.sendPresenceUpdate('recording', from);
        }
    } catch (error) {
        console.error("Auto-recording error:", error);
        // Silent fail - no need to spam errors for this feature
    }
});
