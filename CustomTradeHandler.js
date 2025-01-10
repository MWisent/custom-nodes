const { Node } = require('n8n-core');
const { Client } = require('coinbase').Client;

class CustomTradeHandler extends Node {
    constructor() {
        super();
        this.client = new Client({
            apiKey: process.env.BROKER_API_KEY,
            apiSecret: process.env.BROKER_API_SECRET
        });
    }

    async execute() {
        const signal = this.getInputData('signal');
        const quantity = this.getInputData('quantity');

        try {
            // Pobierz konto
            const accounts = await new Promise((resolve, reject) => {
                this.client.getAccounts({}, (err, accounts) => {
                    if (err) reject(err);
                    resolve(accounts);
                });
            });

            const btcAccount = accounts.find(acc => acc.currency === 'BTC');
            
            let order;
            if (signal === 'BUY') {
                order = await new Promise((resolve, reject) => {
                    this.client.buy({
                        accountId: btcAccount.id,
                        amount: quantity,
                        currency: 'BTC'
                    }, (err, buy) => {
                        if (err) reject(err);
                        resolve(buy);
                    });
                });
            } else if (signal === 'SELL') {
                order = await new Promise((resolve, reject) => {
                    this.client.sell({
                        accountId: btcAccount.id,
                        amount: quantity,
                        currency: 'BTC'
                    }, (err, sell) => {
                        if (err) reject(err);
                        resolve(sell);
                    });
                });
            }

            return this.prepareOutputData({
                orderId: order.id,
                status: order.status,
                side: signal.toLowerCase(),
                size: order.amount.amount,
                price: order.total.amount,
                timestamp: new Date(order.created_at)
            });
        } catch (error) {
            console.error('Błąd podczas wykonywania transakcji:', error);
            throw new Error(`Nie udało się wykonać transakcji: ${error.message}`);
        }
    }
}

module.exports = CustomTradeHandler;
