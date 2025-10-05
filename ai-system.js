// Comprehensive AI Property Search System
class PropertyAISystem {
    constructor() {
        this.features = {};
        this.usage = this.loadUsageData();
        this.isInitialized = false;
        
        // Initialize when AI_CONFIG is available
        if (typeof AI_CONFIG !== 'undefined') {
            this.initializeFeatures();
            this.isInitialized = true;
        } else {
            // Wait for AI_CONFIG to be loaded
            setTimeout(() => this.initialize(), 100);
        }
    }

    initialize() {
        if (typeof AI_CONFIG !== 'undefined' && !this.isInitialized) {
            this.initializeFeatures();
            this.isInitialized = true;
            console.log('PropertyAI System initialized successfully');
        } else if (!this.isInitialized) {
            // Retry initialization
            setTimeout(() => this.initialize(), 500);
        }
    }

    // Initialize all AI features based on toggle settings
    initializeFeatures() {
        try {
            if (AI_CONFIG.FEATURES.NATURAL_LANGUAGE_SEARCH) {
                this.features.nlSearch = new NaturalLanguageSearch();
            }
            
            if (AI_CONFIG.FEATURES.SMART_RECOMMENDATIONS) {
                this.features.recommendations = new SmartRecommendations();
            }
            
            if (AI_CONFIG.FEATURES.MARKET_INTELLIGENCE) {
                this.features.marketIntel = new MarketIntelligence();
            }
            
            // Initialize other features as stubs for now
            this.features.autoSearch = new AutoSearchAssistant();
            this.features.investment = new InvestmentAnalyzer();
            this.features.neighborhood = new NeighborhoodInsights();
        } catch (error) {
            console.error('Error initializing AI features:', error);
        }
    }

    // Toggle feature on/off
    toggleFeature(featureName, enabled) {
        AI_CONFIG.FEATURES[featureName] = enabled;
        this.saveConfig();
        
        if (enabled) {
            this.initializeFeature(featureName);
        } else {
            delete this.features[this.getFeatureKey(featureName)];
        }
        
        this.updateUI();
    }

    // Get feature availability status
    isFeatureEnabled(featureName) {
        return AI_CONFIG.FEATURES[featureName] && this.features[this.getFeatureKey(featureName)];
    }

    // Main AI search method
    async performAISearch(query, options = {}) {
        console.log('Starting AI search for:', query);
        
        if (!this.isInitialized) {
            console.warn('AI system not initialized, using fallback');
        }
        
        const results = {};
        let searchParams = {};
        
        // Natural Language Search - with robust fallback
        if (this.isFeatureEnabled('NATURAL_LANGUAGE_SEARCH') && this.features.nlSearch) {
            try {
                searchParams = await this.features.nlSearch.processQuery(query);
                this.trackUsage('NATURAL_LANGUAGE_SEARCH');
                console.log('AI processed search params:', searchParams);
            } catch (error) {
                console.warn('AI Natural Language Search failed, using fallback:', error);
                searchParams = this.fallbackQueryParser(query);
            }
        } else {
            // Always use fallback parser when AI is disabled
            searchParams = this.fallbackQueryParser(query);
            console.log('Using fallback parser, params:', searchParams);
        }
        
        results.searchParams = searchParams;
        
        // Execute the search with generated parameters
        if (searchParams && Object.keys(searchParams).length > 0) {
            try {
                const properties = await this.executePropertySearch(searchParams);
                console.log(`Found ${properties.length} properties`);
                
                // Smart Recommendations
                if (this.isFeatureEnabled('SMART_RECOMMENDATIONS') && this.features.recommendations) {
                    try {
                        results.recommendations = await this.features.recommendations.scoreProperties(properties);
                        this.trackUsage('SMART_RECOMMENDATIONS');
                    } catch (error) {
                        console.warn('Smart Recommendations failed:', error);
                        results.recommendations = properties; // Use unscored properties
                    }
                } else {
                    results.recommendations = properties;
                }
                
                // Market Intelligence
                if (this.isFeatureEnabled('MARKET_INTELLIGENCE') && this.features.marketIntel) {
                    try {
                        results.marketInsights = await this.features.marketIntel.analyzeProperties(properties);
                        this.trackUsage('MARKET_INTELLIGENCE');
                    } catch (error) {
                        console.warn('Market Intelligence failed:', error);
                    }
                }
                
                return { properties, aiResults: results };
            } catch (error) {
                console.error('Property search failed:', error);
                return { properties: [], aiResults: results, error: error.message };
            }
        }
        
        console.warn('No valid search parameters generated');
        return { properties: [], aiResults: results, error: 'Could not parse search query' };
    }

