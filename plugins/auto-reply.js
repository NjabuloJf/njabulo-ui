const axios = require('axios');
const config = require('../config');
const fs = require('fs');
const path = require('path');
const { fana } = require('../njabulo');

// GitHub RAW JSON URL for auto-reply data
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/NjabuloJf/njabulo-data/main/autoreply.json';

// Cache for auto-reply data to reduce API calls
let autoReplyCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getAutoReplyData() {
    const now = Date.now();
    
    // Return cached data if still valid
    if (autoReplyCache && (now - lastFetchTime) < CACHE_DURATION) {
        return autoReplyCache;
    }
    
    try {
        const res = await axios.get(GITHUB_RAW_URL, { timeout: 5000 });
        autoReplyCache = res.data;
        lastFetchTime = now;
        console.log('Auto-reply data fetched successfully');
        return autoReplyCache;
    } catch (err) {
        console.error('Auto-reply fetch error:', err.message);
        // Return cached data if available, otherwise empty object
        return autoReplyCache || {};
    }
}

// Auto-reply system
fana({
    on: "body",
    fromMe: false,
    filename: __filename
}, async (conn, mek, args, { body, reply, from, sender }) => {
    try {
        if (config.AUTO_REPLY !== 'true') return;
        
        const data = await getAutoReplyData();
        
        // Check for exact match or keyword match
        for (const keyword in data) {
            const keywordLower = keyword.toLowerCase();
            const bodyLower = body.toLowerCase();
            
            if (bodyLower === keywordLower || bodyLower.includes(keywordLower)) {
                // Add reaction to show auto-reply triggered
                await conn.sendMessage(from, { react: { text: "🤖", key: mek.key } });
                
                // Send the auto-reply message
                await reply(data[keyword]);
                
                // Break after first match
                break;
            }
        }
    } catch (err) {
        console.error('Auto-reply error:', err.message);
        // Silent fail - don't spam users with errors
    }
});
