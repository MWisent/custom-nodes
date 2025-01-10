const { Workflow } = require('n8n-core');
const CustomGetPriceData = require('../../CustomGetPriceData');
const CustomGetNewsData = require('../../CustomGetNewsData');
const CustomKAGSystem = require('../CustomKAGSystem');
const CustomSignalGenerator = require('../../CustomSignalGenerator');
const CustomRiskManager = require('../../CustomRiskManager');
const CustomTradeHandler = require('../../CustomTradeHandler');
const CustomNotifications = require('../../CustomNotifications');

class KAGWorkflow extends Workflow {
    constructor() {
        super();
        // Definicja nodes dla n8n
        this.nodes = {
            'Schedule Trigger': {
                type: 'n8n-nodes-base.cron',
                parameters: {
                    triggerTimes: {
                        item: [{
                            mode: 'everyHour',
                            minute: 0
                        }]
                    }
                }
            },
            'Price Data': {
                type: 'custom.getPriceData',
                parameters: {
                    symbol: 'BTCUSDT',
                    interval: '1h'
                }
            },
            'News Data': {
                type: 'custom.getNewsData',
                parameters: {
                    sources: ['crypto', 'financial', 'social']
                }
            },
            'KAG Analysis': {
                type: 'custom.kagSystem'
            },
            'Signal Generator': {
                type: 'custom.signalGenerator'
            },
            'Risk Manager': {
                type: 'custom.riskManager'
            },
            'Trade Handler': {
                type: 'custom.tradeHandler'
            },
            'Notifications': {
                type: 'custom.notifications'
            }
        };

        // Definicja połączeń między nodes
        this.connections = {
            'Schedule Trigger': {
                main: [
                    [
                        {
                            node: 'Price Data',
                            type: 'main',
                            index: 0
                        },
                        {
                            node: 'News Data',
                            type: 'main',
                            index: 0
                        }
                    ]
                ]
            },
            'Price Data': {
                main: [
                    [
                        {
                            node: 'KAG Analysis',
                            type: 'main',
                            index: 0
                        }
                    ]
                ]
            },
            'News Data': {
                main: [
                    [
                        {
                            node: 'KAG Analysis',
                            type: 'main',
                            index: 1
                        }
                    ]
                ]
            },
            // ... pozostałe połączenia
        };
    }

    async execute() {
        try {
            // 1. Pobierz dane cenowe
            const priceData = await this.priceData.execute({
                symbol: 'BTCUSDT',
                interval: '1h'
            });

            // 2. Pobierz newsy
            const newsData = await this.newsData.execute({
                sources: ['crypto', 'financial', 'social']
            });

            // 3. Analiza KAG
            const kagAnalysis = await this.kagSystem.execute({
                priceData,
                newsData
            });

            // 4. Generowanie sygnałów
            const signals = await this.signalGenerator.execute({
                kagAnalysis,
                priceData
            });

            // 5. Zarządzanie ryzykiem
            const riskAssessment = await this.riskManager.execute({
                signals,
                currentPrice: priceData.lastPrice
            });

            // 6. Jeśli ryzyko akceptowalne, wykonaj transakcję
            if (riskAssessment.riskApproved) {
                const trade = await this.tradeHandler.execute({
                    signal: signals.direction,
                    quantity: riskAssessment.suggestedQuantity
                });

                // 7. Wyślij powiadomienie o transakcji
                await this.notifications.sendNotification({
                    type: 'TRADE_EXECUTED',
                    data: {
                        signal: signals.direction,
                        price: trade.price,
                        quantity: trade.quantity,
                        timestamp: new Date()
                    }
                });
            }

            return { success: true };

        } catch (error) {
            console.error('Błąd w workflow KAG:', error);
            
            // Powiadomienie o błędzie
            await this.notifications.sendNotification({
                type: 'ERROR',
                data: {
                    message: error.message,
                    timestamp: new Date()
                }
            });

            throw error;
        }
    }
}

module.exports = KAGWorkflow; 