# 🚀 AI Features Setup Guide

## Required API Keys

### 1. OpenAI API Key (Required for AI Features)

**Step 1: Get Your API Key**
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign up or log in to your account
3. Navigate to "API Keys" in the left sidebar
4. Click "Create new secret key"
5. Copy the key (starts with `sk-...`)
6. **Important**: Add billing information (required even for free tier)

**Step 2: Add Key to Configuration**
1. Open `ai-config.js` in your project
2. Replace `'sk-YOUR_ACTUAL_OPENAI_KEY_HERE'` with your actual key:
   ```javascript
   OPENAI_API_KEY: 'sk-your-actual-key-here',
   ```
3. Save the file

**Step 3: Test the Setup**
1. Refresh your browser (http://localhost:3000)
2. Try the AI Natural Language Search
3. Check browser console for confirmation messages

## AI Features Overview

### Currently Enabled:
- ✅ **Natural Language Search** - "Find 3 bedroom homes under 400k in Austin"
- ✅ **Smart Recommendations** - Personalized property scoring
- ✅ **Market Intelligence** - Market analysis and trends
- ✅ **Auto Search Assistant** - Saved searches and notifications  
- ✅ **Investment Analyzer** - ROI and cash flow analysis
- ✅ **Neighborhood Insights** - Area analysis and demographics

### Cost Information:
- **OpenAI API Cost**: ~$0.002 per request (very cheap!)
- **Monthly Budget**: Set to $25 max in config
- **Typical Usage**: <$5/month for heavy testing

## Troubleshooting

### "API key not configured" messages:
1. Check that you added your actual OpenAI key to `ai-config.js`
2. Ensure the key starts with `sk-`
3. Refresh the browser after updating config
4. Check browser console for detailed error messages

### AI features not working:
1. Verify API key is valid at [OpenAI Platform](https://platform.openai.com/usage)
2. Check that you have billing set up
3. Ensure features are enabled in `ai-config.js`
4. Look for error messages in browser console

### Fallback Mode:
- If API key is missing, the system uses enhanced fallback parsing
- Still provides good search functionality without AI
- Console will show "Using enhanced fallback parser"

## Testing the Features

1. **Natural Language Search**: Try "luxury condos under 500k in Miami"
2. **Smart Recommendations**: Search properties and see AI scoring
3. **Market Intelligence**: View market analysis for any search results
4. **Investment Analysis**: Click on properties to see ROI analysis

## Security Note

- Never commit your actual API keys to version control
- Keep `ai-config.js` in `.gitignore` for production use
- API keys should be environment variables in production

## Need Help?

Check the browser console (F12 → Console) for detailed logging and error messages.