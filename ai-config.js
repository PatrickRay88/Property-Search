// AI Configuration with Feature Toggles
const AI_CONFIG = {
    // API Keys - Add your actual keys here
    OPENAI_API_KEY: 'sk-YOUR_ACTUAL_OPENAI_KEY_HERE',  // Replace with your OpenAI API key
    GEMINI_API_KEY: 'your_gemini_api_key_here',        // Optional - for future use 
    
    // Feature Toggle Settings
    FEATURES: {
        NATURAL_LANGUAGE_SEARCH: true,
        SMART_RECOMMENDATIONS: true,
        MARKET_INTELLIGENCE: true,     // Now enabled
        AUTO_SEARCH: true,            // Now enabled  
        INVESTMENT_ANALYZER: true,    // Now enabled
        NEIGHBORHOOD_INSIGHTS: true   // Now enabled
    },
    
    // Cost and Usage Tracking
    USAGE_TRACKING: true,
    MAX_MONTHLY_COST: 25.00, // Dollar limit
    COST_ALERTS: true,
    
    // Performance Settings
    AI_MODEL_PREFERENCE: 'gpt-3.5-turbo', // Faster and cheaper
    CACHE_RESPONSES: true,
    RESPONSE_TIMEOUT: 10000 // 10 seconds
};

// Make config available globally
window.AI_CONFIG = AI_CONFIG;