    // Robust fallback query parser
    fallbackQueryParser(query) {
        const params = {};
        const lowerQuery = query.toLowerCase();
        
        console.log('Parsing query with fallback:', query);
        
        // Extract city and state
        const cityStatePatterns = [
            /in\s+([^,]+),\s*([a-z]{2})\b/i,  // "in Austin, TX"
            /in\s+([^,]+)\s+([a-z]{2})\b/i,   // "in Austin TX"
            /([a-z\s]+),\s*([a-z]{2})\b/i,    // "Austin, TX"
        ];
        
        for (const pattern of cityStatePatterns) {
            const match = query.match(pattern);
            if (match) {
                params.city = match[1].trim();
                params.state = match[2].toUpperCase();
                break;
            }
        }
        
        // If no state found, try just city
        if (!params.city) {
            const cityMatch = lowerQuery.match(/in\s+([a-z\s]+)/i);
            if (cityMatch) {
                const cityPart = cityMatch[1].trim();
                // Check if it's a known city (you could expand this)
                if (cityPart.length > 2) {
                    params.city = cityPart;
                }
            }
        }
        
        // Extract price range
        const pricePatterns = [
            /under\s+\$?([\d,]+)k?/i,
            /below\s+\$?([\d,]+)k?/i,
            /\$?([\d,]+)k?\s*or\s*less/i,
            /maximum\s+\$?([\d,]+)k?/i,
            /max\s+\$?([\d,]+)k?/i
        ];
        
        for (const pattern of pricePatterns) {
            const match = query.match(pattern);
            if (match) {
                let price = parseInt(match[1].replace(/,/g, ''));
                if (match[0].includes('k')) price *= 1000;
                params.maxPrice = price;
                break;
            }
        }
        
        // Extract minimum price
        const minPriceMatch = query.match(/(?:above|over|minimum|min)\s+\$?([\d,]+)k?/i);
        if (minPriceMatch) {
            let price = parseInt(minPriceMatch[1].replace(/,/g, ''));
            if (minPriceMatch[0].includes('k')) price *= 1000;
            params.minPrice = price;
        }
        
        // Extract bedrooms
        const bedroomPatterns = [
            /(\d+)\s*(?:bed|bedroom)s?/i,
            /(\d+)\s*br\b/i
        ];
        
        for (const pattern of bedroomPatterns) {
            const match = query.match(pattern);
            if (match) {
                params.minBedrooms = parseInt(match[1]);
                break;
            }
        }
        
        // Extract property type
        const typePatterns = [
            { pattern: /\b(?:house|home|single\s*family)\b/i, type: 'Single Family' },
            { pattern: /\bcondo\b/i, type: 'Condo' },
            { pattern: /\btownhouse\b/i, type: 'Townhouse' },
            { pattern: /\bapartment\b/i, type: 'Multi-Family' }
        ];
        
        for (const { pattern, type } of typePatterns) {
            if (query.match(pattern)) {
                params.propertyType = type;
                break;
            }
        }
        
        console.log('Fallback parser extracted:', params);
        return params;
    }

    // Execute property search using RentCast API
    async executePropertySearch(params) {
        let queryParams = '?';
        const paramMap = {
            city: 'city',
            state: 'state',
            minPrice: 'minPrice',
            maxPrice: 'maxPrice',
            minBedrooms: 'bedrooms',
            propertyType: 'propertyType'
        };
        
        Object.keys(params).forEach(key => {
            if (paramMap[key] && params[key]) {
                queryParams += `${paramMap[key]}=${encodeURIComponent(params[key])}&`;
            }
        });
        
        queryParams += 'status=Active&limit=100';
        
        const apiUrl = `https://api.rentcast.io/v1/listings/sale${queryParams}`;
        
        try {
            const response = await fetch(apiUrl, {
                headers: {
                    'X-Api-Key': window.CONFIG.RENTCAST_API_KEY,
                    'accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Property search failed:', error);
            return [];
        }
    }

    // Usage tracking and cost management
    trackUsage(featureName, cost = 0.01) {
        if (!AI_CONFIG.USAGE_TRACKING) return;
        
        const today = new Date().toDateString();
        if (!this.usage[today]) {
            this.usage[today] = {};
        }
        
        if (!this.usage[today][featureName]) {
            this.usage[today][featureName] = { calls: 0, cost: 0 };
        }
        
        this.usage[today][featureName].calls++;
        this.usage[today][featureName].cost += cost;
        
        this.saveUsageData();
        this.checkCostLimits();
    }

    // Check if monthly cost limits are exceeded
    checkCostLimits() {
        const monthlyUsage = this.getMonthlyUsage();
        const totalCost = Object.values(monthlyUsage).reduce((sum, day) => 
            sum + Object.values(day).reduce((daySum, feature) => daySum + feature.cost, 0), 0);
            
        if (totalCost > AI_CONFIG.MAX_MONTHLY_COST && AI_CONFIG.COST_ALERTS) {
            this.showCostAlert(totalCost);
        }
    }

    // Helper methods
    getFeatureKey(featureName) {
        const keyMap = {
            'NATURAL_LANGUAGE_SEARCH': 'nlSearch',
            'SMART_RECOMMENDATIONS': 'recommendations',
            'MARKET_INTELLIGENCE': 'marketIntel',
            'AUTO_SEARCH': 'autoSearch',
            'INVESTMENT_ANALYZER': 'investment',
            'NEIGHBORHOOD_INSIGHTS': 'neighborhood'
        };
        return keyMap[featureName];
    }

    initializeFeature(featureName) {
        const key = this.getFeatureKey(featureName);
        switch(featureName) {
            case 'NATURAL_LANGUAGE_SEARCH':
                this.features[key] = new NaturalLanguageSearch();
                break;
            case 'SMART_RECOMMENDATIONS':
                this.features[key] = new SmartRecommendations();
                break;
            // Add other features as needed
        }
    }

    getMonthlyUsage() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return Object.keys(this.usage)
            .filter(date => {
                const d = new Date(date);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            })
            .reduce((acc, date) => {
                acc[date] = this.usage[date];
                return acc;
            }, {});
    }

    loadUsageData() {
        try {
            return JSON.parse(localStorage.getItem('ai_usage_data')) || {};
        } catch {
            return {};
        }
    }

    saveUsageData() {
        localStorage.setItem('ai_usage_data', JSON.stringify(this.usage));
    }

    saveConfig() {
        localStorage.setItem('ai_config', JSON.stringify(AI_CONFIG));
    }

    showCostAlert(cost) {
        console.warn(`Monthly AI cost limit exceeded: $${cost.toFixed(2)}`);
        // Could show UI notification here
    }

    updateUI() {
        // Trigger UI update to reflect feature changes
        if (window.updateAIControlPanel) {
            window.updateAIControlPanel();
        }
    }
}

// Individual AI Feature Classes
class NaturalLanguageSearch {
    constructor() {
        this.hasValidApiKey = this.checkApiKey();
    }

