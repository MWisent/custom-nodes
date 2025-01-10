const CustomNotifications = require('./CustomNotifications');
const { Node } = require('n8n-core');
const axios = require('axios');

jest.mock('axios');

describe('CustomNotifications', () => {
    let node;

    beforeEach(() => {
        node = new CustomNotifications();
    });

    test('should send notification successfully', async () => {
        const mockResponse = { data: { status: 'success' } };
        axios.post.mockResolvedValue(mockResponse);

        const result = await node.execute({
            telegramApiUrl: 'https://api.telegram.org',
            chatId: '12345',
            message: 'Test message'
        });

        expect(axios.post).toHaveBeenCalledWith(
            'https://api.telegram.org/sendMessage',
            {
                chat_id: '12345',
                text: 'Test message'
            }
        );
        expect(result).toEqual(mockResponse.data);
    });

    test('should throw error when notification sending fails', async () => {
        const mockError = new Error('Notification sending failed');
        axios.post.mockRejectedValue(mockError);

        await expect(node.execute({
            telegramApiUrl: 'https://api.telegram.org',
            chatId: '12345',
            message: 'Test message'
        })).rejects.toThrow('Failed to send notification: Notification sending failed');
    });
});
