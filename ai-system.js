// Comprehensive AI Property Search System
class PropertyAISystem {
    constructor() {
        this.features = {};
        this.usage = this.loadUsageData();
        this.initializeFeatures();
    }

    // Initialize all AI features based on toggle settings
    initializeFeatures() {
        if (AI_CONFIG.FEATURES.NATURAL_LANGUAGE_SEARCH) {
            this.features.nlSearch = new NaturalLanguageSearch();
        }
        
        if (AI_CONFIG.FEATURES.SMART_RECOMMENDATIONS) {
            this.features.recommendations = new SmartRecommendations();
        }
        
        if (AI_CONFIG.FEATURES.MARKET_INTELLIGENCE) {
            this.features.marketIntel = new MarketIntelligence();
        }
        
        if (AI_CONFIG.FEATURES.AUTO_SEARCH) {
            this.features.autoSearch = new AutoSearchAssistant();
        }
        
        if (AI_CONFIG.FEATURES.INVESTMENT_ANALYZER) {
            this.features.investment = new InvestmentAnalyzer();
        }
        
        if (AI_CONFIG.FEATURES.NEIGHBORHOOD_INSIGHTS) {
            this.features.neighborhood = new NeighborhoodInsights();
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
        const results = {};
        
        // Natural Language Search
        if (this.isFeatureEnabled('NATURAL_LANGUAGE_SEARCH')) {
            try {
                results.searchParams = await this.features.nlSearch.processQuery(query);
                this.trackUsage('NATURAL_LANGUAGE_SEARCH');
            } catch (error) {
                console.warn('Natural Language Search failed:', error);
            }
        }
        
        // Execute the search with AI-generated parameters
        if (results.searchParams) {
            const properties = await this.executePropertySearch(results.searchParams);
            
            // Smart Recommendations
            if (this.isFeatureEnabled('SMART_RECOMMENDATIONS')) {
                try {
                    results.recommendations = await this.features.recommendations.scoreProperties(properties);
                    this.trackUsage('SMART_RECOMMENDATIONS');
                } catch (error) {
                    console.warn('Smart Recommendations failed:', error);
                }
            }
            
            // Market Intelligence
            if (this.isFeatureEnabled('MARKET_INTELLIGENCE')) {
                try {
                    results.marketInsights = await this.features.marketIntel.analyzeProperties(properties);
                    this.trackUsage('MARKET_INTELLIGENCE');
                } catch (error) {
                    console.warn('Market Intelligence failed:', error);
                }
            }
            
            // Investment Analysis
            if (this.isFeatureEnabled('INVESTMENT_ANALYZER')) {
                try {
                    results.investmentAnalysis = await this.features.investment.analyzeROI(properties);
                    this.trackUsage('INVESTMENT_ANALYZER');
                } catch (error) {
                    console.warn('Investment Analysis failed:', error);
                }
            }
            
            return { properties, aiResults: results };
        }
        
        return null;
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
    async processQuery(query) {
        if (!AI_CONFIG.OPENAI_API_KEY || AI_CONFIG.OPENAI_API_KEY === 'your_openai_api_key_here') {
            return this.fallbackParser(query);
        }

        const systemPrompt = `Convert natural language property searches to API parameters. 
Return JSON with: city, state, minPrice, maxPrice, minBedrooms, maxBedrooms, propertyType.
Example: "3 bedroom house under 400k in Austin TX" -> {"city":"Austin","state":"TX","maxPrice":400000,"minBedrooms":3}`;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${AI_CONFIG.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: AI_CONFIG.AI_MODEL_PREFERENCE,
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: query }
                    ],
                    max_tokens: 150,
                    temperature: 0.1
                })
            });

            const data = await response.json();
            return JSON.parse(data.choices[0].message.content);
        } catch (error) {
            console.error('OpenAI API error:', error);
            return this.fallbackParser(query);
        }
    }

    fallbackParser(query) {
        const params = {};
        const lower = query.toLowerCase();
        
        // Extract basic patterns
        const cityMatch = lower.match(/in ([^,]+),?\s*([a-z]{2})?/);
        if (cityMatch) {
            params.city = cityMatch[1].trim();
            if (cityMatch[2]) params.state = cityMatch[2].toUpperCase();
        }
        
        const priceMatch = lower.match(/under \$?([\d,]+)k?/);
        if (priceMatch) {
            let price = parseInt(priceMatch[1].replace(/,/g, ''));
            params.maxPrice = priceMatch[0].includes('k') ? price * 1000 : price;
        }
        
        const bedroomMatch = lower.match(/(\d+)[\s-]?bed/);
        if (bedroomMatch) {
            params.minBedrooms = parseInt(bedroomMatch[1]);
        }
        
        return params;
    }
}

class SmartRecommendations {
    constructor() {
        this.userProfile = this.loadUserProfile();
    }

    async scoreProperties(properties) {
        return properties.map(property => ({
            ...property,
            aiScore: this.calculateScore(property),
            reasons: this.generateReasons(property)
        })).sort((a, b) => b.aiScore - a.aiScore);
    }

    calculateScore(property) {
        let score = 50; // Base score
        
        // Price scoring based on user history
        if (this.userProfile.avgPrice) {
            const priceDiff = Math.abs(property.price - this.userProfile.avgPrice);
            const priceScore = Math.max(0, 30 - (priceDiff / this.userProfile.avgPrice * 30));
            score += priceScore;
        }
        
        // Property type preference
        if (this.userProfile.preferredTypes && this.userProfile.preferredTypes[property.propertyType]) {
            score += this.userProfile.preferredTypes[property.propertyType] * 20;
        }
        
        return Math.min(100, score);
    }

    generateReasons(property) {
        const reasons = [];
        
        if (property.aiScore > 80) {
            reasons.push("Perfect match for your preferences");
        }
        
        if (property.daysOnMarket < 5) {
            reasons.push("New listing - act fast!");
        }
        
        return reasons;
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
    async analyzeProperties(properties) {
        // Simple market analysis - could be enhanced with external data
        const analysis = {
            avgPrice: this.calculateAverage(properties, 'price'),
            avgDaysOnMarket: this.calculateAverage(properties, 'daysOnMarket'),
            priceRange: this.getPriceRange(properties),
            insights: this.generateInsights(properties)
        };
        
        return analysis;
    }

    calculateAverage(properties, field) {
        if (properties.length === 0) return 0;
        const sum = properties.reduce((acc, prop) => acc + (prop[field] || 0), 0);
        return Math.round(sum / properties.length);
    }

    getPriceRange(properties) {
        const prices = properties.map(p => p.price).filter(p => p);
        return {
            min: Math.min(...prices),
            max: Math.max(...prices)
        };
    }

    generateInsights(properties) {
        const insights = [];
        const avgDays = this.calculateAverage(properties, 'daysOnMarket');
        
        if (avgDays < 30) {
            insights.push({
                type: 'market-speed',
                text: 'Hot market - properties selling quickly',
                icon: '🔥'
            });
        }
        
        return insights;
    }
}

// Additional feature classes would go here...
class AutoSearchAssistant {
    // Implementation for background search notifications
}

class InvestmentAnalyzer {
    // Implementation for ROI analysis
}

class NeighborhoodInsights {
    // Implementation for area analysis
}

// Initialize the AI system
window.PropertyAISystem = PropertyAISystem;
window.propertyAI = new PropertyAISystem();