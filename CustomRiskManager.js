const { Node } = require('n8n-core');

class CustomRiskManager extends Node {
    async execute() {
        const signal = this.getInputData('signal');
        const currentPrice = this.getInputData('currentPrice');
        const stopLoss = this.getInputData('stopLoss');
        const takeProfit = this.getInputData('takeProfit');

        let riskApproved = false;

        if (signal === 'buy' && currentPrice > stopLoss && currentPrice < takeProfit) {
            riskApproved = true;
        } else if (signal === 'sell' && currentPrice < stopLoss && currentPrice > takeProfit) {
            riskApproved = true;
        }

        return this.prepareOutputData({ riskApproved });
    }

    validatePosition(position) {
        if (!position || typeof position !== 'object') {
            throw new Error('Nieprawidłowy format pozycji');
        }
        
        if (!position.size || position.size <= 0) {
            throw new Error('Nieprawidłowy rozmiar pozycji');
        }
        
        if (!position.entryPrice || position.entryPrice <= 0) {
            throw new Error('Nieprawidłowa cena wejścia');
        }
    }
}

module.exports = CustomRiskManager;
