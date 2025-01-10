const { Node } = require('n8n-core');

class CustomSignalGenerator extends Node {
    async execute() {
        const indicators = this.getInputData('indicators');
        const sentiment = this.getInputData('sentiment');

        let signal = 'neutral';
        let reason = '';

        if (indicators.rsi > 70 && sentiment === 'negative') {
            signal = 'sell';
            reason = 'RSI above 70 and negative sentiment';
        } else if (indicators.rsi < 30 && sentiment === 'positive') {
            signal = 'buy';
            reason = 'RSI below 30 and positive sentiment';
        }

        return this.prepareOutputData({ signal, reason });
    }
}

module.exports = CustomSignalGenerator;
