# Property Search Filter

A web application for searching and filtering real estate property listings using the RentCast API. This tool allows users to search for properties by city and state, view detailed property information, and paginate through results.

## Features

- 🏠 Search properties by city and state
- 📊 Display detailed property information including:
  - Price, bedrooms, bathrooms
  - Square footage and lot size
  - Year built and days on market
  - Listed and last seen dates
- 📄 Pagination support (10 or 50 listings per page)
- 🎨 Clean, responsive user interface
- 🔒 Secure API key management


## Getting Started

### Prerequisites

- A modern web browser
- RentCast API key (get one from [RentCast](https://www.rentcast.io/))

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/Property-Search.git
   cd Property-Search
   ```

2. Set up your API configuration:
   ```bash
   cp config.example.js config.js
   ```

3. Edit `config.js` and replace `'your_rentcast_api_key_here'` with your actual RentCast API key:
   ```javascript
   const CONFIG = {
       RENTCAST_API_KEY: 'your_actual_api_key_here'
   };
   ```

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
├── index.html          # Main HTML file
├── script.js           # JavaScript functionality
├── styles.css          # CSS styling
├── config.js           # API configuration (not in git)
├── config.example.js   # Configuration template
├── .gitignore         # Git ignore rules
├── favicon.ico        # Website favicon
└── README.md          # This file
```

## Technologies Used

- **HTML5** - Structure and markup
- **CSS3** - Styling and responsive design
- **JavaScript (ES6+)** - Dynamic functionality and API integration
- **RentCast API** - Real estate data source
- **Fetch API** - HTTP requests

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Security

- Never commit your `config.js` file with actual API keys
- Keep your API keys secure and rotate them regularly
- Consider using environment variables for production deployments

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [RentCast](https://www.rentcast.io/) for providing the real estate API


## Roadmap

- [ ] Add property image display
- [ ] Implement advanced filtering options
- [ ] Add property comparison feature
- [ ] Include map visualization
- [ ] Add favorite properties functionality
- [ ] Implement property alerts and notifications

---

Made with ❤️ for property searching