const fs = require('fs');
const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config();

const env = {
    entry: process.env.ENTRY,
    dirSource: process.env.DIR_SOURCE,
    dirTemplate: process.env.DIR_TEMPLATE,
    dirViews: process.env.DIR_VIEWS,
    dirLangTr: process.env.DIR_LANGUAGE_TR
};

const viewsDir = path.join(__dirname, '..', env.dirSource, env.dirTemplate, env.dirViews);
const htmlWebpackPluginFiles = [];

const getAllTemplateFileNamesWithRootPath = (viewsRoot, fileNamesWithRootPath = []) => {
    const files = fs.readdirSync(viewsRoot);

    files.forEach((file) => {
        const filePath = path.join(viewsRoot, file);
        if (fs.statSync(filePath).isDirectory()) {
            // eslint-disable-next-line no-param-reassign, max-len
            fileNamesWithRootPath = getAllTemplateFileNamesWithRootPath(filePath, fileNamesWithRootPath);
        } else {
            fileNamesWithRootPath.push(filePath);
        }
    });

    return fileNamesWithRootPath;
};

const pluginTemplateFiles = getAllTemplateFileNamesWithRootPath(viewsDir);

const setPublicFileNamesWithRootPath = (files) => {
    files.forEach((file, i) => {
        const fileNameNoExtension = path.parse(file).name;

        // const updateFile = file.replace('njk', 'html')
        //     .replace(`${viewsDir}`, '')
        //     .replace(/\\/g, '/')
        //     .replace('/tr/', '');

        htmlWebpackPluginFiles[i] = {
            template: file,
            // filename: updateFile
            filename: fileNameNoExtension !== 'index' ? `${fileNameNoExtension}${path.sep}index.html` : 'index.html'
        };
    });
};

setPublicFileNamesWithRootPath(pluginTemplateFiles);

module.exports = {
    htmlWebpackPluginFiles
};
