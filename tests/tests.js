// Simple test framework
class TestRunner {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    test(name, testFunction) {
        this.tests.push({ name, testFunction });
    }

    async runAll() {
        console.log('Running Property Search Tests...\n');
        const resultsDiv = document.getElementById('test-results');
        
        for (const test of this.tests) {
            try {
                await test.testFunction();
                this.logResult(test.name, 'PASS', resultsDiv);
                this.results.passed++;
            } catch (error) {
                this.logResult(test.name, 'FAIL', resultsDiv, error.message);
                this.results.failed++;
            }
            this.results.total++;
        }

        this.showSummary();
    }

    logResult(name, status, container, error = null) {
        const testDiv = document.createElement('div');
        testDiv.className = `test-case test-${status.toLowerCase()}`;
        
        let content = `<strong>${status}:</strong> ${name}`;
        if (error) {
            content += `<br><small>Error: ${error}</small>`;
        }
        testDiv.innerHTML = content;
        
        container.appendChild(testDiv);
        console.log(`${status}: ${name}${error ? ` - ${error}` : ''}`);
    }

    showSummary() {
        const summaryDiv = document.getElementById('test-summary');
        const passRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
        
        summaryDiv.innerHTML = `
            <h2>Test Summary</h2>
            <p><strong>Total Tests:</strong> ${this.results.total}</p>
            <p><strong>Passed:</strong> ${this.results.passed}</p>
            <p><strong>Failed:</strong> ${this.results.failed}</p>
            <p><strong>Pass Rate:</strong> ${passRate}%</p>
        `;
        
        console.log(`\nTest Summary: ${this.results.passed}/${this.results.total} passed (${passRate}%)`);
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }

    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected}, but got ${actual}`);
        }
    }

    assertNotEqual(actual, notExpected, message) {
        if (actual === notExpected) {
            throw new Error(message || `Expected not to equal ${notExpected}, but got ${actual}`);
        }
    }

    assertContains(container, item, message) {
        if (!container.includes(item)) {
            throw new Error(message || `Expected ${container} to contain ${item}`);
        }
    }
}

// Initialize test runner
const testRunner = new TestRunner();

// Mock DOM elements for testing
function createMockDOM() {
    // Create mock elements that our functions expect
    if (!document.getElementById('listings')) {
        const listingsDiv = document.createElement('div');
        listingsDiv.id = 'listings';
        document.body.appendChild(listingsDiv);
    }
    
    if (!document.getElementById('pagination')) {
        const paginationDiv = document.createElement('div');
        paginationDiv.id = 'pagination';
        paginationDiv.style.display = 'none';
        document.body.appendChild(paginationDiv);
    }
    
    if (!document.getElementById('page-number')) {
        const pageNumberSpan = document.createElement('span');
        pageNumberSpan.id = 'page-number';
        document.getElementById('pagination').appendChild(pageNumberSpan);
    }
    
    if (!document.getElementById('btn-10')) {
        const btn10 = document.createElement('button');
        btn10.id = 'btn-10';
        btn10.className = 'listings-button';
        document.body.appendChild(btn10);
    }
    
    if (!document.getElementById('btn-50')) {
        const btn50 = document.createElement('button');
        btn50.id = 'btn-50';
        btn50.className = 'listings-button';
        document.body.appendChild(btn50);
    }

    if (!document.getElementById('city')) {
        const cityInput = document.createElement('input');
        cityInput.id = 'city';
        cityInput.type = 'text';
        document.body.appendChild(cityInput);
    }

    if (!document.getElementById('state')) {
        const stateInput = document.createElement('input');
        stateInput.id = 'state';
        stateInput.type = 'text';
        document.body.appendChild(stateInput);
    }
}

// Test Cases
testRunner.test('Configuration should be loaded', () => {
    testRunner.assert(window.CONFIG, 'CONFIG should be available globally');
    testRunner.assert(window.CONFIG.RENTCAST_API_KEY, 'API key should be defined in CONFIG');
});

testRunner.test('Initial variables should be set correctly', () => {
    testRunner.assertEqual(currentPage, 1, 'Current page should start at 1');
    testRunner.assertEqual(listingsPerPage, 10, 'Listings per page should default to 10');
    testRunner.assert(Array.isArray(allListings), 'All listings should be an array');
});

testRunner.test('setListingCount should update listings per page', () => {
    const originalPage = currentPage;
    const originalPerPage = listingsPerPage;
    
    setListingCount(50);
    testRunner.assertEqual(listingsPerPage, 50, 'Listings per page should be updated to 50');
    testRunner.assertEqual(currentPage, 1, 'Current page should reset to 1');
    
    // Reset to original values
    setListingCount(originalPerPage);
    testRunner.assertEqual(listingsPerPage, originalPerPage, 'Should reset to original value');
});

testRunner.test('Pagination functions should work correctly', () => {
    createMockDOM();
    
    // Set up test data
    allListings = new Array(25).fill(null).map((_, i) => ({
        formattedAddress: `Test Property ${i + 1}`,
        price: 100000 + (i * 10000),
        propertyType: 'Single Family',
        bedrooms: 3,
        bathrooms: 2,
        squareFootage: 1500,
        lotSize: 5000,
        yearBuilt: 2000,
        listedDate: new Date().toISOString(),
        lastSeenDate: new Date().toISOString(),
        daysOnMarket: 30
    }));
    
    currentPage = 1;
    listingsPerPage = 10;
    
    // Test next page
    nextPage();
    testRunner.assertEqual(currentPage, 2, 'Should move to page 2');
    
    // Test next page again
    nextPage();
    testRunner.assertEqual(currentPage, 3, 'Should move to page 3');
    
    // Try to go beyond available pages
    nextPage();
    testRunner.assertEqual(currentPage, 3, 'Should not exceed maximum pages');
    
    // Test previous page
    prevPage();
    testRunner.assertEqual(currentPage, 2, 'Should move back to page 2');
    
    // Test going to page 1
    prevPage();
    testRunner.assertEqual(currentPage, 1, 'Should move back to page 1');
    
    // Try to go below page 1
    prevPage();
    testRunner.assertEqual(currentPage, 1, 'Should not go below page 1');
});

testRunner.test('updateSelectedButton should update button classes correctly', () => {
    createMockDOM();
    
    listingsPerPage = 10;
    updateSelectedButton();
    
    const btn10 = document.getElementById('btn-10');
    const btn50 = document.getElementById('btn-50');
    
    testRunner.assert(btn10.classList.contains('selected'), 'btn-10 should have selected class when listingsPerPage is 10');
    testRunner.assert(!btn50.classList.contains('selected'), 'btn-50 should not have selected class when listingsPerPage is 10');
    
    listingsPerPage = 50;
    updateSelectedButton();
    
    testRunner.assert(!btn10.classList.contains('selected'), 'btn-10 should not have selected class when listingsPerPage is 50');
    testRunner.assert(btn50.classList.contains('selected'), 'btn-50 should have selected class when listingsPerPage is 50');
});

testRunner.test('displayListings should handle empty data correctly', () => {
    createMockDOM();
    
    displayListings([]);
    
    const listingsDiv = document.getElementById('listings');
    testRunner.assertContains(listingsDiv.innerHTML, 'No listings found', 'Should display no listings message');
});

testRunner.test('displayListings should render properties correctly', () => {
    createMockDOM();
    
    const testProperties = [{
        formattedAddress: '123 Test St, Test City, TS 12345',
        price: 250000,
        propertyType: 'Single Family',
        bedrooms: 3,
        bathrooms: 2,
        squareFootage: 1500,
        lotSize: 5000,
        yearBuilt: 2000,
        listedDate: '2025-01-01T00:00:00.000Z',
        lastSeenDate: '2025-01-01T00:00:00.000Z',
        daysOnMarket: 30
    }];
    
    currentPage = 1;
    listingsPerPage = 10;
    
    displayListings(testProperties);
    
    const listingsDiv = document.getElementById('listings');
    testRunner.assertContains(listingsDiv.innerHTML, '123 Test St', 'Should display property address');
    testRunner.assertContains(listingsDiv.innerHTML, '$250000', 'Should display property price');
    testRunner.assertContains(listingsDiv.innerHTML, 'Single Family', 'Should display property type');
});

testRunner.test('Search validation should work correctly', () => {
    createMockDOM();
    
    // Mock alert function
    let alertMessage = '';
    const originalAlert = window.alert;
    window.alert = (message) => { alertMessage = message; };
    
    // Test empty city
    document.getElementById('city').value = '';
    document.getElementById('state').value = 'CA';
    
    searchListings();
    testRunner.assertContains(alertMessage, 'Please enter both city and state', 'Should alert when city is empty');
    
    // Test empty state
    document.getElementById('city').value = 'Los Angeles';
    document.getElementById('state').value = '';
    alertMessage = '';
    
    searchListings();
    testRunner.assertContains(alertMessage, 'Please enter both city and state', 'Should alert when state is empty');
    
    // Restore original alert
    window.alert = originalAlert;
});

testRunner.test('updatePaginationButtons should show/hide pagination correctly', () => {
    createMockDOM();
    
    listingsPerPage = 10;
    
    // Test with few listings (no pagination needed)
    updatePaginationButtons(5);
    const paginationDiv = document.getElementById('pagination');
    testRunner.assertEqual(paginationDiv.style.display, 'none', 'Should hide pagination when not needed');
    
    // Test with many listings (pagination needed)
    updatePaginationButtons(25);
    testRunner.assertEqual(paginationDiv.style.display, 'flex', 'Should show pagination when needed');
    
    const pageNumberSpan = document.getElementById('page-number');
    testRunner.assertContains(pageNumberSpan.textContent, 'Page 1 of 3', 'Should show correct page information');
});

// Run all tests when page loads
document.addEventListener('DOMContentLoaded', () => {
    createMockDOM();
    testRunner.runAll();
});