    checkApiKey() {
        const hasKey = AI_CONFIG && 
               AI_CONFIG.OPENAI_API_KEY && 
               AI_CONFIG.OPENAI_API_KEY !== 'your_openai_api_key_here' &&
               AI_CONFIG.OPENAI_API_KEY !== 'sk-YOUR_ACTUAL_OPENAI_KEY_HERE' &&
               AI_CONFIG.OPENAI_API_KEY.length > 10;
               
        if (!hasKey) {
            console.warn('🔑 OpenAI API key missing or invalid. Please:');
            console.warn('1. Get API key from: https://platform.openai.com/api-keys');
            console.warn('2. Update ai-config.js with your key');
            console.warn('3. Refresh the page');
        }
        
        return hasKey;
    }

    async processQuery(query) {
        console.log('🤖 NLP processing query:', query);
        
        if (!this.hasValidApiKey) {
            console.log('📝 Using enhanced fallback parser (no OpenAI API)');
            return this.enhancedFallbackParser(query);
        }

        const systemPrompt = `You are a real estate search assistant. Convert natural language property searches into structured search parameters.

Available parameters:
- city: string (city name)
- state: string (2-letter state code like TX, CA)
- minPrice: number (minimum price in dollars)
- maxPrice: number (maximum price in dollars)
- minBedrooms: number (minimum bedrooms)
- maxBedrooms: number (maximum bedrooms)
- propertyType: "Single Family" | "Condo" | "Townhouse" | "Multi-Family"

Return ONLY a JSON object with the extracted parameters.

Examples:
"3 bedroom house under 500k in Austin TX" -> {"city":"Austin","state":"TX","maxPrice":500000,"minBedrooms":3,"propertyType":"Single Family"}
"luxury condo in Miami" -> {"city":"Miami","state":"FL","propertyType":"Condo"}
"family home near schools in Denver" -> {"city":"Denver","state":"CO","propertyType":"Single Family"}`;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${AI_CONFIG.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: AI_CONFIG.AI_MODEL_PREFERENCE || 'gpt-3.5-turbo',
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: query }
                    ],
                    max_tokens: 200,
                    temperature: 0.1,
                    timeout: AI_CONFIG.RESPONSE_TIMEOUT || 10000
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Invalid OpenAI API response structure');
            }

            const content = data.choices[0].message.content.trim();
            console.log('OpenAI raw response:', content);
            
            // Clean up the response to extract JSON
            let jsonStr = content;
            if (content.includes('```json')) {
                jsonStr = content.match(/```json\s*([\s\S]*?)\s*```/)?.[1] || content;
            } else if (content.includes('```')) {
                jsonStr = content.match(/```\s*([\s\S]*?)\s*```/)?.[1] || content;
            }
            
            const result = JSON.parse(jsonStr);
            console.log('OpenAI parsed result:', result);
            return result;

        } catch (error) {
            console.error('OpenAI API error:', error);
            console.log('Falling back to enhanced parser');
            return this.enhancedFallbackParser(query);
        }
    }

    enhancedFallbackParser(query) {
        const params = {};
        const lowerQuery = query.toLowerCase();
        
        // Enhanced city/state extraction
        const locationPatterns = [
            /(?:in|near|around)\s+([^,]+),\s*([a-z]{2})\b/i,
            /(?:in|near|around)\s+([^,]+)\s+([a-z]{2})\b/i,
            /([a-z\s]+),\s*([a-z]{2})\b/i
        ];
        
        for (const pattern of locationPatterns) {
            const match = query.match(pattern);
            if (match) {
                params.city = match[1].trim().replace(/^(in|near|around)\s+/, '');
                params.state = match[2].toUpperCase();
                break;
            }
        }
        
        // Price extraction
        const pricePatterns = [
            { pattern: /(?:under|below|max|maximum)\s+\$?([\d,]+)k?/i, type: 'max' },
            { pattern: /(?:above|over|min|minimum)\s+\$?([\d,]+)k?/i, type: 'min' },
            { pattern: /\$?([\d,]+)k?\s*(?:or\s*)?(?:less|under)/i, type: 'max' },
            { pattern: /\$?([\d,]+)k?\s*(?:or\s*)?(?:more|above)/i, type: 'min' }
        ];
        
        for (const { pattern, type } of pricePatterns) {
            const match = query.match(pattern);
            if (match) {
                let price = parseInt(match[1].replace(/,/g, ''));
                if (match[0].toLowerCase().includes('k')) price *= 1000;
                if (type === 'max') params.maxPrice = price;
                else params.minPrice = price;
            }
        }
        
        // Bedroom extraction
        const bedroomMatch = query.match(/(\d+)\s*(?:bed|bedroom|br)\b/i);
        if (bedroomMatch) {
            params.minBedrooms = parseInt(bedroomMatch[1]);
        }
        
        // Property type extraction
        if (/\b(?:house|home|single\s*family)\b/i.test(query)) {
            params.propertyType = 'Single Family';
        } else if (/\bcondo\b/i.test(query)) {
            params.propertyType = 'Condo';
        } else if (/\btownhouse\b/i.test(query)) {
            params.propertyType = 'Townhouse';
        } else if (/\bapartment\b/i.test(query)) {
            params.propertyType = 'Multi-Family';
        }
        
        // Special handling for common terms
        if (/luxury/i.test(query) && !params.minPrice) {
            params.minPrice = 500000; // Assume luxury starts at 500k
        }
        
        if (/starter|first.*home|affordable/i.test(query) && !params.maxPrice) {
            params.maxPrice = 350000; // Assume starter homes under 350k
        }
        
        if (/family/i.test(query) && !params.minBedrooms) {
            params.minBedrooms = 3; // Family homes typically 3+ bedrooms
        }
        
        return params;
    }
}

class SmartRecommendations {
    constructor() {
        this.userProfile = this.loadUserProfile();
        console.log('Smart Recommendations initialized with profile:', this.userProfile);
    }

