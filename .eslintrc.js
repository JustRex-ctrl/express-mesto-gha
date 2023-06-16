module.exports = {
    "env": {
        "node": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended"
    ],
    "parserOptions": {
        "ecmaVersion": "latest"
    },
    "plugins": [
    ],
    "rules": {
      "no-underscore-dangle": ["error", {"allow": ["_id"]}]
    }
}
