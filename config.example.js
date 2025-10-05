// Example configuration file (template)
// Copy this file to config.js and add your actual API keys
const CONFIG = {
    RENTCAST_API_KEY: 'your_rentcast_api_key_here' // Get your API key from RentCast
};

// AI Configuration Example
const AI_CONFIG = {
    // Add your AI API keys here
    OPENAI_API_KEY: 'your_openai_api_key_here', // Get from https://openai.com/
    GEMINI_API_KEY: 'your_gemini_api_key_here', // Get from https://makersuite.google.com/
    
    // Feature Toggle Settings (customize which AI features to enable)
    FEATURES: {
        NATURAL_LANGUAGE_SEARCH: true,    // Convert plain English to search parameters
        SMART_RECOMMENDATIONS: true,      // Learn preferences and suggest properties
        MARKET_INTELLIGENCE: false,      // Analyze market trends (requires additional data)
        AUTO_SEARCH: false,              // Background search with notifications
        INVESTMENT_ANALYZER: false,      // ROI and investment analysis
        NEIGHBORHOOD_INSIGHTS: false     // Area analysis and scoring
    },
    
    // Cost Management
    USAGE_TRACKING: true,
    MAX_MONTHLY_COST: 25.00,           // Dollar limit per month
    COST_ALERTS: true,
    
    // Performance Settings
    AI_MODEL_PREFERENCE: 'gpt-3.5-turbo', // Options: 'gpt-3.5-turbo', 'gpt-4'
    CACHE_RESPONSES: true,
    RESPONSE_TIMEOUT: 10000            // 10 seconds
};

// Make configurations available globally
window.CONFIG = CONFIG;
window.AI_CONFIG = AI_CONFIG;