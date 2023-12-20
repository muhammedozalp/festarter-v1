// node built-in modules
const path = require('path');

// external modules
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
// eslint-disable-next-line prefer-destructuring
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CopyPlugin = require('copy-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const purgecss = require('@fullhuman/postcss-purgecss');
// eslint-disable-next-line import/no-extraneous-dependencies
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// custom modules
const pluginFilesAndTemplates = require('./webpack_config/create-html-webpack-plugin-files.js');

const mode = process.argv.includes('--mode=production') ? 'production' : 'development';
const isTesting = process.argv.includes('is-test');

let entries = {
};
const plugIns = [];
const moduleRules = [];
let devTool = '';
let assetPath = '';
let outputPath = '';
let staticDirOfDevserver = '';
let openViews = '';
const DOMAIN = {
    DEV: '',
    PROD: '',
    TEST: ''
};

const CMDTYPE = {
    DEV: (mode === 'development'),
    DEVTEST: (mode === 'development' && isTesting),
    DEVONLY: (mode === 'development' && !isTesting),
    PROD: (mode === 'production'),
    PRODTEST: (mode === 'production' && isTesting),
    NOTTEST: !isTesting
};

const setEntries = () => {
    let entryFiles = '';

    if (CMDTYPE.PROD && CMDTYPE.NOTTEST) {
        entryFiles = {
            index: {
                import: path.resolve(__dirname, './src/assets/js/index.ts'),
                filename: 'assets/js/[name].js'
            },
            'auto-generated-js-file-for-css': {
                import: path.resolve(__dirname, './src/assets/js/css-imports.ts'),
                filename: 'assets/auto_generated_files/[name].js'
            }
        };
    } else {
        entryFiles = {
            index: {
                import: path.resolve(__dirname, './src/assets/js/index.ts'),
                filename: 'assets/js/[name].js'
            },
            'auto-generated-js-file-for-css': {
                import: path.resolve(__dirname, './src/assets/js/css-imports.ts'),
                filename: 'assets/auto_generated_files/[name].js'
            }
        };
    }

    return entryFiles;
};

entries = setEntries();

const setPublicPath = () => {
    let baseAssetPath = '';

    if (CMDTYPE.DEVTEST || CMDTYPE.PRODTEST) {
        baseAssetPath = DOMAIN.TEST;
    } else if (CMDTYPE.PROD) {
        baseAssetPath = DOMAIN.PROD;
    } else if (CMDTYPE.DEV) {
        baseAssetPath = DOMAIN.DEV;
    }

    return baseAssetPath;
};

assetPath = setPublicPath();

function setOutputPath() {
    const outputDir = path.resolve(__dirname, 'dist');

    return outputDir;
}

outputPath = setOutputPath();

function setStaticDirectoryOfDevserver() {
    const directory = path.resolve(__dirname, 'dist');

    return directory;
}

staticDirOfDevserver = setStaticDirectoryOfDevserver();

function handleDevToolProperty() {
    let sourcemapOption = '';

    if (CMDTYPE.PROD && CMDTYPE.NOTTEST) {
        sourcemapOption = false;
    } else {
        sourcemapOption = 'source-map';
    }

    return sourcemapOption;
}

devTool = handleDevToolProperty();

function handleJavascript() {
    moduleRules.push(
        {
            test: /\.(js|ts)$/,
            exclude: /node_modules/,
            use: {
                // without additional settings, this will reference .babelrc or babel.config.js
                loader: 'babel-loader'
            }
        },
        { // here doing the swiper loader and declaring no sideEffects
            test: /swiper\.esm\.js/,
            sideEffects: false
        }
    );
}

function setPostcssPlugins() {
    return [
        purgecss({
            content: ['./src/**/*.njk', './src/**/*.scss', './src/**/*.css', './src/**/*.js', './src/**/*.ts'],
            css: ['./src/**/*.scss', './src/**/*.css', './src/**/*.js', './src/**/*.ts'],
            safelist: [/swiper/]
        })
    ];
}

function setInlineStyleModuleRules() {
    const styles = {
        test: /\.(s[ac]|c)ss$/i,
        // NOTE postcss-loader automatically looks for postcss.config.js file.
        use: [
            {
                loader: 'style-loader'
            },
            {
                loader: 'css-loader',
                options: {
                    sourceMap: mode !== 'production',
                    importLoaders: 2
                }
            },
            'postcss-loader',
            'sass-loader'
        ]
    };

    moduleRules.push(styles);
}

function setExternalStyleModuleRules() {
    const styles = {
        test: /\.(s[ac]|c)ss$/i,
        use: [
            {
                loader: MiniCssExtractPlugin.loader,
                options: {
                    publicPath: assetPath
                }
            },
            {
                loader: 'css-loader',
                options: {
                    sourceMap: mode !== 'production',
                    importLoaders: 2
                }
            },
            {
                loader: 'postcss-loader',
                options: {
                    sourceMap: mode !== 'production',
                    postcssOptions: {
                        plugins: setPostcssPlugins()
                    }
                }
            },
            'sass-loader'
        ]
    };

    moduleRules.push(styles);
}

function handleGlobalVariables() {
    plugIns.push(
        new webpack.DefinePlugin({
            DEVELOPMENT: JSON.stringify(mode !== 'production'),
            TEST: JSON.stringify(isTesting)
        })
    );
}

function setMiniCssExtractPlugin() {
    plugIns.push(new MiniCssExtractPlugin({
        filename: 'assets/css/style.[contenthash].css'
    }));
}

function handleStyle(isInline) {
    if (isInline) {
        setInlineStyleModuleRules();
    } else {
        setExternalStyleModuleRules();
        setMiniCssExtractPlugin();
    }
}

function handleImagesAndIcons() {
    moduleRules.push({
        test: /\.(png|jpe?g|gif|svg|webp|mp4|webm|eot|ttf|woff|woff2)$/i,
        type: 'asset/resource', // external file
        generator: {
            filename: (name) => {
                /**
                 * @description Remove first & last item from ${path} array.
                 * @example
                 *      Orginal Path: 'src/images/avatar/image.jpg'
                 *      Changed To: 'images/avatar'
                 * reference url https://webpack.js.org/configuration/module/#rulegeneratoroutputpath
                 */
                const pathImgDev = name.filename.split('/').slice(1, -1).join('/');
                const pathImgProd = 'assets/images';
                const pathImg = mode === 'development' ? pathImgDev : pathImgProd;
                return `${pathImg}/[name].[contenthash][ext]`;
            },
            // publicPath: ''
            publicPath: assetPath
        }

        // type: 'asset/inline', // makes images inline
        // type: 'asset', // this option determines whether it will be inline or external
        /**
         * NOTE
         * to make it inline, max size can be defined here
         */
        // parser: {
        //     dataUrlCondition: {
        //         maxSize: 30 * 1024
        //     }
        // },
    });
}

function setNjkFilesModuleRules() {
    moduleRules.push({
        test: /\.njk$/,
        use: [
            {
                loader: 'simple-nunjucks-loader',
                options: {
                    searchPaths: [
                        'src/views'
                    ],
                    assetsPaths: 'src/assets',
                    // assetsPaths: ['src/assets', 'src/static']
                    // filters: {
                    //     getData: path.join(__dirname, 'src/get-global-data.js')
                    // }
                    globals: {
                        getData: path.join(__dirname, 'src/util/get-data.js')
                    }
                }
            }
        ]
    });
}

function setNjkFilesPlugin() {
    for (let i = 0; i < pluginFilesAndTemplates.length; i++) {
        const item = pluginFilesAndTemplates[i];

        plugIns.push(
            new HtmlWebpackPlugin({
                template: item.template,
                filename: item.filename,
                // publicPath: assetPath,
                publicPath: '',
                inject: true,
                base: assetPath
            })
        );
    }
}

function handleNjkFiles() {
    setNjkFilesModuleRules();
    setNjkFilesPlugin();
}

function handleAnalyzerPlugin() {
    const enableAnalyzer = process.argv.includes('analyze');

    if (!enableAnalyzer) return;

    plugIns.push(new BundleAnalyzerPlugin());
}

const removeAutoGeneratedFolder = () => {
    plugIns.push(
        new FileManagerPlugin({
            events: {
                onEnd: {
                    delete: [
                        {
                            source: 'dist/assets/auto_generated_files',
                            // options: {
                            //     // NOTE Use this option if target dir is out of package.json dir
                            //     force: true
                            // }
                        }
                    ]
                }
            },
            runOnceInWatchMode: true
        })
    );
};

const copyStaticFiles = () => {
    plugIns.push(
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, './src/static'),
                    to: path.join(__dirname, 'dist', 'assets')
                }
            ]
        })
    );
};