    async scoreProperties(properties) {
        console.log(`Scoring ${properties.length} properties`);
        
        const scoredProperties = properties.map(property => {
            const score = this.calculateScore(property);
            const reasons = this.generateReasons(property, score);
            
            return {
                ...property,
                aiScore: score,
                reasons: reasons
            };
        }).sort((a, b) => b.aiScore - a.aiScore);
        
        console.log('Top scored properties:', scoredProperties.slice(0, 3).map(p => ({ address: p.formattedAddress, score: p.aiScore })));
        return scoredProperties;
    }

    calculateScore(property) {
        let score = 50; // Base score
        const factors = [];
        
        // Price scoring based on user history
        if (this.userProfile.avgPrice && property.price) {
            const priceDiff = Math.abs(property.price - this.userProfile.avgPrice);
            const priceVariance = priceDiff / this.userProfile.avgPrice;
            
            if (priceVariance < 0.2) { // Within 20% of average
                const priceScore = 25 * (1 - priceVariance * 2);
                score += priceScore;
                factors.push(`Price matches your typical range (+${Math.round(priceScore)})`);
            }
        }
        
        // Property type preference
        if (this.userProfile.preferredTypes && property.propertyType) {
            const typePreference = this.userProfile.preferredTypes[property.propertyType] || 0;
            const typeScore = Math.min(20, typePreference * 10);
            score += typeScore;
            if (typeScore > 5) {
                factors.push(`You often view ${property.propertyType} properties (+${Math.round(typeScore)})`);
            }
        }
        
        // Bedroom preference
        if (this.userProfile.preferredBedrooms && property.bedrooms) {
            if (property.bedrooms === this.userProfile.preferredBedrooms) {
                score += 15;
                factors.push(`Perfect bedroom count (+15)`);
            } else if (Math.abs(property.bedrooms - this.userProfile.preferredBedrooms) === 1) {
                score += 8;
                factors.push(`Close to preferred bedroom count (+8)`);
            }
        }
        
        // Market factors
        if (property.daysOnMarket !== undefined) {
            if (property.daysOnMarket < 7) {
                score += 10;
                factors.push(`Fresh listing (+10)`);
            } else if (property.daysOnMarket > 60) {
                score += 5;
                factors.push(`May have room for negotiation (+5)`);
            }
        }
        
        // Price per sqft efficiency
        if (property.price && property.squareFootage && property.squareFootage > 0) {
            const pricePerSqft = property.price / property.squareFootage;
            if (pricePerSqft < 200) {
                score += 10;
                factors.push(`Great value per square foot (+10)`);
            } else if (pricePerSqft < 150) {
                score += 15;
                factors.push(`Excellent value per square foot (+15)`);
            }
        }
        
        const finalScore = Math.min(100, Math.max(0, score));
        property._scoringFactors = factors; // Store for debugging
        
        return Math.round(finalScore);
    }

    generateReasons(property, score) {
        const reasons = [];
        
        if (score >= 85) {
            reasons.push("🎯 Perfect match for your preferences");
        } else if (score >= 70) {
            reasons.push("👍 Great match based on your history");
        } else if (score >= 60) {
            reasons.push("✅ Good potential match");
        }
        
        if (property.daysOnMarket < 5) {
            reasons.push("⚡ New listing - act quickly!");
        } else if (property.daysOnMarket > 90) {
            reasons.push("💰 Long on market - negotiation opportunity");
        }
        
        if (property.price && property.squareFootage) {
            const pricePerSqft = property.price / property.squareFootage;
            if (pricePerSqft < 150) {
                reasons.push("💎 Excellent value per square foot");
            }
        }
        
        // Add specific user preference reasons
        if (property._scoringFactors && property._scoringFactors.length > 0) {
            // Add the top scoring factor as a reason
            reasons.push(`📊 ${property._scoringFactors[0]}`);
        }
        
        return reasons.slice(0, 3); // Limit to top 3 reasons
    }

    trackInteraction(property, action) {
        // Update user profile based on interactions
        if (!this.userProfile.interactions) this.userProfile.interactions = [];
        
        this.userProfile.interactions.push({
            property: property,
            action: action,
            timestamp: new Date().toISOString()
        });
        
        this.updateUserProfile();
        this.saveUserProfile();
    }

    updateUserProfile() {
        const interactions = this.userProfile.interactions || [];
        
        // Calculate average price from viewed properties
        const prices = interactions.map(i => i.property.price).filter(p => p);
        if (prices.length > 0) {
            this.userProfile.avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        }
        
        // Track property type preferences
        this.userProfile.preferredTypes = {};
        interactions.forEach(i => {
            const type = i.property.propertyType;
            this.userProfile.preferredTypes[type] = (this.userProfile.preferredTypes[type] || 0) + 1;
        });
    }

    loadUserProfile() {
        try {
            return JSON.parse(localStorage.getItem('user_profile')) || {};
        } catch {
            return {};
        }
    }

    saveUserProfile() {
        localStorage.setItem('user_profile', JSON.stringify(this.userProfile));
    }
}

class MarketIntelligence {
    constructor() {
        this.marketData = new Map();
        this.priceHistory = new Map();
        console.log('Market Intelligence initialized');
    }

