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
    const propertyType = document.getElementById('property-type-filter').value;
    
    if (!city || !state) {
        alert('Please enter both city and state to search for properties.');
        return;
    }
    
    console.log('🔍 Manual search initiated:', { city, state, priceMin, priceMax, bedrooms, bathrooms, propertyType });
    
    // Build query parameters for RentCast API
    let queryParams = `?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`;
    
    // Add status filter for active listings only - this is the main filter that works reliably
    queryParams += `&status=Active`;
    
    // Add propertyType if specified (RentCast API supports this parameter)
    if (propertyType) {
        queryParams += `&propertyType=${encodeURIComponent(propertyType)}`;
    }
    
    console.log('🔍 Manual search URL parameters:', queryParams);
    console.log('🔍 Client-side filters will be applied:', { priceMin, priceMax, bedrooms, bathrooms, propertyType });
    
    // Store filter criteria for client-side filtering
    window.manualSearchFilters = {
        priceMin: priceMin ? parseInt(priceMin) : null,
        priceMax: priceMax ? parseInt(priceMax) : null,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        propertyType: propertyType || null
    };
    
    // Clear previous results and show loading
    showLoadingState();
    
    // Use existing fetchAndDisplayListings function
    fetchAndDisplayListings(queryParams);
}

function fillManualSearch(city, state, priceMin, priceMax, bedrooms, bathrooms, propertyType) {
    document.getElementById('manual-city').value = city || '';
    document.getElementById('manual-state').value = state || '';
    document.getElementById('price-min').value = priceMin || '';
    document.getElementById('price-max').value = priceMax || '';
    document.getElementById('bedrooms-filter').value = bedrooms || '';
    document.getElementById('bathrooms-filter').value = bathrooms || '';
    document.getElementById('property-type-filter').value = propertyType || '';
    
    // Auto-search after filling
    setTimeout(() => performManualSearch(), 100);
}

function getPropertyTypeIcon(propertyType) {
    const icons = {
        'Single Family': '🏠',
        'Condo': '🏢', 
        'Townhouse': '🏘️',
        'Multi-Family': '🏘️',
        'Apartment': '🏬',
        'Manufactured': '🚐',
        'Land': '🏞️'
    };
    return icons[propertyType] || '🏠';
}

