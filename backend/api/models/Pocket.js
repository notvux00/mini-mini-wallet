module.exports = {
    attributes: {
        balance: {
            type: 'number',
            defaultsTo: 0
        },

        customer: {
            model: 'customer',
            required: true
        }
    }
};