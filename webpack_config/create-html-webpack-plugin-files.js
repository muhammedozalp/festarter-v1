const { htmlWebpackPluginFiles } = require('./html-webpack-plugin-create-pages-dynamically.js');
const { pageMain } = require('./html-webpack-plugin-create-pages-manually.js');
const { filesAndTemplates } = require('./html-webpack-plugin-create-pages-fully-manual.js');

const pageCreationApproach = {
    DYNAMIC: 'dynamic',
    MANUAL: 'manual',
    FULLY_MANUAL: 'fully-manual'
};

let pluginFilesAndTemplates = [];
const fileCreationApproach = pageCreationApproach.DYNAMIC;

if (fileCreationApproach === pageCreationApproach.DYNAMIC) {
    pluginFilesAndTemplates = htmlWebpackPluginFiles;
} else if (fileCreationApproach === pageCreationApproach.MANUAL) {
    pluginFilesAndTemplates = pageMain;
} else if (fileCreationApproach === pageCreationApproach.FULLY_MANUAL) {
    pluginFilesAndTemplates = filesAndTemplates;
}

module.exports = pluginFilesAndTemplates;
