# Property Search Filter

> **⚠️ DEVELOPMENT STATUS DISCLAIMER**
> 
> **This project is actively under development.** While core functionality is stable, some advanced features are still being implemented and tested.
>
> **✅ STABLE & READY TO USE:**
> - ✅ **RentCast API Integration** - Fully functional property search
> - ✅ **Property Search & Display** - Search by city/state, view detailed listings
> - ✅ **Pagination System** - Navigate through results (10 or 50 per page)
> - ✅ **Responsive UI** - Clean, mobile-friendly interface
> - ✅ **API Key Management** - Secure configuration system
>
> **🚧 AI FEATURES (EXPERIMENTAL):**
> - 🔧 **Natural Language Search** - Framework ready, requires OpenAI API key
> - 🔧 **Smart Recommendations** - Infrastructure built, learning algorithms active
> - 🔧 **Market Intelligence** - Data analysis ready, insights being refined
> - 🔧 **Investment Analysis** - ROI calculations functional, requires testing
> - 🔧 **Auto Search Assistant** - Notification system built, needs user validation
> - 🔧 **Neighborhood Insights** - Data framework complete, external API integration pending
>
> **📋 AI FEATURE STATUS:**
> All AI features have toggleable controls and fallback systems. They can be enabled/disabled individually in `ai-config.js`. The system works fully without AI features enabled, and AI capabilities are designed as optional enhancements.

A web application for searching and filtering real estate property listings using the RentCast API. This tool allows users to search for properties by city and state, view detailed property information, and paginate through results.

## Features

### ✅ Core Features (Stable & Production Ready)

- 🏠 **Property Search** - Search properties by city and state using RentCast API
- 📊 **Detailed Property Information** - Complete property data including:
  - Price, bedrooms, bathrooms, square footage
  - Lot size, year built, days on market
  - Listed and last seen dates, property type
  - Formatted addresses and property IDs
- 📄 **Pagination System** - Navigate through results (10 or 50 listings per page)
- 🎨 **Responsive Design** - Clean, mobile-friendly user interface
- 🔒 **Secure Configuration** - Safe API key management system
- 🔍 **Real-time Search** - Instant property data from RentCast API

### 🤖 AI Features (Experimental - Optional Enhancements)

> **Note:** AI features require additional setup (OpenAI API key) and are completely optional. The core application works perfectly without them.

- 🗣️ **Natural Language Search** - Search using plain English ("Find 3br homes under 400k in Austin")
- 🎯 **Smart Recommendations** - AI learns preferences and suggests properties 
- 📊 **Market Intelligence** - Automated market analysis and trends
- 💰 **Investment Analyzer** - ROI calculations and cash flow analysis
- � **Auto Search Assistant** - Saved searches with automatic notifications
- 🏘️ **Neighborhood Insights** - Area demographics, schools, and safety data

**AI Feature Controls:**
- Individual toggle switches for each AI capability
- Fallback systems when AI is unavailable
- Cost tracking and usage monitoring
- Easy enable/disable in configuration


## Getting Started

### Prerequisites