function showLoadingState() {
    const listingsContainer = document.getElementById('listings');
    const resultsCountContainer = document.getElementById('results-count');
    
    if (resultsCountContainer) {
        resultsCountContainer.innerHTML = `
            <div class="results-count-display loading">
                🔍 Searching properties...
            </div>
        `;
    }
    
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

function updateResultsCount(count) {
    const resultsCountContainer = document.getElementById('results-count');
    if (resultsCountContainer) {
        resultsCountContainer.innerHTML = `
            <div class="results-count-display">
                📊 Found <strong>${count}</strong> properties matching your criteria
            </div>
        `;
    }
}

function createPropertyList(properties) {
    const listingsDiv = document.getElementById('listings');
    
    const start = (currentPage - 1) * listingsPerPage;
    const end = start + listingsPerPage;
    const paginatedListings = properties.slice(start, end);

    const listHtml = `
        <div class="property-list">
            ${paginatedListings.map((property, index) => `
                <div class="property-item" onclick="showPropertyDetails(${start + index})">
                    <div class="property-main-info">
                        <div class="property-address">
                            <h3>${property.formattedAddress || 'Address not available'}</h3>
                            <p class="property-location">${property.city || 'N/A'}, ${property.state || 'N/A'}</p>
                        </div>
                        <div class="property-price">
                            <span class="price-label">Price</span>
                            <span class="price-value">$${property.price ? property.price.toLocaleString() : 'N/A'}</span>
                        </div>
                    </div>
                    <div class="property-quick-stats">
                        <span class="stat-item">
                            <span class="stat-icon">🛏️</span>
                            <span class="stat-value">${property.bedrooms || 'N/A'} bed</span>
                        </span>
                        <span class="stat-item">
                            <span class="stat-icon">🚿</span>
                            <span class="stat-value">${property.bathrooms || 'N/A'} bath</span>
                        </span>
                        <span class="stat-item">
                            <span class="stat-icon">📐</span>
                            <span class="stat-value">${property.squareFootage ? property.squareFootage.toLocaleString() + ' sqft' : 'N/A'}</span>
                        </span>
                        <span class="stat-item">
                            <span class="stat-icon">📅</span>
                            <span class="stat-value">${property.daysOnMarket || 'N/A'} days</span>
                        </span>
                        <span class="stat-item">
                            <span class="stat-icon">${getPropertyTypeIcon(property.propertyType)}</span>
                            <span class="stat-value">${property.propertyType || 'Unknown'}</span>
                        </span>
                    </div>
                    <div class="property-action">
                        <span class="view-details">👁️ View Details</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    listingsDiv.innerHTML = listHtml;
    
    updatePagination();
}

function showPropertyDetails(index) {
    const property = allListings[index];
    if (!property) return;
    
    const modal = document.createElement('div');
    modal.className = 'property-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${property.formattedAddress || 'Property Details'}</h2>
                <button class="modal-close" onclick="closePropertyModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="property-details-grid">
                    <div class="detail-section">
                        <h3>💰 Pricing Information</h3>
                        <div class="detail-row">
                            <span class="detail-label">List Price:</span>
                            <span class="detail-value">$${property.price ? property.price.toLocaleString() : 'N/A'}</span>
                        </div>
                        ${property.pricePerSquareFoot ? `
                        <div class="detail-row">
                            <span class="detail-label">Price per sqft:</span>
                            <span class="detail-value">$${property.pricePerSquareFoot}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="detail-section">
                        <h3>🏠 Property Features</h3>
                        <div class="detail-row">
                            <span class="detail-label">Bedrooms:</span>
                            <span class="detail-value">${property.bedrooms || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Bathrooms:</span>
                            <span class="detail-value">${property.bathrooms || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Square Footage:</span>
                            <span class="detail-value">${property.squareFootage ? property.squareFootage.toLocaleString() + ' sqft' : 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Lot Size:</span>
                            <span class="detail-value">${property.lotSize ? property.lotSize.toLocaleString() + ' sqft' : 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Year Built:</span>
                            <span class="detail-value">${property.yearBuilt || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Property Type:</span>
                            <span class="detail-value">${property.propertyType || 'N/A'}</span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h3>📍 Location Details</h3>
                        <div class="detail-row">
                            <span class="detail-label">Address:</span>
                            <span class="detail-value">${property.formattedAddress || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">City:</span>
                            <span class="detail-value">${property.city || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">State:</span>
                            <span class="detail-value">${property.state || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">ZIP Code:</span>
                            <span class="detail-value">${property.zipCode || 'N/A'}</span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h3>📈 Market Information</h3>
                        <div class="detail-row">
                            <span class="detail-label">Days on Market:</span>
                            <span class="detail-value">${property.daysOnMarket || 'N/A'} days</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value">${property.status || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Listed Date:</span>
                            <span class="detail-value">${property.dateListedString || property.dateListed || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Last Seen:</span>
                            <span class="detail-value">${property.lastSeenString || property.lastSeen || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closePropertyModal()">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add click outside to close
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closePropertyModal();
        }
    });
}

function closePropertyModal() {
    const modal = document.querySelector('.property-modal');
    if (modal) {
        modal.remove();
    }
}

function applyManualFilters(properties, filters) {
    console.log('🔍 Applying manual filters:', filters);
    console.log('🔍 Original property count:', properties.length);
    
    return properties.filter(property => {
        // Price filtering
        if (filters.priceMin && property.price && property.price < filters.priceMin) {
            return false;
        }
        if (filters.priceMax && property.price && property.price > filters.priceMax) {
            return false;
        }
        
        // Bedroom filtering
        if (filters.bedrooms && property.bedrooms && property.bedrooms < filters.bedrooms) {
            return false;
        }
        
        // Bathroom filtering  
        if (filters.bathrooms && property.bathrooms && property.bathrooms < filters.bathrooms) {
            return false;
        }
        
        // Property type filtering (exact match)
        if (filters.propertyType && property.propertyType && property.propertyType !== filters.propertyType) {
            console.log(`🔍 Filtering out ${property.propertyType}, looking for ${filters.propertyType}`);
            return false;
        }
        
        return true;
    });
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
            
            // Apply client-side filtering if manual search filters are set
            if (window.manualSearchFilters) {
                allListings = applyManualFilters(allListings, window.manualSearchFilters);
                console.log(`🔍 Applied manual filters. Results: ${allListings.length} properties`);
                // Clear the filters after use
                window.manualSearchFilters = null;
            }
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
        const resultsCountContainer = document.getElementById('results-count');
        if (resultsCountContainer) {
            resultsCountContainer.innerHTML = `
                <div class="results-count-display" style="background: linear-gradient(135deg, #ff6b6b, #ffa500);">
                    📭 No properties found - Try adjusting your search criteria
                </div>
            `;
        }
        
        listingsDiv.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <div style="font-size: 24px; margin-bottom: 15px;">🏠</div>
                <div style="font-size: 18px; font-weight: bold;">No properties found</div>
                <div style="font-size: 14px; margin-top: 10px;">Try adjusting your search filters or expanding your search area</div>
            </div>
        `;
        return;
    }
    
    // Show total results count in separate area
    updateResultsCount(properties.length);
    
    // Create list view instead of cards
    createPropertyList(properties);
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

function updatePagination() {
    const paginationDiv = document.getElementById('pagination');
    const pageNumberSpan = document.getElementById('page-number');
    const totalPages = Math.ceil(allListings.length / listingsPerPage);
    
    if (totalPages <= 1) {
        paginationDiv.style.display = 'none';
    } else {
        paginationDiv.style.display = 'flex';
        pageNumberSpan.textContent = `Page ${currentPage} of ${totalPages}`;
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