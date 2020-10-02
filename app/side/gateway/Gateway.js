
const idpay_ir     = require('./ways/idpay_ir')
const zarinpal_com = require('./ways/zarinpal_com')

module.exports = function Gateway(config) {

    const ways = {
        'idpay_ir':     idpay_ir(config['idpay_ir']),
        'zarinpal_com': zarinpal_com(config['zarinpal_com']),
    }

    function createPaymentURL(way_name, amount, backURL, detail = {}) {
        const way = ways[way_name]
        return way.createPaymentURL(backURL, amount, detail)
    }

    function validatePayment(way_name, secret, query, body) {
        const way = ways[way_name]
        return way.validatePayment(secret, query, body)
    }

    return {
        createPaymentURL,
        validatePayment,
    }
}
