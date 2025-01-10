const { Node } = require('n8n-core');
const { RSI, MACD } = require('technicalindicators');

class CustomTechnicalIndicators extends Node {
    async execute() {
        const prices = this.getInputData('prices');
        const rsiPeriod = this.getInputData('rsiPeriod');
        const macdConfig = this.getInputData('macdConfig');

        const rsi = RSI.calculate({ values: prices, period: rsiPeriod });
        const macd = MACD.calculate({ values: prices, ...macdConfig });

        return this.prepareOutputData({ rsi, macd });
    }
}

module.exports = CustomTechnicalIndicators;
