
const ZCH = require('zarinpal-checkout')

module.exports = (config) => {

    const api = ZCH.create(config.merchant_id, false);

    async function createPaymentURL(backURL, amount, detail) {

        try {
            let result = await api.PaymentRequest({
                Amount: amount,
                CallbackURL: backURL,
                Description: detail.description,
                Email: detail.email,
                Mobile: detail.mobile,
            });

            if (result.status !== 100) {
                return false;
            }

            return {
                url: result.url + '/ZarinGate',
                secret: {
                    authority: result.authority,
                    amount,
                },
            };
        }
        catch (error) {
            console.log('zarinpal_com ERROR:', error);
            return false;
        }
    }

    async function validatePayment(secret, query, body) {

        if (!secret
            || query.Authority !== secret.authority
            || query.Status !== 'OK'
        ) {
            return false;
        }

        try {
            let result = await api.PaymentVerification({
                Amount: secret.amount,
                Authority: secret.authority,
            });

            if (result.status === -21) {
                return false;
            }
            if (result.status < 100) {
                return false;
            }

            secret.refID = result.RefID;

            return secret;
        }
        catch (e) {
            return false;
        }
    }

    return {
        createPaymentURL,
        validatePayment,
    };
};
