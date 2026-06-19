module.exports = {
    attributes: {
        amount: {
            type: 'number',
            required: true // Số tiền giao dịch
        },
        description: {
            type: 'string' // Ghi chú giao dịch
        },

        // Trỏ tới ID của Ví bị trừ tiền
        senderPocket: {
            model: 'pocket',
            required: true
        },

        // Trỏ tới ID của Ví được cộng tiền
        receiverPocket: {
            model: 'pocket',
            required: true
        }
    }
};