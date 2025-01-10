const { Node } = require('n8n-core');
const axios = require('axios');

class CustomSentimentAnalysis extends Node {
    async execute() {
        const apiUrl = this.getInputData('apiUrl');
        const apiKey = this.getInputData('apiKey');
        const news = this.getInputData('news');

        try {
            const response = await axios.post(`${apiUrl}/analyze`, { news, apiKey });
            const sentimentData = response.data.map(item => ({
                ...item,
                sentiment: item.sentiment
            }));
            return this.prepareOutputData(sentimentData);
        } catch (error) {
            throw new Error(`Failed to analyze sentiment: ${error.message}`);
        }
    }
}

module.exports = CustomSentimentAnalysis;
