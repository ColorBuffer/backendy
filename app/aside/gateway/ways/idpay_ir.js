
const request = require('request')

const URL = 'https://api.idpay.ir/v1.1'

module.exports = (config) => {

    async function createPaymentURL(backURL, amount, detail) {

        return new Promise((resolve, reject) => {

            const order_id = Math.floor(Math.random() * 1000000) + '';
            const options = {
                method: 'POST',
                json: true,
                url: URL + '/payment',
                headers: {
                  'Content-Type': 'application/json',
                  'X-API-KEY': config.api_key,
                  'X-SANDBOX': config.dev ? 1 : 0,
                },
                body: {
                  'order_id': order_id,
                  'amount': amount * 10,
                  'name': detail.name,
                  'phone': detail.mobile,
                  'mail': detail.email,
                  'desc': detail.description,
                  'callback': backURL,
                  'reseller': null,
                },
            }

            request(options, function (error, response, body) {
                if (error) return reject(error);
                console.log('body', body)
                resolve({
                    url: body.link,
                    secret: {
                        id: body.id,
                        order_id: order_id,
                    },
                })
            })
        })
    }

    async function validatePayment(secret, query, body) {

        // console.log('secret', secret)
        if (!secret || !body || !body.status || body.status !== '10') {
            return false;
        }
        return new Promise((resolve, reject) => {

            const options = {
                method: 'POST',
                json: true,
                url: URL + '/payment/verify',
                headers: {
                  'Content-Type': 'application/json',
                  'X-API-KEY': config.api_key,
                  'X-SANDBOX': config.dev ? 1 : 0,
                },
                body: {
                    'id': secret.id,
                    'order_id': secret.order_id,
                },
            }

            request(options, function (error, response, body) {
                if (error) return reject(error);
                // console.log('body', body);
                if (body.status != '100') {
                    return resolve(false)
                }
                resolve(body)
            })
        })
    }

    return {
        createPaymentURL,
        validatePayment,
    };
};
