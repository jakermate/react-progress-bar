const path = require('path')
module.exports = {
    "mode": "development",
    "entry": "./src/loaders/ProgressBar.js",
    "output": {
        "path": path.resolve(__dirname, 'build'),
        "filename": 'index.js',
        "libraryTarget": 'commonjs2'
      },
    "module": {
        "rules": [
            {
                "test": /\.(js|jsx)$/,
                "exclude": /node_modules/,
                "use": {
                    "loader": "babel-loader",
                    "options": {
                        
                    }
                }
            }
        ]
    }
}