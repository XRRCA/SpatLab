module.exports = {
    'env': {
        'node': true,
        'es6': true,
        'browser': false,
        'mocha': true
    },
    'rules': {
        'no-unused-vars': [
            'error',
            {
                'varsIgnorePattern': '[gG]lobal'
            }
        ]
    }
};
