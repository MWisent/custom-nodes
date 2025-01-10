const { Node } = require('n8n-core');
const axios = require('axios');

class CustomTradeHandler extends Node {
    async execute() {
        const apiUrl = this.getInputData('apiUrl');
        const apiKey = this.getInputData('apiKey');
        const signal = this.getInputData('signal');
        const quantity = this.getInputData('quantity');

        try {
            const response = await axios.post(`${apiUrl}/order`, {
                apiKey,
                signal,
                quantity
            });
            return this.prepareOutputData(response.data);
        } catch (error) {
            throw new Error(`Failed to execute trade: ${error.message}`);
        }
    }
}

module.exports = CustomTradeHandler;
