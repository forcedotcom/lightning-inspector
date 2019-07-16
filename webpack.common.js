const path = require('path');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const DashboardPlugin = require("webpack-dashboard/plugin");
const FileManagerPlugin = require("filemanager-webpack-plugin");
 
module.exports = {
        mode: 'development',
        entry: {
          "contentScript": [
            './src/contentScript.js',
            './stylesheets-previewer/src/inject/inject.js'
          ],
          "background": [
            './src/background.js', 
          ],
          "devtools_tab": [
            "./src/devtools.js"
          ],
          "viewerPanel": [
            "./src/devtoolsPanel/devtoolsPanel.js"
          ],
          "viewerSidebar": [
            "./src/sidebarPanel/sidebarPanel.js"
          ],
          "component-json": [
            "./src/devtoolsPanel/components/json/json.js"
          ],
          "component-actionCard": [
            "./src/devtoolsPanel/components/actionCard/actionCard.js"
          ],
          "component-auracomponent": [
            "./src/devtoolsPanel/components/auracomponent/auracomponent.js"
          ],
          "component-chaosCard": [
            "./src/devtoolsPanel/components/chaosCard/chaosCard.js"
          ],
          "component-controllerreference": [
            "./src/devtoolsPanel/components/controllerreference/controllerreference.js"
          ],
          "component-eventCard": [
            "./src/devtoolsPanel/components/eventCard/eventCard.js"
          ],
          "component-label": [
            "./src/devtoolsPanel/components/label/label.js"
          ],
          "component-onOffButton": [
            "./src/devtoolsPanel/components/onOffButton/onOffButton.js"
          ],
          "component-outputFunction": [
            "./src/devtoolsPanel/components/outputFunction/outputFunction.js"
          ],
          "perfpanel": [
            "./src/devtoolsPanel/perfpanel/js/AuraPerfPanel.js",
            "./src/devtoolsPanel/perfpanel/js/Main.js",
            "./src/devtoolsPanel/perfpanel/js/ProfilesPanel.js",
            "./src/devtoolsPanel/perfpanel/js/init.js"
          ],
          "LightningInspectorInjectedScript": [
            "./src/LightningInspectorInjectedScript.js", 
            "./src/aura/gatherer/unStrictApis.js"
          ],
          "BrowserAction": [
            "./stylesheets-previewer/src/page_action/page_action.js"
          ]
        },
        stats: {
            // If you what more info on whats breaking, toggle to true.
            errorDetails: true
        },
        output: {
          filename: '[name].js',
          chunkFilename: '[name].chunk.js',
          path: path.resolve(__dirname, 'dist')
        },
        node: {
          fs: 'empty',
          global: true,
          process: false,
          Buffer: false,
          setImmediate: false
        },
        plugins: [
          new CleanWebpackPlugin(['dist']),
          // Bulk Copy Slds Assets
          // Still means we're importing all the icons.
          // Ideally we want to only import the ones we use, but I wasn't able to get that copying right.
          new CopyWebpackPlugin([ 
            { from: 'node_modules/@salesforce-ux/design-system/assets/icons', to: 'slds/assets/icons'},
            { from: 'node_modules/@salesforce-ux/design-system/assets/images', to: 'slds/assets/images'},
            { from: 'node_modules/@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css', to:'slds/assets/styles/salesforce-lightning-design-system.min.css'}
          ]),
          new DashboardPlugin(),
          // Copy to the testing directory for the local server
          // this way each change during yarn watch will cause the files to be updated for the aura server.
          new FileManagerPlugin({
            onEnd: {
              copy: [
                { source: "dist", destination: "aura-inspector-tests/src/main/webapp/dist" }
              ]
            }
          })
        ],
        context: __dirname,
        module: {
          rules: [
            { 
              test: /.js?$/, 
              exclude: /node_modules/,
              use: [{loader:  'babel-loader' }]
            },
            { test: /\.less$/, use: ['style-loader', 'css-loader', 'less-loader' ] },
            { test: /\.scss/, use: ['style-loader', 'css-loader', 'sass-loader' ] },
            { test: /\.css$/, use: ['style-loader', 'css-loader' ] },
            // { test: /\.json/, use: [{loader:  'json-loader' }] },
            { test: /\.md/, use: [{loader:  'raw-loader' }] },
            { test: /\.png$/, use: [{loader:  'url-loader?limit=100000', options: { limit: 100000 } }] },
            { test: /\.jpg$/, use: [{loader:  'file-loader' }] },
            // the url-loader uses DataUrls. 
            // the file-loader emits files. 
            { 
              test: /\.woff(2)?(\?v=\d+\.\d+\.\d+)?$/, 
              use: [
                {
                  loader: "url-loader",
                  options: {
                    "limit":10000,
                    "mimetype":"application/font-woff",
                    "name": '[name].[ext]',
                    "outputPath": "dist/assets/",
                    "publicPath": 'dist/assets/'
                  }
                }
              ]
            },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, use: [{loader:  "url-loader?limit=10000&mimetype=application/octet-stream"}] },
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use: [{loader:  "file-loader" }]}
          ]
        }
      }