    async analyzeMarket(properties, location) {
        console.log(`Analyzing market for ${properties.length} properties in ${location}`);
        
        const analysis = {
            location: location,
            totalListings: properties.length,
            avgPrice: this.calculateAverage(properties, 'price'),
            medianPrice: this.calculateMedian(properties, 'price'),
            avgPricePerSqft: this.calculatePricePerSqft(properties),
            avgDaysOnMarket: this.calculateAverage(properties, 'daysOnMarket'),
            marketTrend: this.determineTrend(properties),
            competitiveLevel: this.assessCompetition(properties),
            priceRange: this.getPriceRange(properties),
            propertyTypeDistribution: this.getPropertyTypeDistribution(properties),
            insights: this.generateInsights(properties, location),
            opportunities: this.identifyOpportunities(properties),
            marketScore: this.calculateMarketScore(properties)
        };
        
        // Cache the analysis
        this.marketData.set(location, {
            ...analysis,
            timestamp: Date.now()
        });
        
        console.log('Market analysis complete:', {
            avgPrice: analysis.avgPrice,
            trend: analysis.marketTrend,
            competition: analysis.competitiveLevel
        });
        
        return analysis;
    }

    // Legacy method for backward compatibility
    async analyzeProperties(properties) {
        return this.analyzeMarket(properties, 'Unknown Location');
    }

    calculateAverage(properties, field) {
        const values = properties.filter(p => p[field] && p[field] > 0).map(p => Number(p[field]));
        return values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
    }

    calculateMedian(properties, field) {
        const values = properties.filter(p => p[field] && p[field] > 0).map(p => Number(p[field])).sort((a, b) => a - b);
        if (values.length === 0) return 0;
        
        const mid = Math.floor(values.length / 2);
        return values.length % 2 === 0 ? 
            Math.round((values[mid - 1] + values[mid]) / 2) : 
            values[mid];
    }

    calculatePricePerSqft(properties) {
        const validProperties = properties.filter(p => p.price && p.squareFootage && p.squareFootage > 0);
        if (validProperties.length === 0) return 0;
        
        const totalValue = validProperties.reduce((sum, p) => sum + (p.price / p.squareFootage), 0);
        return Math.round(totalValue / validProperties.length);
    }

    getPriceRange(properties) {
        const prices = properties.filter(p => p.price && p.price > 0).map(p => p.price);
        if (prices.length === 0) return { min: 0, max: 0 };
        
        return {
            min: Math.min(...prices),
            max: Math.max(...prices)
        };
    }

    getPropertyTypeDistribution(properties) {
        const distribution = {};
        properties.forEach(p => {
            if (p.propertyType) {
                distribution[p.propertyType] = (distribution[p.propertyType] || 0) + 1;
            }
        });
        return distribution;
    }

    determineTrend(properties) {
        const avgDaysOnMarket = this.calculateAverage(properties, 'daysOnMarket');
        const recentListings = properties.filter(p => p.daysOnMarket < 30).length;
        const totalListings = properties.length;
        
        const recentPercentage = totalListings > 0 ? (recentListings / totalListings) * 100 : 0;
        
        if (avgDaysOnMarket < 15 && recentPercentage > 60) {
            return { status: 'Hot Market', confidence: 'High' };
        } else if (avgDaysOnMarket < 30 && recentPercentage > 40) {
            return { status: 'Seller\'s Market', confidence: 'Medium' };
        } else if (avgDaysOnMarket < 60) {
            return { status: 'Balanced Market', confidence: 'Medium' };
        } else {
            return { status: 'Buyer\'s Market', confidence: 'High' };
        }
    }

    assessCompetition(properties) {
        const totalListings = properties.length;
        const avgDaysOnMarket = this.calculateAverage(properties, 'daysOnMarket');
        const priceRange = this.getPriceRange(properties);
        const priceSpread = priceRange.max - priceRange.min;
        
        let competitionScore = 0;
        
        // Listing density
        if (totalListings > 100) competitionScore += 3;
        else if (totalListings > 50) competitionScore += 2;
        else if (totalListings > 20) competitionScore += 1;
        
        // Market speed
        if (avgDaysOnMarket < 15) competitionScore += 3;
        else if (avgDaysOnMarket < 30) competitionScore += 2;
        else if (avgDaysOnMarket < 60) competitionScore += 1;
        
        // Price competition (wider spread = less competition)
        if (priceRange.max > 0 && priceSpread / priceRange.max < 0.5) competitionScore += 2;
        else if (priceRange.max > 0 && priceSpread / priceRange.max < 1.0) competitionScore += 1;
        
        if (competitionScore >= 7) return { level: 'Very High', score: competitionScore };
        if (competitionScore >= 5) return { level: 'High', score: competitionScore };
        if (competitionScore >= 3) return { level: 'Moderate', score: competitionScore };
        return { level: 'Low', score: competitionScore };
    }

    identifyOpportunities(properties) {
        const opportunities = [];
        
        // Long-term listings (potential negotiation)
        const longTerm = properties.filter(p => p.daysOnMarket > 90);
        if (longTerm.length > 0) {
            opportunities.push({
                type: 'Negotiation Opportunities',
                count: longTerm.length,
                description: `${longTerm.length} properties have been on market >90 days`,
                icon: '💰'
            });
        }
        
        // Price drops or below-average pricing
        const avgPrice = this.calculateAverage(properties, 'price');
        const belowAverage = properties.filter(p => p.price && p.price < avgPrice * 0.85);
        if (belowAverage.length > 0) {
            opportunities.push({
                type: 'Value Opportunities',
                count: belowAverage.length,
                description: `${belowAverage.length} properties priced significantly below average`,
                icon: '💎'
            });
        }
        
        // New listings in hot market
        const newListings = properties.filter(p => p.daysOnMarket < 7);
        if (newListings.length > 5) {
            opportunities.push({
                type: 'Fresh Inventory',
                count: newListings.length,
                description: `${newListings.length} new listings this week`,
                icon: '⚡'
            });
        }
        
        return opportunities;
    }

