// API key is now loaded from config.js
let currentPage = 1;
let listingsPerPage = 10;
let allListings = [];

document.addEventListener("DOMContentLoaded", function() {
    updateSelectedButton();
    checkApiSetup();
    setupManualSearchKeyboardSupport();
});

function setupManualSearchKeyboardSupport() {
    // Add Enter key support for manual search inputs
    const manualInputs = ['manual-city', 'manual-state'];
    manualInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    performManualSearch();
                }
            });
        }
    });
}

function checkApiSetup() {
    // Check if user has previously dismissed the banner
    const bannerDismissed = localStorage.getItem('setup-banner-dismissed') === 'true';
    
    // Check if OpenAI API key is properly configured
    const hasValidOpenAIKey = window.AI_CONFIG && 
                              window.AI_CONFIG.OPENAI_API_KEY && 
                              window.AI_CONFIG.OPENAI_API_KEY !== 'your_openai_api_key_here' &&
                              window.AI_CONFIG.OPENAI_API_KEY !== 'sk-YOUR_ACTUAL_OPENAI_KEY_HERE' &&
                              window.AI_CONFIG.OPENAI_API_KEY.length > 10;
    
    // Switch between AI and Manual search modes
    switchSearchMode(hasValidOpenAIKey);
    
    const setupBanner = document.getElementById('setup-banner');
    
    if (!hasValidOpenAIKey && !bannerDismissed && setupBanner) {
        setupBanner.style.display = 'block';
        console.log('🔑 API setup required - showing setup banner');
        
        // Add click handlers for the links in the banner
        setupBanner.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                console.log('🔗 Banner link clicked:', e.target.href);
                
                // Special handling for setup guide to ensure it opens
                if (e.target.href.includes('setup-guide.html')) {
                    console.log('🔧 Opening setup guide...');
                    // Let the browser handle it normally first
                    return true;
                }
                // OpenAI links work normally with target="_blank"
            }
        });
        
    } else if (setupBanner) {
        setupBanner.style.display = 'none';
        if (hasValidOpenAIKey) {
            console.log('✅ API setup complete - AI mode enabled');
            // Clear the dismissed flag if API is now configured
            localStorage.removeItem('setup-banner-dismissed');
        } else {
            console.log('🚫 Setup banner dismissed by user - Manual mode active');
        }
    }
}

function switchSearchMode(aiEnabled) {
    const aiSearchSection = document.getElementById('ai-search-section');
    const manualSearchSection = document.getElementById('manual-search-section');
    const aiControlPanel = document.getElementById('ai-control-panel');
    const aiInsightsPanel = document.getElementById('ai-insights-panel');
    const recommendationsSection = document.getElementById('recommendations-section');
    
    // Update page title
    const pageTitle = document.querySelector('h1');
    if (pageTitle) {
        pageTitle.textContent = aiEnabled ? '🤖 AI-Powered Property Search' : '🔍 Property Search';
    }
    
    if (aiEnabled) {
        // Show AI interface
        if (aiSearchSection) aiSearchSection.style.display = 'block';
        if (manualSearchSection) manualSearchSection.style.display = 'none';
        if (aiControlPanel) aiControlPanel.classList.remove('ai-disabled');
        
        console.log('🤖 AI search mode activated');
    } else {
        // Show manual interface and gray out AI features
        if (aiSearchSection) aiSearchSection.style.display = 'none';
        if (manualSearchSection) manualSearchSection.style.display = 'block';
        if (aiControlPanel) aiControlPanel.classList.add('ai-disabled');
        if (aiInsightsPanel) aiInsightsPanel.style.display = 'none';
        if (recommendationsSection) recommendationsSection.style.display = 'none';
        
        console.log('🔍 Manual search mode activated');
    }
}

function dismissSetupBanner() {
    const setupBanner = document.getElementById('setup-banner');
    if (setupBanner) {
        setupBanner.style.display = 'none';
        // Store dismissal in localStorage to remember user's choice
        localStorage.setItem('setup-banner-dismissed', 'true');
        console.log('🚫 Setup banner dismissed by user');
    }
}

function openSetupGuide() {
    // Open setup guide in new window/tab
    const setupWindow = window.open('./setup-guide.html', '_blank', 'width=900,height=700,scrollbars=yes');
    if (!setupWindow) {
        // Fallback if popup blocked
        alert('Please allow popups or manually navigate to: ./setup-guide.html');
    }
    return false;
}

function toggleBanner() {
    const setupBanner = document.getElementById('setup-banner');
    if (setupBanner) {
        const isVisible = setupBanner.style.display !== 'none';
        setupBanner.style.display = isVisible ? 'none' : 'block';
        console.log(isVisible ? '🚫 Banner hidden' : '👁️ Banner shown');
        
        if (!isVisible) {
            // Remove the dismissed flag to show banner
            localStorage.removeItem('setup-banner-dismissed');
        }
    }
}

// Manual Search Functions
function performManualSearch() {
    const city = document.getElementById('manual-city').value.trim();
    const state = document.getElementById('manual-state').value.trim();
    const priceMin = document.getElementById('price-min').value;
    const priceMax = document.getElementById('price-max').value;
    const bedrooms = document.getElementById('bedrooms-filter').value;
    const bathrooms = document.getElementById('bathrooms-filter').value;
    
    if (!city || !state) {
        alert('Please enter both city and state to search for properties.');
        return;
    }
    
    console.log('🔍 Manual search initiated:', { city, state, priceMin, priceMax, bedrooms, bathrooms });
    
    // Build query parameters for RentCast API
    let queryParams = `?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`;
    
    if (priceMin) queryParams += `&listPriceMin=${priceMin}`;
    if (priceMax) queryParams += `&listPriceMax=${priceMax}`;
    if (bedrooms) queryParams += `&bedroomsMin=${bedrooms}`;
    if (bathrooms) queryParams += `&bathroomsMin=${bathrooms}`;
    
    // Add status filter for active listings only
    queryParams += `&status=Active`;
    
    // Clear previous results and show loading
    showLoadingState();
    
    // Use existing fetchAndDisplayListings function
    fetchAndDisplayListings(queryParams);
}

function fillManualSearch(city, state, priceMin, priceMax, bedrooms, bathrooms) {
    document.getElementById('manual-city').value = city || '';
    document.getElementById('manual-state').value = state || '';
    document.getElementById('price-min').value = priceMin || '';
    document.getElementById('price-max').value = priceMax || '';
    document.getElementById('bedrooms-filter').value = bedrooms || '';
    document.getElementById('bathrooms-filter').value = bathrooms || '';
    
    // Auto-search after filling
    setTimeout(() => performManualSearch(), 100);
}

function showLoadingState() {
    const listingsContainer = document.getElementById('listings');
    if (listingsContainer) {
        listingsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <div style="font-size: 24px; margin-bottom: 15px;">🔍</div>
                <div style="font-size: 18px; font-weight: bold;">Searching Properties...</div>
                <div style="font-size: 14px; margin-top: 10px;">Finding the best matches in your area</div>
            </div>
        `;
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