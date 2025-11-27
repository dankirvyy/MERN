const axios = require('axios');

class PayMongoService {
    constructor() {
        this.secretKey = process.env.PAYMONGO_SECRET_KEY;
        this.publicKey = process.env.PAYMONGO_PUBLIC_KEY;
        this.apiBase = 'https://api.paymongo.com/v1';

        if (!this.secretKey || !this.publicKey) {
            throw new Error('PayMongo API keys are not configured');
        }
    }

    /**
     * Make a request to PayMongo API
     */
    async request(method, endpoint, data = null) {
        const url = `${this.apiBase}${endpoint}`;
        const auth = Buffer.from(`${this.secretKey}:`).toString('base64');

        const config = {
            method,
            url,
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        if (data) {
            config.data = {
                data: {
                    attributes: data
                }
            };
        }

        try {
            console.log(`PayMongo Request - ${method} ${url}`);
            const response = await axios(config);
            console.log('PayMongo Response:', response.status);
            return response.data.data;
        } catch (error) {
            console.error('PayMongo Error:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.errors?.[0]?.detail || 'PayMongo API error';
            throw new Error(errorMessage);
        }
    }

    /**
     * Create a GCash payment source
     */
    async createSource(data) {
        console.log('Creating PayMongo source:', data);
        
        const sourceData = {
            type: data.type,
            amount: data.amount,
            currency: data.currency,
            redirect: data.redirect,
            billing: data.billing
        };

        return await this.request('POST', '/sources', sourceData);
    }

    /**
     * Retrieve a payment source by ID
     */
    async retrieveSource(sourceId) {
        console.log('Retrieving PayMongo source:', sourceId);
        return await this.request('GET', `/sources/${sourceId}`);
    }

    /**
     * Create a payment from a chargeable source
     */
    async createPayment(data) {
        console.log('Creating PayMongo payment:', data);
        
        const paymentData = {
            amount: data.amount,
            currency: data.currency,
            description: data.description,
            source: {
                id: data.source.id,
                type: data.source.type
            }
        };

        return await this.request('POST', '/payments', paymentData);
    }
}

module.exports = PayMongoService;