    calculateMarketScore(properties) {
        let score = 50; // Base score
        
        const avgDaysOnMarket = this.calculateAverage(properties, 'daysOnMarket');
        const competition = this.assessCompetition(properties);
        const avgPrice = this.calculateAverage(properties, 'price');
        const totalListings = properties.length;
        
        // Market activity (lower days = higher score)
        if (avgDaysOnMarket < 15) score += 25;
        else if (avgDaysOnMarket < 30) score += 15;
        else if (avgDaysOnMarket < 60) score += 5;
        else score -= 10;
        
        // Inventory levels
        if (totalListings > 50) score += 15;
        else if (totalListings > 20) score += 10;
        else if (totalListings < 10) score -= 15;
        
        // Price reasonableness (not too extreme)
        if (avgPrice > 100000 && avgPrice < 1000000) score += 10;
        
        return {
            score: Math.max(0, Math.min(100, score)),
            rating: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor',
            factors: {
                marketActivity: avgDaysOnMarket < 30 ? 'Active' : 'Slow',
                inventory: totalListings > 30 ? 'Good Selection' : 'Limited Options',
                competition: competition.level
            }
        };
    }

    generateInsights(properties, location = 'Unknown') {
        const insights = [];
        const avgDays = this.calculateAverage(properties, 'daysOnMarket');
        const avgPrice = this.calculateAverage(properties, 'price');
        const avgPricePerSqft = this.calculatePricePerSqft(properties);
        const competition = this.assessCompetition(properties);
        const trend = this.determineTrend(properties);
        
        // Market speed insight
        if (avgDays < 7) {
            insights.push({
                type: 'urgent',
                text: `🔥 Fast-moving market! Properties sell in ${avgDays} days on average. Be ready to act quickly.`,
                priority: 'high',
                icon: '🔥'
            });
        } else if (avgDays < 30) {
            insights.push({
                type: 'info',
                text: `⏱️ Moderately active market with ${avgDays} average days on market.`,
                priority: 'medium',
                icon: '⏱️'
            });
        } else {
            insights.push({
                type: 'opportunity',
                text: `🤝 Buyer-friendly market! Properties stay listed ${avgDays} days on average - time to negotiate.`,
                priority: 'medium',
                icon: '🤝'
            });
        }
        
        // Price insight
        if (avgPrice > 0) {
            if (avgPrice > 750000) {
                insights.push({
                    type: 'info',
                    text: `💰 Premium market area with average price of $${avgPrice.toLocaleString()}`,
                    priority: 'medium',
                    icon: '💰'
                });
            } else if (avgPrice < 300000) {
                insights.push({
                    type: 'opportunity',
                    text: `💎 Affordable market with average price of $${avgPrice.toLocaleString()}`,
                    priority: 'medium',
                    icon: '💎'
                });
            }
        }
        
        // Competition insight
        if (competition.level === 'Very High' || competition.level === 'High') {
            insights.push({
                type: 'warning',
                text: `⚔️ ${competition.level.toLowerCase()} competition market. Consider pre-approval and competitive offers.`,
                priority: 'high',
                icon: '⚔️'
            });
        }
        
        return insights.slice(0, 4); // Limit to top 4 insights
    }
}

class AutoSearchAssistant {
    constructor() {
        this.savedSearches = [];
        this.notifications = [];
        console.log('Auto Search Assistant initialized');
    }

    async setupAutoSearch(criteria) {
        const searchId = `search_${Date.now()}`;
        const autoSearch = {
            id: searchId,
            criteria: criteria,
            created: new Date(),
            lastCheck: null,
            frequency: 'daily',
            active: true
        };
        
        this.savedSearches.push(autoSearch);
        console.log('Auto search setup:', autoSearch);
        
        return {
            success: true,
            searchId: searchId,
            message: 'Auto search created successfully',
            nextCheck: this.getNextCheckTime('daily')
        };
    }

    async checkForUpdates(searchId) {
        const search = this.savedSearches.find(s => s.id === searchId);
        if (!search) return { error: 'Search not found' };
        
        // Simulate finding new properties
        const newProperties = Math.floor(Math.random() * 5);
        search.lastCheck = new Date();
        
        if (newProperties > 0) {
            const notification = {
                id: `notification_${Date.now()}`,
                searchId: searchId,
                type: 'new_properties',
                count: newProperties,
                message: `${newProperties} new properties match your saved search`,
                timestamp: new Date(),
                read: false
            };
            
            this.notifications.push(notification);
            return { newProperties, notification };
        }
        
        return { newProperties: 0, message: 'No new properties found' };
    }

    getNextCheckTime(frequency) {
        const now = new Date();
        switch (frequency) {
            case 'hourly': return new Date(now.getTime() + 60 * 60 * 1000);
            case 'daily': return new Date(now.getTime() + 24 * 60 * 60 * 1000);
            case 'weekly': return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            default: return new Date(now.getTime() + 24 * 60 * 60 * 1000);
        }
    }

    getNotifications() {
        return this.notifications.sort((a, b) => b.timestamp - a.timestamp);
    }
}

class InvestmentAnalyzer {
    constructor() {
        this.analysisCache = new Map();
        console.log('Investment Analyzer initialized');
    }

    async analyzeInvestmentPotential(property) {
        console.log('Analyzing investment potential for:', property.formattedAddress || 'Unknown property');
        
        const analysis = {
            propertyId: property.id || 'unknown',
            address: property.formattedAddress,
            purchasePrice: property.price || 0,
            estimatedRent: this.estimateRent(property),
            monthlyExpenses: this.calculateExpenses(property),
            roi: null,
            cashFlow: null,
            capRate: null,
            analysis: null,
            recommendation: null,
            risks: [],
            opportunities: []
        };
        
        // Calculate key metrics
        if (analysis.estimatedRent > 0 && analysis.purchasePrice > 0) {
            const annualRent = analysis.estimatedRent * 12;
            const annualExpenses = analysis.monthlyExpenses * 12;
            const netOperatingIncome = annualRent - annualExpenses;
            
            analysis.cashFlow = analysis.estimatedRent - analysis.monthlyExpenses;
            analysis.capRate = (netOperatingIncome / analysis.purchasePrice) * 100;
            analysis.roi = this.calculateROI(property, analysis);
            
            analysis.analysis = this.generateAnalysis(analysis);
            analysis.recommendation = this.generateRecommendation(analysis);
            analysis.risks = this.identifyRisks(property, analysis);
            analysis.opportunities = this.identifyOpportunities(property, analysis);
        }
        
        this.analysisCache.set(property.id, analysis);
        return analysis;
    }