**Required (Core Functionality):**
- A modern web browser
- RentCast API key (get one from [RentCast](https://www.rentcast.io/))

**Optional (AI Features):**
- OpenAI API key (get one from [OpenAI Platform](https://platform.openai.com/api-keys))
- Billing setup on OpenAI account (required even for free tier)

### Installation

1. **Clone this repository:**
   ```bash
   git clone https://github.com/PatrickRay88/Property-Search.git
   cd Property-Search
   ```

2. **Set up core API configuration:**
   ```bash
   cp config.example.js config.js
   ```

3. **Configure RentCast API (Required):**
   
   Edit `config.js` and add your RentCast API key:
   ```javascript
   const CONFIG = {
       RENTCAST_API_KEY: 'your_actual_rentcast_api_key_here'
   };
   ```

4. **Configure AI Features (Optional):**
   
   To enable AI features, edit `ai-config.js` and add your OpenAI API key:
   ```javascript
   const AI_CONFIG = {
       OPENAI_API_KEY: 'sk-your_actual_openai_key_here',
       // ... other AI settings
   };
   ```
   
   **Note:** The application works perfectly without AI configuration. AI features will automatically disable if no API key is provided.

4. Open `index.html` in your web browser or serve it using a local web server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   ```

5. Navigate to `http://localhost:8000` (or the appropriate port) in your browser.

## Usage

1. **Search for Properties:**
   - Enter a city name in the "City" field
   - Enter a state abbreviation (e.g., "CA", "NY") in the "State" field
   - Click the "Search" button

2. **View Results:**
   - Browse through the property listings
   - Each listing shows comprehensive property details
   - Use the pagination buttons to navigate through multiple pages

3. **Customize Display:**
   - Choose to display 10 or 50 listings per page using the toggle buttons
   - Navigate between pages using "Previous" and "Next" buttons

## Configuration

The application uses a configuration file to manage sensitive data like API keys:

- `config.js` - Contains your actual API key (not tracked by git)
- `config.example.js` - Template file showing the required configuration structure

### Environment Variables

You can also use environment variables in a production environment by modifying the configuration approach.

## API Reference

This application uses the [RentCast API](https://developers.rentcast.io/) to fetch property listings. The API provides comprehensive real estate data including:

- Property details and specifications
- Market data and pricing information
- Property history and status updates

## File Structure

```
Property-Search/
├── index.html          # Main HTML file with AI dashboard
├── script.js           # Core JavaScript functionality
├── styles.css          # CSS styling (responsive design)
├── config.js           # RentCast API configuration (not in git)
├── config.example.js   # Configuration template
├── ai-config.js        # AI features configuration
├── ai-system.js        # AI functionality (6 feature classes)
├── ai-ui.js           # AI user interface controller
├── tests/             # Test suite directory
│   ├── test-runner.html
│   └── tests.js
├── .gitignore         # Git ignore rules
├── favicon.ico        # Website favicon
├── README.md          # This file
├── SETUP_GUIDE.md     # AI setup instructions
└── AI_FEATURES_README.md  # Detailed AI documentation
```

### Key Files Explained:

**Core Application:**
- `index.html` - Main interface with property search and AI dashboard
- `script.js` - Property search, pagination, RentCast API integration
- `styles.css` - Responsive styling for all components

**AI System (Optional):**
- `ai-config.js` - AI feature toggles and API key configuration
- `ai-system.js` - Six AI feature classes (NLP, recommendations, etc.)
- `ai-ui.js` - Controls AI dashboard and user interactions

**Configuration:**
- `config.js` - Your actual API keys (git-ignored for security)
- `config.example.js` - Template showing required configuration structure

## Technologies Used

- **HTML5** - Structure and markup
- **CSS3** - Styling and responsive design
- **JavaScript (ES6+)** - Dynamic functionality and API integration
- **RentCast API** - Real estate data source
- **Fetch API** - HTTP requests

## Development Status & Contributing

### Current Development Branch: `ai-integration`

**Stable for Use:**
- ✅ Core property search functionality is production-ready
- ✅ RentCast API integration is fully tested and stable
- ✅ Basic UI and search features work reliably

**In Active Development:**
- 🚧 AI features are functional but being refined
- 🚧 Advanced AI capabilities need testing and validation
- 🚧 Performance optimization for AI features ongoing
- 🚧 Documentation and examples being improved

### Contributing Guidelines

**For Core Features (Stable):**
1. Fork the repository
2. Create feature branch from `main`: `git checkout -b feature/CoreFeature`
3. Focus on RentCast API improvements, UI enhancements, or performance
4. Ensure backward compatibility
5. Add tests for new functionality

**For AI Features (Experimental):**
1. Create branch from `ai-integration`: `git checkout -b feature/AIFeature`
2. Test thoroughly with both API-enabled and fallback modes  
3. Ensure features work independently (toggleable)
4. Add appropriate error handling and user feedback
5. Document API requirements and setup steps

**Pull Request Process:**
1. Update documentation for any new features
2. Add tests where applicable
3. Ensure the build passes with and without AI features
4. Update README if adding new functionality
5. Open PR with detailed description of changes

### Testing Guidelines

**Before Contributing:**
- ✅ Test core search functionality without AI features
- ✅ Test with AI features disabled in `ai-config.js`
- ✅ Test with invalid/missing API keys
- ✅ Test responsive design on mobile devices
- ✅ Verify no console errors in browser developer tools

## Security

- Never commit your `config.js` file with actual API keys
- Keep your API keys secure and rotate them regularly
- Consider using environment variables for production deployments

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [RentCast](https://www.rentcast.io/) for providing the real estate API


## Troubleshooting

### "AI features not working"

**Expected Behavior:** AI features require setup and will show fallback behavior without API keys.

**Solutions:**
1. **Check the setup banner** - Orange banner appears if AI setup needed
2. **Review browser console** - Check for API key validation messages
3. **Verify configuration** - Ensure `ai-config.js` has valid OpenAI API key
4. **Test fallback mode** - AI features work without API keys (limited functionality)

### "No search results"

**Expected Behavior:** Core search should always work with valid RentCast API key.

**Solutions:**
1. **Verify RentCast API key** in `config.js`
2. **Check city/state format** - Use standard abbreviations (e.g., "CA", "TX")
3. **Try broader search terms** - Some areas may have limited listings
4. **Check browser console** - Look for API error messages

### "Page won't load"

**Solutions:**
1. **Use local server** - Don't open HTML directly, use `python -m http.server 3000`
2. **Check file paths** - Ensure all files are in the same directory
3. **Clear browser cache** - Hard refresh (Ctrl+F5) after config changes

## Roadmap

### Stable Feature Improvements
- [ ] Advanced property filtering (price range, property type, etc.)
- [ ] Property comparison feature
- [ ] Favorites and saved searches (without AI)
- [ ] Export search results to CSV/PDF
- [ ] Mobile app version

### AI Feature Enhancements (Experimental)
- [ ] Property image analysis using computer vision
- [ ] Predictive market analysis
- [ ] Automated property valuation models
- [ ] Integration with additional data sources
- [ ] Advanced natural language query processing
- [ ] Machine learning for better recommendations

### Technical Improvements
- [ ] Progressive Web App (PWA) capabilities
- [ ] Offline functionality for saved data
- [ ] Performance optimization and caching
- [ ] Docker containerization
- [ ] CI/CD pipeline setup

---

Made with ❤️ for property searching