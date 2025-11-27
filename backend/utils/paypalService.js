const axios = require('axios');

class PayPalService {
    constructor() {
        this.clientId = process.env.PAYPAL_CLIENT_ID;
        this.secret = process.env.PAYPAL_SECRET;
        this.mode = process.env.PAYPAL_MODE || 'sandbox';
        this.apiBase = this.mode === 'live' 
            ? 'https://api.paypal.com' 
            : 'https://api.sandbox.paypal.com';

        if (!this.clientId || !this.secret) {
            throw new Error('PayPal API credentials are not configured');
        }
    }

    /**
     * Get PayPal OAuth2 access token
     */
    async getAccessToken() {
        const auth = Buffer.from(`${this.clientId}:${this.secret}`).toString('base64');
        
        try {
            const response = await axios({
                method: 'POST',
                url: `${this.apiBase}/v1/oauth2/token`,
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: 'grant_type=client_credentials'
            });

            return response.data.access_token;
        } catch (error) {
            console.error('PayPal Token Error:', error.response?.data || error.message);
            throw new Error('Failed to get PayPal access token');
        }
    }

    /**
     * Get PayPal order details
     */
    async getOrder(orderId) {
        const accessToken = await this.getAccessToken();

        try {
            const response = await axios({
                method: 'GET',
                url: `${this.apiBase}/v2/checkout/orders/${orderId}`,
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('PayPal Get Order Error:', error.response?.data || error.message);
            throw new Error('Failed to retrieve PayPal order');
        }
    }

    /**
     * Verify PayPal order completion and amount
     */
    async verifyOrder(orderId, expectedAmount) {
        const order = await this.getOrder(orderId);

        // Check if order is completed
        if (order.status !== 'COMPLETED') {
            throw new Error(`PayPal order not completed. Status: ${order.status}`);
        }

        // Verify amount
        const purchaseUnit = order.purchase_units[0];
        if (!purchaseUnit || !purchaseUnit.amount) {
            throw new Error('Invalid PayPal order amount data');
        }

        const orderAmount = parseFloat(purchaseUnit.amount.value);
        const orderCurrency = purchaseUnit.amount.currency_code;

        // Convert PHP to USD (approximate rate: 1 USD = 55 PHP)
        const expectedUsd = parseFloat((expectedAmount / 55).toFixed(2));

        if (orderCurrency !== 'USD') {
            throw new Error(`Invalid currency. Expected USD, got ${orderCurrency}`);
        }

        if (Math.abs(orderAmount - expectedUsd) > 0.01) {
            throw new Error(`Amount mismatch. Expected ${expectedUsd} USD, got ${orderAmount} USD`);
        }

        return {
            verified: true,
            orderId: order.id,
            amount: orderAmount,
            currency: orderCurrency,
            payerId: order.payer?.payer_id
        };
    }
}

module.exports = PayPalService;