function handleDevserverOpenViews() {

    const open = {
        target: ['index.html']
    };

    return open;
}

openViews = handleDevserverOpenViews();

const handleCleanDistPlugin = () => {
    /**
     * NOTE
     * Normally `output.clean = true` cleans the dist folder
     * but when you use it with webpack dev server and write to disk together
     * it is not cleaning dist file.
     * So for best practice I am using both of them
     * `output.clean = true` and `CleanWebpackPlugin`
     * This is a bug.
     */
    plugIns.push(new CleanWebpackPlugin());
};

handleGlobalVariables();
handleJavascript();
handleStyle(false);
handleImagesAndIcons();
handleNjkFiles();
copyStaticFiles();
removeAutoGeneratedFolder();
handleCleanDistPlugin();
handleDevserverOpenViews();
handleAnalyzerPlugin();

module.exports = {
    mode,
    entry: entries,
    output: {
        filename: 'assets/js/[name].[contenthash].js',
        path: outputPath,
        // publicPath: 'auto', // defaults to 'auto' with web and web-worker targets
        publicPath: '/',
        // DEFAULT PROPERTIES FOR OUTPUT
        iife: true,
        // iife: false,
        // environment: {
        //     // The environment supports arrow functions ('() => { ... }').
        //     arrowFunction: true,
        //     // The environment supports BigInt as literal (123n).
        //     bigIntLiteral: false,
        //     // The environment supports const and let for variable declarations.
        //     const: true,
        //     // The environment supports destructuring ('{ a, b } = obj').
        //     destructuring: true,
        //     // The environment supports an async import() function to import EcmaScript modules.
        //     dynamicImport: false,
        //     // The environment supports 'for of' iteration ('for (const x of array) { ... }').
        //     forOf: true,
        //     // The environment supports ECMAScript Module syntax
        //          to import ECMAScript modules (import ... from '...').
        //     module: false,
        //     // The environment supports optional chaining ('obj?.a' or 'obj?.()').
        //     optionalChaining: true,
        //     // The environment supports template literals.
        //     templateLiteral: true,
        // },
        clean: true
    },
    devtool: devTool,
    devServer: {
        client: {
            overlay: { // for only browser
                errors: true,
                warnings: false
            }
        },
        hot: false,
        static: {
            // directory: path.join(__dirname, 'dist'),
            directory: staticDirOfDevserver
        },
        open: openViews,
        // open: ['/testDesktop.html'],
        watchFiles: ['src/**/*', 'src/**/*.njk', 'src/**/*.webp', 'src/**/*.png', 'src/**/*.jpg', 'src/**/*.jpeg'],
        liveReload: true,
        devMiddleware: {
            writeToDisk: true
        }
    },
    plugins: plugIns,
    module: {
        rules: moduleRules
    },
    optimization: {
        usedExports: true,
        minimize: mode !== 'development',
        minimizer: [
            new TerserPlugin({
                // extractComments: false,
                terserOptions: {
                    sourceMap: mode !== 'production',
                    compress: mode !== 'development',
                    mangle: mode !== 'development',
                    keep_fnames: mode !== 'production'
                    // format: {
                    //     comments: false // removes licience.txt
                    // }
                }
            })
        ]
    },
    performance: {
        hints: 'warning',
        maxEntrypointSize: 100000,
        maxAssetSize: 146000
    },
    resolve: {
        extensions: ['.ts', '.js']
    }
};
