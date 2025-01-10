const { Node } = require('n8n-core');
const axios = require('axios');

class CustomNotifications extends Node {
    async execute() {
        const telegramApiUrl = this.getInputData('telegramApiUrl');
        const chatId = this.getInputData('chatId');
        const message = this.getInputData('message');

        try {
            const response = await axios.post(`${telegramApiUrl}/sendMessage`, {
                chat_id: chatId,
                text: message
            });
            return this.prepareOutputData(response.data);
        } catch (error) {
            console.error('Błąd podczas wysyłania powiadomienia:', error);
            throw new Error('Nie udało się wysłać powiadomienia: ' + error.message);
        }
    }

    async sendNotification(message) {
        try {
            const response = await axios.post(`${this.getInputData('telegramApiUrl')}/sendMessage`, {
                chat_id: this.getInputData('chatId'),
                text: message
            });
            return this.prepareOutputData(response.data);
        } catch (error) {
            console.error('Błąd podczas wysyłania powiadomienia:', error);
            throw new Error('Nie udało się wysłać powiadomienia: ' + error.message);
        }
    }
}

module.exports = CustomNotifications;