    estimateRent(property) {
        // Simple rent estimation based on property details
        if (!property.price) return 0;
        
        let rentEstimate = property.price * 0.005; // 0.5% of purchase price as starting point
        
        // Adjust based on bedrooms
        if (property.bedrooms) {
            rentEstimate = Math.max(rentEstimate, property.bedrooms * 500);
        }
        
        // Adjust based on square footage
        if (property.squareFootage) {
            const pricePerSqft = rentEstimate / property.squareFootage;
            if (pricePerSqft < 1.5) rentEstimate = property.squareFootage * 1.5;
            if (pricePerSqft > 3.5) rentEstimate = property.squareFootage * 3.5;
        }
        
        return Math.round(rentEstimate);
    }

    calculateExpenses(property) {
        const purchasePrice = property.price || 0;
        let monthlyExpenses = 0;
        
        // Property taxes (estimated 1.2% annually)
        monthlyExpenses += (purchasePrice * 0.012) / 12;
        
        // Insurance (estimated 0.5% annually)
        monthlyExpenses += (purchasePrice * 0.005) / 12;
        
        // Maintenance (estimated 1% annually)
        monthlyExpenses += (purchasePrice * 0.01) / 12;
        
        // Property management (8% of rent)
        const estimatedRent = this.estimateRent(property);
        monthlyExpenses += estimatedRent * 0.08;
        
        // Vacancy allowance (5% of rent)
        monthlyExpenses += estimatedRent * 0.05;
        
        return Math.round(monthlyExpenses);
    }

    calculateROI(property, analysis) {
        const downPayment = property.price * 0.25; // Assume 25% down
        const annualCashFlow = analysis.cashFlow * 12;
        
        if (downPayment > 0) {
            return (annualCashFlow / downPayment) * 100;
        }
        return 0;
    }

    generateAnalysis(analysis) {
        const insights = [];
        
        if (analysis.capRate > 8) {
            insights.push('Excellent cap rate indicates strong investment potential');
        } else if (analysis.capRate > 6) {
            insights.push('Good cap rate for steady returns');
        } else if (analysis.capRate > 4) {
            insights.push('Moderate cap rate - consider market appreciation');
        } else {
            insights.push('Low cap rate - focus on appreciation potential');
        }
        
        if (analysis.cashFlow > 500) {
            insights.push('Strong positive cash flow');
        } else if (analysis.cashFlow > 0) {
            insights.push('Positive cash flow with room for improvement');
        } else {
            insights.push('Negative cash flow - requires market appreciation');
        }
        
        return insights.join('. ');
    }

    generateRecommendation(analysis) {
        const score = this.calculateInvestmentScore(analysis);
        
        if (score >= 80) return { rating: 'Excellent', action: 'Strong Buy', confidence: 'High' };
        if (score >= 60) return { rating: 'Good', action: 'Consider Buying', confidence: 'Medium' };
        if (score >= 40) return { rating: 'Fair', action: 'Proceed with Caution', confidence: 'Low' };
        return { rating: 'Poor', action: 'Avoid', confidence: 'High' };
    }

    calculateInvestmentScore(analysis) {
        let score = 50;
        
        if (analysis.capRate > 8) score += 25;
        else if (analysis.capRate > 6) score += 15;
        else if (analysis.capRate > 4) score += 5;
        else score -= 10;
        
        if (analysis.cashFlow > 500) score += 20;
        else if (analysis.cashFlow > 0) score += 10;
        else score -= 20;
        
        if (analysis.roi > 15) score += 15;
        else if (analysis.roi > 10) score += 10;
        else if (analysis.roi > 5) score += 5;
        
        return Math.max(0, Math.min(100, score));
    }

    identifyRisks(property, analysis) {
        const risks = [];
        
        if (analysis.cashFlow < 0) {
            risks.push({ type: 'Cash Flow Risk', severity: 'High', description: 'Negative monthly cash flow' });
        }
        
        if (analysis.capRate < 4) {
            risks.push({ type: 'Low Returns', severity: 'Medium', description: 'Below-market cap rate' });
        }
        
        if (property.daysOnMarket > 90) {
            risks.push({ type: 'Market Demand', severity: 'Medium', description: 'Property has been on market for extended time' });
        }
        
        return risks;
    }

    identifyOpportunities(property, analysis) {
        const opportunities = [];
        
        if (analysis.capRate > 8) {
            opportunities.push({ type: 'High Returns', description: 'Excellent cap rate for strong income' });
        }
        
        if (property.price < 200000) {
            opportunities.push({ type: 'Affordable Entry', description: 'Lower price point reduces barrier to entry' });
        }
        
        return opportunities;
    }
}

class NeighborhoodInsights {
    constructor() {
        this.neighborhoodData = new Map();
        console.log('Neighborhood Insights initialized');
    }

    async analyzeNeighborhood(location, properties) {
        console.log(`Analyzing neighborhood: ${location} with ${properties.length} properties`);
        
        const analysis = {
            location: location,
            overview: this.generateOverview(properties),
            demographics: this.analyzeDemographics(properties),
            marketHealth: this.assessMarketHealth(properties),
            amenities: this.identifyAmenities(location),
            transportation: this.analyzeTransportation(location),
            schools: this.analyzeSchools(location),
            safety: this.analyzeSafety(location),
            trends: this.analyzeMarketTrends(properties),
            recommendations: this.generateRecommendations(properties),
            score: this.calculateNeighborhoodScore(properties)
        };
        
        this.neighborhoodData.set(location, analysis);
        return analysis;
    }

