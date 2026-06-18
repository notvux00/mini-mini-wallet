module.exports = {
    attributes: {
        phone: {
            type: 'string',
            required: true,
            unique: true // Số điện thoại là duy nhất
        },
        password: {
            type: 'string',
            required: true
        },
        fullName: {
            type: 'string',
            required: true
        }
    }
};