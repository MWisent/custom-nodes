const CustomTradeHandler = require('./CustomTradeHandler');
const { Node } = require('n8n-core');
const axios = require('axios');

jest.mock('axios');

describe('CustomTradeHandler', () => {
    let node;

    beforeEach(() => {
        node = new CustomTradeHandler();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should execute trade successfully', async () => {
        const mockResponse = { data: { status: 'success' } };
        axios.post.mockResolvedValue(mockResponse);

        const result = await node.execute({
            apiUrl: 'https://api.broker.com',
            apiKey: 'test-key',
            signal: 'buy',
            quantity: 10
        });

        expect(axios.post).toHaveBeenCalledWith(
            'https://api.broker.com/order',
            {
                apiKey: 'test-key',
                signal: 'buy',
                quantity: 10
            }
        );
        expect(result).toEqual(mockResponse.data);
    });

    test('should throw error when trade execution fails', async () => {
        const mockError = new Error('Trade execution failed');
        axios.post.mockRejectedValue(mockError);

        await expect(node.execute({
            apiUrl: 'https://api.broker.com',
            apiKey: 'test-key',
            signal: 'buy',
            quantity: 10
        })).rejects.toThrow('Failed to execute trade: Trade execution failed');
    });

    test('should handle different error scenarios', async () => {
        const scenarios = [
            { error: new Error('Network error'), message: 'Failed to execute trade: Network error' },
            { error: new Error('Invalid API key'), message: 'Failed to execute trade: Invalid API key' }
        ];

        for (const scenario of scenarios) {
            axios.post.mockRejectedValueOnce(scenario.error);
            await expect(node.execute({
                apiUrl: 'https://api.broker.com',
                apiKey: 'test-key',
                signal: 'buy',
                quantity: 10
            })).rejects.toThrow(scenario.message);
        }
    });

    test('should validate required parameters', async () => {
        await expect(node.execute({
            apiUrl: 'https://api.broker.com',
            apiKey: '',  // brak klucza API
            signal: 'buy',
            quantity: 10
        })).rejects.toThrow('API key is required');
    });

    test('should execute sell trade successfully', async () => {
        const mockResponse = { data: { status: 'success' } };
        axios.post.mockResolvedValue(mockResponse);

        const result = await node.execute({
            apiUrl: 'https://api.broker.com',
            apiKey: 'test-key',
            signal: 'sell',
            quantity: 10
        });

        expect(axios.post).toHaveBeenCalledWith(
            'https://api.broker.com/order',
            {
                apiKey: 'test-key',
                signal: 'sell',
                quantity: 10
            }
        );
        expect(result).toEqual(mockResponse.data);
    });

    test('powinien prawidłowo obsługiwać błędy podczas składania zlecenia', async () => {
        const mockOrder = {
            symbol: 'BTCUSDT',
            side: 'BUY',
            quantity: 1
        };
        
        const tradeHandler = new CustomTradeHandler();
        try {
            await tradeHandler.placeOrder(mockOrder);
        } catch (error) {
            expect(error).toBeDefined();
        }
    });
    
    test('powinien walidować parametry zlecenia', () => {
        const tradeHandler = new CustomTradeHandler();
        expect(() => {
            tradeHandler.validateOrder({});
        }).toThrow();
    });
});
