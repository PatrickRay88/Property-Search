// API key is now loaded from config.js
let currentPage = 1;
let listingsPerPage = 10;
let allListings = [];

document.addEventListener("DOMContentLoaded", function() {
    updateSelectedButton();
    checkApiSetup();
});

function checkApiSetup() {
    // Check if OpenAI API key is properly configured
    const hasValidOpenAIKey = window.AI_CONFIG && 
                              window.AI_CONFIG.OPENAI_API_KEY && 
                              window.AI_CONFIG.OPENAI_API_KEY !== 'your_openai_api_key_here' &&
                              window.AI_CONFIG.OPENAI_API_KEY !== 'sk-YOUR_ACTUAL_OPENAI_KEY_HERE' &&
                              window.AI_CONFIG.OPENAI_API_KEY.length > 10;
    
    const setupBanner = document.getElementById('setup-banner');
    
    if (!hasValidOpenAIKey && setupBanner) {
        setupBanner.style.display = 'block';
        console.log('🔑 API setup required - showing setup banner');
    } else if (setupBanner) {
        setupBanner.style.display = 'none';
        console.log('✅ API setup complete');
    }
}

function dismissSetupBanner() {
    const setupBanner = document.getElementById('setup-banner');
    if (setupBanner) {
        setupBanner.style.display = 'none';
    }
}

function setListingCount(count) {
    listingsPerPage = count;
    currentPage = 1; // Reset to first page
    if (allListings.length > 0) {
        displayListings(allListings);
    }
    updateSelectedButton();
}

function fetchAndDisplayListings(queryParams = '') {
    const apiUrl = `https://api.rentcast.io/v1/listings/sale${queryParams}`;

    console.log('Request URL:', apiUrl); // Log the request URL for debugging

    fetch(apiUrl, {
        headers: {
            'X-Api-Key': window.CONFIG.RENTCAST_API_KEY,
            'accept': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('API Response:', JSON.stringify(data, null, 2)); // Log the response data for debugging

        if (Array.isArray(data)) {
            allListings = data;
        } else {
            throw new Error('Unexpected API response structure');
        }

        displayListings(allListings);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        displayRawData({ error: 'Error fetching data', details: error.message });
    });
}

function displayListings(properties) {
    const listingsDiv = document.getElementById('listings');
    listingsDiv.innerHTML = ''; // Clear previous listings if any

    if (!properties || properties.length === 0) {
        listingsDiv.innerHTML = '<p>No listings found. Please refine your search criteria.</p>';
        return;
    }

    const start = (currentPage - 1) * listingsPerPage;
    const end = start + listingsPerPage;
    const paginatedListings = properties.slice(start, end);

    paginatedListings.forEach(property => {
        const listing = document.createElement('div');
        listing.className = 'listing';
        listing.innerHTML = `
            <h2>${property.formattedAddress}</h2>
            <p><strong>Price:</strong> $${property.price}</p>
            <p><strong>Property Type:</strong> ${property.propertyType}</p>
            <p><strong>Bedrooms:</strong> ${property.bedrooms}</p>
            <p><strong>Bathrooms:</strong> ${property.bathrooms}</p>
            <p><strong>Square Footage:</strong> ${property.squareFootage} sqft</p>
            <p><strong>Lot Size:</strong> ${property.lotSize ? property.lotSize + ' sqft' : 'N/A'}</p>
            <p><strong>Year Built:</strong> ${property.yearBuilt}</p>
            <p><strong>Listed Date:</strong> ${new Date(property.listedDate).toLocaleDateString()}</p>
            <p><strong>Last Seen Date:</strong> ${new Date(property.lastSeenDate).toLocaleDateString()}</p>
            <p><strong>Days on Market:</strong> ${property.daysOnMarket} days</p>
        `;
        listingsDiv.appendChild(listing);
    });

    updatePaginationButtons(properties.length);
}

function updatePaginationButtons(totalListings) {
    const paginationDiv = document.getElementById('pagination');
    const pageNumberSpan = document.getElementById('page-number');
    paginationDiv.style.display = totalListings > listingsPerPage ? 'flex' : 'none';
    pageNumberSpan.textContent = `Page ${currentPage} of ${Math.ceil(totalListings / listingsPerPage)}`;
}

function nextPage() {
    if ((currentPage * listingsPerPage) < allListings.length) {
        currentPage++;
        displayListings(allListings);
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayListings(allListings);
    }
}

function updateSelectedButton() {
    const btn10 = document.getElementById('btn-10');
    const btn50 = document.getElementById('btn-50');
    if (listingsPerPage === 10) {
        btn10.classList.add('selected');
        btn50.classList.remove('selected');
    } else if (listingsPerPage === 50) {
        btn50.classList.add('selected');
        btn10.classList.remove('selected');
    }
}

function searchListings() {
    const state = document.getElementById('state').value.trim().toUpperCase();
    const city = document.getElementById('city').value.trim();

    if (!state || !city) {
        alert('Please enter both city and state.');
        return;
    }

    let queryParams = `?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&status=Active&limit=100`;

    console.log('Query Params:', queryParams); // Log the query parameters for debugging
    fetchAndDisplayListings(queryParams);
}

function displayRawData(data) {
    const listingsDiv = document.getElementById('listings');
    const pre = document.createElement('pre');
    pre.textContent = JSON.stringify(data, null, 2); // Format JSON with indentation
    listingsDiv.appendChild(pre);
}