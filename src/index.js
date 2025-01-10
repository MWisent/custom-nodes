const cron = require('node-cron');
const KAGWorkflow = require('./workflows/KAGWorkflow');

// Uruchom workflow co godzinę
cron.schedule('0 * * * *', async () => {
    console.log('Uruchamianie workflow KAG:', new Date());
    
    try {
        const workflow = new KAGWorkflow();
        await workflow.execute();
    } catch (error) {
        console.error('Błąd podczas wykonywania workflow:', error);
    }
}); 