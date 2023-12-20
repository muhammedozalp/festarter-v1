# simple-nunjucks-loader
url: https://ogonkov.github.io/nunjucks-loader/examples/html-webpack-plugin/

## manually generating html files with html-webpack-plugin and simple-nunjucks-loader
```javascript
// webpack.config.js
const HTMLWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    module: {
        rules: [
            {
                test: /\.njk$/,
                use: [
                    {
                        loader: 'simple-nunjucks-loader',
                        options: {}
                    }
                ]
            }
        ]
    },
    
    plugins: [
        new HTMLWebpackPlugin({
            template: 'template.njk',
            templateParameters: {
                username: 'Joe'
            }
        })
    ]
};
```
## dynamically generating html files with html-webpack-plugin and simple-nunjucks-loader

```javascript
// webpack.config.js
const glob = require('glob');
const HTMLWebpackPlugin = require('html-webpack-plugin');

function getTemplates() {
  return new Promise(function(resolve, reject) {
    glob('**/!(_*).njk', function(error, files) {
      if (error) {
        return reject(error);
      }

      resolve(files);
    });
  });
}

function toPlugin(fileName) {
  return new HTMLWebpackPlugin({
    template: fileName,
    filename: fileName.replace(/\.njk$/, '.html')
  });
}

module.exports = function() {
  const templates = getTemplates().then((files) => files.map(toPlugin));

  return templates.then(function(templates) {
    return {
      // ... all other config with loaders and etc
      plugins: [
        ...templates
      ]
    }
  });
};
```
