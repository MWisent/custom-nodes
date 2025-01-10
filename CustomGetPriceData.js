const { Node } = require('n8n-core');
const axios = require('axios');

class CustomGetPriceData extends Node {
    constructor() {
        this.priceCache = new Map();
        this.CACHE_EXPIRY = 5000; // 5 sekund
    }

    async getPrice(symbol) {
        const cachedData = this.priceCache.get(symbol);
        if (cachedData && Date.now() - cachedData.timestamp < this.CACHE_EXPIRY) {
            return cachedData.price;
        }
        
        const apiUrl = this.getInputData('apiUrl');
        const interval = this.getInputData('interval');

        try {
            const response = await axios.get(`${apiUrl}/api/v3/klines?symbol=${symbol}&interval=${interval}`);
            const data = response.data.map(item => ({
                open: item[1],
                high: item[2],
                low: item[3],
                close: item[4],
                volume: item[5]
            }));
            const price = data[data.length - 1].close;
            this.priceCache.set(symbol, {
                price: price,
                timestamp: Date.now()
            });
            return price;
        } catch (error) {
            throw new Error(`Failed to fetch price data: ${error.message}`);
        }
    }

    async execute() {
        const symbol = this.getInputData('symbol');
        return this.getPrice(symbol);
    }
}

module.exports = CustomGetPriceData;
