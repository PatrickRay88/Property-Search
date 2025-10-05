// AI UI Controller - Manages the AI interface interactions
class AIUIController {
    constructor() {
        this.initializeEventListeners();
        this.updateUIFromConfig();
        this.loadUsageStats();
    }

    initializeEventListeners() {
        // Feature toggle listeners
        document.getElementById('toggle-nlp').addEventListener('change', (e) => {
            this.handleFeatureToggle('NATURAL_LANGUAGE_SEARCH', e.target.checked);
        });

        document.getElementById('toggle-recommendations').addEventListener('change', (e) => {
            this.handleFeatureToggle('SMART_RECOMMENDATIONS', e.target.checked);
        });

        document.getElementById('toggle-market').addEventListener('change', (e) => {
            this.handleFeatureToggle('MARKET_INTELLIGENCE', e.target.checked);
        });

        document.getElementById('toggle-auto').addEventListener('change', (e) => {
            this.handleFeatureToggle('AUTO_SEARCH', e.target.checked);
        });

        document.getElementById('toggle-investment').addEventListener('change', (e) => {
            this.handleFeatureToggle('INVESTMENT_ANALYZER', e.target.checked);
        });

        document.getElementById('toggle-neighborhood').addEventListener('change', (e) => {
            this.handleFeatureToggle('NEIGHBORHOOD_INSIGHTS', e.target.checked);
        });

        // AI search input enhancement
        const aiSearchInput = document.getElementById('ai-search-input');
        if (aiSearchInput) {
            aiSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    performAISearch();
                }
            });

            aiSearchInput.addEventListener('input', (e) => {
                this.showSearchSuggestions(e.target.value);
            });
        }
    }

    handleFeatureToggle(featureName, enabled) {
        if (window.propertyAI) {
            window.propertyAI.toggleFeature(featureName, enabled);
            this.updateFeatureUI(featureName, enabled);
            this.showFeatureToggleNotification(featureName, enabled);
        }
    }

    updateFeatureUI(featureName, enabled) {
        const featureId = this.getFeatureId(featureName);
        const statsElement = document.getElementById(`stats-${featureId}`);
        
        if (statsElement) {
            const usageElement = statsElement.querySelector('.usage-count');
            if (enabled) {
                usageElement.textContent = '0 uses today';
                statsElement.style.opacity = '1';
            } else {
                usageElement.textContent = 'Disabled';
                statsElement.style.opacity = '0.6';
            }
        }

        // Update AI status indicator
        this.updateAIStatusIndicator();
    }

    updateAIStatusIndicator() {
        const statusElement = document.getElementById('ai-status');
        if (!statusElement) return;

        const enabledFeatures = Object.values(AI_CONFIG.FEATURES).filter(Boolean).length;
        
        if (enabledFeatures === 0) {
            statusElement.innerHTML = '🔴 Inactive';
            statusElement.style.color = '#ff6b6b';
        } else if (enabledFeatures <= 2) {
            statusElement.innerHTML = '🟡 Basic';
            statusElement.style.color = '#ffa500';
        } else {
            statusElement.innerHTML = '🟢 Full Power';
            statusElement.style.color = '#4CAF50';
        }
    }

    showFeatureToggleNotification(featureName, enabled) {
        const featureFriendlyNames = {
            'NATURAL_LANGUAGE_SEARCH': 'Natural Language Search',
            'SMART_RECOMMENDATIONS': 'Smart Recommendations',
            'MARKET_INTELLIGENCE': 'Market Intelligence',
            'AUTO_SEARCH': 'Auto-Search Assistant',
            'INVESTMENT_ANALYZER': 'Investment Analyzer',
            'NEIGHBORHOOD_INSIGHTS': 'Neighborhood Insights'
        };

        const friendlyName = featureFriendlyNames[featureName] || featureName;
        const action = enabled ? 'enabled' : 'disabled';
        
        this.showNotification(`${friendlyName} ${action}`, enabled ? 'success' : 'info');
    }

    showNotification(message, type = 'info') {
        // Create and show a notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : 'ℹ️'}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;

        // Add notification styles if not already present
        this.addNotificationStyles();

        document.body.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    addNotificationStyles() {
        if (document.getElementById('notification-styles')) return;

        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 10px;
                padding: 15px 20px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                z-index: 1000;
                animation: slideIn 0.3s ease;
                max-width: 300px;
            }

            .notification-success {
                border-left: 4px solid #4CAF50;
            }

            .notification-info {
                border-left: 4px solid #2196F3;
            }

            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .notification-message {
                font-size: 0.9em;
                color: #333;
            }

            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    updateUIFromConfig() {
        // Update toggle switches based on current config
        Object.keys(AI_CONFIG.FEATURES).forEach(featureName => {
            const featureId = this.getFeatureId(featureName);
            const toggle = document.getElementById(`toggle-${featureId}`);
            if (toggle) {
                toggle.checked = AI_CONFIG.FEATURES[featureName];
                this.updateFeatureUI(featureName, AI_CONFIG.FEATURES[featureName]);
            }
        });

        this.updateAIStatusIndicator();
    }

    loadUsageStats() {
        // Load and display usage statistics
        if (window.propertyAI) {
            const monthlyUsage = window.propertyAI.getMonthlyUsage();
            this.updateUsageDisplay(monthlyUsage);
        }
    }

    updateUsageDisplay(usage) {
        const monthlyCostElement = document.getElementById('monthly-cost');
        if (monthlyCostElement && usage) {
            const totalCost = Object.values(usage).reduce((sum, day) => 
                sum + Object.values(day).reduce((daySum, feature) => daySum + feature.cost, 0), 0);
            monthlyCostElement.textContent = `$${totalCost.toFixed(2)}`;
        }
    }

    showSearchSuggestions(query) {
        if (query.length < 3) return;

        // Simple suggestion logic - could be enhanced with AI
        const suggestions = this.generateSmartSuggestions(query);
        this.displaySuggestions(suggestions);
    }

    generateSmartSuggestions(query) {
        const templates = [
            'Find me a {bedrooms} bedroom {type} under ${price}k in {location}',
            '{bedrooms} bed {type} with good schools in {location}',
            'Luxury {type} with {features} in {location}',
            'Investment property under ${price}k in {location}'
        ];

        // Extract elements from query
        const bedrooms = query.match(/(\d+)\s*bed/i)?.[1] || '3';
        const price = query.match(/\$?(\d+)k?/i)?.[1] || '400';
        const type = query.match(/(house|condo|apartment|townhouse)/i)?.[1] || 'house';
        
        return templates.slice(0, 3).map(template => 
            template
                .replace('{bedrooms}', bedrooms)
                .replace('{type}', type)
                .replace('{price}', price)
                .replace('{location}', 'Austin TX')
                .replace('{features}', 'modern kitchen')
        );
    }

    displaySuggestions(suggestions) {
        const container = document.getElementById('search-suggestions');
        if (!container) return;

        container.innerHTML = '';
        suggestions.forEach(suggestion => {
            const chip = document.createElement('span');
            chip.className = 'suggestion-chip';
            chip.textContent = suggestion;
            chip.onclick = () => fillAISearch(suggestion);
            container.appendChild(chip);
        });
    }

    getFeatureId(featureName) {
        const idMap = {
            'NATURAL_LANGUAGE_SEARCH': 'nlp',
            'SMART_RECOMMENDATIONS': 'recommendations',
            'MARKET_INTELLIGENCE': 'market',
            'AUTO_SEARCH': 'auto',
            'INVESTMENT_ANALYZER': 'investment',
            'NEIGHBORHOOD_INSIGHTS': 'neighborhood'
        };
        return idMap[featureName] || featureName.toLowerCase();
    }

    displayAIResults(results) {
        // Display AI search results
        if (results.aiResults.recommendations) {
            this.displayRecommendations(results.aiResults.recommendations);
        }

        if (results.aiResults.marketInsights) {
            this.displayMarketInsights(results.aiResults.marketInsights);
        }

        // Update usage stats
        this.loadUsageStats();
    }

    displayRecommendations(recommendations) {
        const section = document.getElementById('recommendations-section');
        const container = document.getElementById('recommended-properties');
        
        if (!section || !container) return;

        section.style.display = 'block';
        
        const topRecommendations = recommendations.slice(0, 3);
        container.innerHTML = topRecommendations.map(property => `
            <div class="listing ai-recommended">
                <div class="ai-score-badge">${Math.round(property.aiScore)}</div>
                <h2>${property.formattedAddress}</h2>
                <p class="price-highlight"><strong>Price:</strong> $${this.formatPrice(property.price)}</p>
                <p><strong>Property Type:</strong> ${property.propertyType}</p>
                <p><strong>Bedrooms:</strong> ${property.bedrooms} | <strong>Bathrooms:</strong> ${property.bathrooms}</p>
                ${property.reasons ? `
                    <div class="ai-insights">
                        ${property.reasons.map(reason => `
                            <div class="ai-insight-item">
                                <span>🎯</span>
                                <span>${reason}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    displayMarketInsights(insights) {
        const panel = document.getElementById('ai-insights-panel');
        const container = document.getElementById('ai-insights-content');
        
        if (!panel || !container) return;

        panel.style.display = 'block';
        
        container.innerHTML = `
            <div class="market-stats">
                <div class="stat-item">
                    <span class="stat-icon">💰</span>
                    <span class="stat-text">Average Price: $${this.formatPrice(insights.avgPrice)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">📅</span>
                    <span class="stat-text">Average Days on Market: ${insights.avgDaysOnMarket}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">📊</span>
                    <span class="stat-text">Price Range: $${this.formatPrice(insights.priceRange.min)} - $${this.formatPrice(insights.priceRange.max)}</span>
                </div>
            </div>
            ${insights.insights.length > 0 ? `
                <div class="market-insights">
                    <h4>🧠 AI Market Analysis</h4>
                    ${insights.insights.map(insight => `
                        <div class="ai-insight-item">
                            <span>${insight.icon}</span>
                            <span>${insight.text}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
    }

    formatPrice(price) {
        if (!price) return 'N/A';
        return parseInt(price).toLocaleString();
    }
}

// Global AI UI functions
function performAISearch() {
    const query = document.getElementById('ai-search-input').value.trim();
    if (!query) {
        alert('Please enter a search query');
        return;
    }

    if (!window.propertyAI) {
        alert('AI system not initialized');
        return;
    }

    // Show loading state
    const button = document.querySelector('.ai-search-button');
    const originalText = button.textContent;
    button.textContent = '🔄 Searching...';
    button.disabled = true;

    // Perform AI search
    window.propertyAI.performAISearch(query)
        .then(results => {
            if (results && results.properties) {
                // Display regular listings
                allListings = results.properties;
                displayListings(allListings);
                
                // Display AI-enhanced results
                if (window.aiUI) {
                    window.aiUI.displayAIResults(results);
                }
                
                // Track the search
                if (window.propertyAI.features.recommendations) {
                    results.properties.forEach(property => {
                        window.propertyAI.features.recommendations.trackInteraction(property, 'view');
                    });
                }
            } else {
                alert('No properties found for your search');
            }
        })
        .catch(error => {
            console.error('AI search error:', error);
            alert('Search failed. Please try again.');
        })
        .finally(() => {
            // Reset button
            button.textContent = originalText;
            button.disabled = false;
        });
}

function fillAISearch(suggestion) {
    const input = document.getElementById('ai-search-input');
    if (input) {
        input.value = suggestion;
        input.focus();
    }
}

function updateAIControlPanel() {
    if (window.aiUI) {
        window.aiUI.updateUIFromConfig();
        window.aiUI.loadUsageStats();
    }
}

// Initialize AI UI when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.aiUI = new AIUIController();
    
    // Add some initial CSS for market insights
    const additionalStyles = document.createElement('style');
    additionalStyles.textContent = `
        .market-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .stat-item {
            background: rgba(255, 255, 255, 0.2);
            padding: 15px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .stat-icon {
            font-size: 1.5em;
        }
        
        .market-insights h4 {
            margin-bottom: 15px;
            color: white;
        }
        
        @media (max-width: 768px) {
            .market-stats {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(additionalStyles);
});