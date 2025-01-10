const { Node } = require('n8n-core');
// eslint-disable-next-line no-unused-vars
const axios = require('axios');

class CustomKAGSystem extends Node {
    constructor() {
        super();
        this.graph = new Map();
        this.DEFAULT_DEPTH = 10;
        this.DEFAULT_CONFIDENCE_THRESHOLD = 0.8;
        this.TIME_WINDOW = 3600000; // 1 godzina w milisekundach
        this.cache = new Map(); // Cache dla wyników
    }

    validateInput(priceData, newsData) {
        if (!Array.isArray(priceData) || !Array.isArray(newsData)) {
            throw new Error('PriceData i newsData muszą być tablicami');
        }
        
        if (priceData.some(p => !p.close || !p.timestamp)) {
            throw new Error('Nieprawidłowy format danych cenowych');
        }
        
        if (newsData.some(n => !n.content || !n.timestamp || typeof n.sentiment !== 'number')) {
            throw new Error('Nieprawidłowy format danych newsowych');
        }
    }

    async execute({ priceData = [], newsData = [] }) {
        try {
            this.validateInput(priceData, newsData);

            // Sprawdź cache
            const cacheKey = this.generateCacheKey(priceData, newsData);
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            // 1. Budowanie grafu wiedzy
            await this.buildKnowledgeGraph(priceData, newsData);

            // 2. Analiza wzorców
            const patterns = await this.analyzePatterns();

            // 3. Ocena wpływu newsów
            const newsImpact = await this.analyzeNewsImpact(newsData);

            // 4. Łączenie analizy technicznej i fundamentalnej
            const combinedAnalysis = await this.combineAnalysis(patterns, newsImpact);

            return {
                sentiment: combinedAnalysis.sentiment,
                confidence: combinedAnalysis.confidence,
                suggestedAction: combinedAnalysis.action,
                supportingFactors: combinedAnalysis.factors
            };

        } catch (error) {
            console.error('Błąd w analizie KAG:', error);
            throw new Error(`Błąd analizy KAG: ${error.message}`);
        }
    }

    async buildKnowledgeGraph(priceData, newsData) {
        const depth = process.env.KAG_ANALYSIS_DEPTH || this.DEFAULT_DEPTH;
        
        // Użyj Map dla szybszego dostępu
        const newsMap = new Map();
        newsData.forEach(news => {
            const timeKey = new Date(news.timestamp).getTime();
            if (!newsMap.has(timeKey)) {
                newsMap.set(timeKey, []);
            }
            newsMap.get(timeKey).push(news);
        });

        // Zoptymalizowane dodawanie danych cenowych
        const relevantPrices = priceData.slice(-depth);
        relevantPrices.forEach((price, index) => {
            const priceTime = new Date(price.timestamp).getTime();
            const connections = [];
            
            // Szukaj newsów w oknie czasowym
            for (let t = priceTime - this.TIME_WINDOW; t <= priceTime + this.TIME_WINDOW; t += 3600000) {
                if (newsMap.has(t)) {
                    connections.push(...newsMap.get(t).map(news => ({
                        type: 'news',
                        content: news.content,
                        sentiment: news.sentiment
                    })));
                }
            }

            this.graph.set(`price_${index}`, {
                value: price.close,
                timestamp: price.timestamp,
                connections
            });
        });
    }

    async analyzePatterns() {
        const patterns = [];
        const prices = Array.from(this.graph.values())
            .filter(node => node.value)
            .map(node => node.value);

        // Analiza trendów
        const trend = this.calculateTrend(prices);
        patterns.push({
            type: 'trend',
            value: trend,
            significance: this.calculateSignificance(trend)
        });

        return {
            patterns,
            significance: this.aggregateSignificance(patterns)
        };
    }

    async analyzeNewsImpact(newsData) {
        const confidenceThreshold = process.env.KAG_CONFIDENCE_THRESHOLD || 0.8;
        let totalImpact = 0;
        let totalConfidence = 0;

        newsData.forEach(news => {
            if (news.confidence >= confidenceThreshold) {
                totalImpact += news.sentiment;
                totalConfidence += news.confidence;
            }
        });

        return {
            impact: totalImpact / newsData.length || 0,
            confidence: totalConfidence / newsData.length || 0
        };
    }

    async combineAnalysis(patterns, newsImpact) {
        const technicalWeight = 0.6;
        const fundamentalWeight = 0.4;

        const technicalScore = patterns.significance;
        const fundamentalScore = newsImpact.impact;

        const combinedScore = (technicalScore * technicalWeight) + 
                            (fundamentalScore * fundamentalWeight);

        return {
            sentiment: this.scoreToSentiment(combinedScore),
            confidence: (patterns.significance + newsImpact.confidence) / 2,
            action: this.determineAction(combinedScore),
            factors: this.collectSupportingFactors(patterns, newsImpact)
        };
    }

    // Funkcje pomocnicze
    calculateTrend(prices) {
        // Implementacja obliczania trendu
        return prices[prices.length - 1] - prices[0];
    }

    calculateSignificance(value) {
        return Math.min(Math.abs(value) / 100, 1);
    }

    aggregateSignificance(patterns) {
        return patterns.reduce((acc, p) => acc + p.significance, 0) / patterns.length;
    }

    scoreToSentiment(score) {
        if (score > 0.3) return 'positive';
        if (score < -0.3) return 'negative';
        return 'neutral';
    }

    determineAction(score) {
        if (score > 0.5) return 'BUY';
        if (score < -0.5) return 'SELL';
        return 'HOLD';
    }

    collectSupportingFactors(patterns, newsImpact) {
        return {
            technical: patterns.patterns,
            fundamental: {
                newsImpact: newsImpact.impact,
                confidence: newsImpact.confidence
            }
        };
    }

    clearCache() {
        this.cache.clear();
    }

    cleanOldCache(maxAge = 3600000) { // domyślnie 1 godzina
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > maxAge) {
                this.cache.delete(key);
            }
        }
    }
}

module.exports = CustomKAGSystem; 