    generateOverview(properties) {
        const avgPrice = properties.reduce((sum, p) => sum + (p.price || 0), 0) / properties.length;
        const avgDays = properties.reduce((sum, p) => sum + (p.daysOnMarket || 0), 0) / properties.length;
        
        return {
            totalListings: properties.length,
            averagePrice: Math.round(avgPrice),
            averageDaysOnMarket: Math.round(avgDays),
            priceRange: {
                min: Math.min(...properties.map(p => p.price || 0)),
                max: Math.max(...properties.map(p => p.price || 0))
            }
        };
    }

    analyzeDemographics(properties) {
        const propertyTypes = {};
        const bedroomDist = {};
        
        properties.forEach(p => {
            if (p.propertyType) {
                propertyTypes[p.propertyType] = (propertyTypes[p.propertyType] || 0) + 1;
            }
            if (p.bedrooms) {
                bedroomDist[p.bedrooms] = (bedroomDist[p.bedrooms] || 0) + 1;
            }
        });
        
        return {
            propertyTypes,
            bedroomDistribution: bedroomDist,
            dominantType: Object.keys(propertyTypes).reduce((a, b) => propertyTypes[a] > propertyTypes[b] ? a : b, 'Mixed'),
            avgBedrooms: properties.reduce((sum, p) => sum + (p.bedrooms || 0), 0) / properties.length
        };
    }

    assessMarketHealth(properties) {
        const avgDays = properties.reduce((sum, p) => sum + (p.daysOnMarket || 0), 0) / properties.length;
        const recentListings = properties.filter(p => (p.daysOnMarket || 0) < 30).length;
        const activityLevel = recentListings / properties.length;
        
        let healthScore = 50;
        if (avgDays < 30) healthScore += 25;
        if (activityLevel > 0.6) healthScore += 25;
        
        return {
            score: Math.round(healthScore),
            activity: activityLevel > 0.6 ? 'High' : activityLevel > 0.3 ? 'Moderate' : 'Low',
            averageDaysOnMarket: Math.round(avgDays),
            marketStatus: avgDays < 30 ? 'Active' : avgDays < 60 ? 'Moderate' : 'Slow'
        };
    }

    identifyAmenities(location) {
        // Simulated amenity analysis - in real implementation would use external APIs
        return [
            { name: 'Parks & Recreation', distance: '0.5 miles', type: 'recreation' },
            { name: 'Shopping Centers', distance: '1.2 miles', type: 'shopping' },
            { name: 'Restaurants', distance: '0.8 miles', type: 'dining' },
            { name: 'Medical Facilities', distance: '2.1 miles', type: 'healthcare' }
        ];
    }

    analyzeTransportation(location) {
        return {
            walkScore: Math.floor(Math.random() * 40) + 60, // Simulated 60-100
            transitScore: Math.floor(Math.random() * 30) + 40, // Simulated 40-70
            bikeScore: Math.floor(Math.random() * 35) + 45, // Simulated 45-80
            majorRoads: ['Highway access within 3 miles', 'Public transit nearby'],
            commuteTimes: {
                downtown: '25-35 minutes',
                airport: '20-30 minutes'
            }
        };
    }

    analyzeSchools(location) {
        return {
            elementary: { rating: Math.floor(Math.random() * 4) + 7, distance: '0.4 miles' },
            middle: { rating: Math.floor(Math.random() * 3) + 6, distance: '0.8 miles' },
            high: { rating: Math.floor(Math.random() * 4) + 6, distance: '1.2 miles' },
            overall: 'Above Average'
        };
    }

    analyzeSafety(location) {
        const crimeScore = Math.floor(Math.random() * 30) + 70; // Simulated 70-100
        return {
            crimeScore: crimeScore,
            rating: crimeScore > 85 ? 'Very Safe' : crimeScore > 70 ? 'Safe' : crimeScore > 55 ? 'Moderate' : 'Below Average',
            recentTrends: crimeScore > 80 ? 'Improving' : 'Stable'
        };
    }

    analyzeMarketTrends(properties) {
        return {
            priceDirection: Math.random() > 0.6 ? 'Rising' : Math.random() > 0.3 ? 'Stable' : 'Declining',
            inventoryLevel: properties.length > 50 ? 'High' : properties.length > 20 ? 'Moderate' : 'Low',
            competitionLevel: properties.length > 30 ? 'High' : 'Moderate'
        };
    }

    generateRecommendations(properties) {
        const recommendations = [];
        const avgDays = properties.reduce((sum, p) => sum + (p.daysOnMarket || 0), 0) / properties.length;
        
        if (avgDays < 20) {
            recommendations.push({
                type: 'Market Timing',
                text: 'Fast-moving market - be prepared to act quickly on good properties',
                priority: 'High'
            });
        }
        
        if (properties.length > 50) {
            recommendations.push({
                type: 'Selection',
                text: 'Good inventory selection - take time to compare options',
                priority: 'Medium'
            });
        }
        
        return recommendations;
    }

    calculateNeighborhoodScore(properties) {
        let score = 50;
        
        const marketHealth = this.assessMarketHealth(properties);
        score += (marketHealth.score - 50) * 0.4;
        
        const avgPrice = properties.reduce((sum, p) => sum + (p.price || 0), 0) / properties.length;
        if (avgPrice > 200000 && avgPrice < 800000) score += 15;
        
        if (properties.length > 20) score += 10;
        
        return {
            overall: Math.round(Math.max(0, Math.min(100, score))),
            rating: score > 80 ? 'Excellent' : score > 65 ? 'Good' : score > 50 ? 'Average' : 'Below Average'
        };
    }
}

// Initialize the AI system
window.PropertyAISystem = PropertyAISystem;
window.propertyAI = new PropertyAISystem();