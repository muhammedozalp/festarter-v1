const langBasePath = './src/template/site/';
const langs = ['en', 'tr'];
const extensions = ['.njk', '.html'];

const pages = [
    {
        template: 'index',
        filename: {
            en: '',
            tr: 'index'
        }
    },
    {
        template: 'product-1',
        filename: {
            en: '',
            tr: 'product-1'
        }
    },
    {
        template: 'product-2',
        filename: {
            en: '',
            tr: 'product-2'
        }
    },
    {
        template: 'product-3',
        filename: {
            en: '',
            tr: 'product-3'
        }
    },
    {
        template: 'product-4',
        filename: {
            en: '',
            tr: 'product-4'
        }
    }
];

const pageMain = [];

for (let i = 0; i < pages.length; i++) {
    // eslint-disable-next-line prefer-destructuring
    const template = pages[i].template;
    // eslint-disable-next-line prefer-destructuring
    const filename = pages[i].filename;

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(filename)) {
        for (let j = 0; j < langs.length; j++) {
            const lang = langs[j];

            if (key === lang && value !== '') {
                // eslint-disable-next-line prefer-template
                const templateName = langBasePath + lang + '/' + template + extensions[0];
                pageMain.push(
                    {
                        template: templateName,
                        filename: value + extensions[1]
                    }
                );
            }
        }
    }
}

module.exports = {
    pageMain
};
