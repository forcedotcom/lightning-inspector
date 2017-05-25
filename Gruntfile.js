'use strict';
var webpack = require('webpack');

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-zip");

  grunt.initConfig({
    webpack: {
      options: {
        entry: {
          "contentScript": './src/contentScript.js',
          "background": './src/background.js',
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
          ]
        },
        stats: {
            // If you what more info on whats breaking, toggle to true.
            errorDetails: false
        },
        output: {
          filename: 'dist/[name].js',
          chunkFilename: 'dist/[name].js'
        },
        node: {
          global: true,
          process: false,
          Buffer: false,
          setImmediate: false
        },
        plugins: [
          new webpack.EnvironmentPlugin(['NODE_ENV', 'GIT_BRANCH'])
        ],
        context: __dirname,
        module: {
          loaders: [
            { test: /.js?$/, loader: 'babel-loader', exclude: /node_modules|dist/ },
            { test: /\.less$/, loader: 'style-loader!css-loader!less-loader' },
            { test: /\.scss/, loader: 'style-loader!css-loader!sass-loader' },
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            { test: /\.json/, loader: 'json-loader' },
            { test: /\.md/, loader: 'raw-loader' },
            { test: /\.png$/, loader: 'url-loader?limit=100000' },
            { test: /\.jpg$/, loader: 'file-loader' }
          ]
        }
      },
      dist: {
        cache: true
      },
      dev: {
        watch: true,
        failOnError: false,
        keepalive: true
      }
    },

    // Uglify for Compression
    uglify: {
      dist: {
        files: [
          { expand: true, cwd: 'dist/', src: ['**/*.js'], dest: 'dist/', ext: '.js' },
        ]
      }
    },

    // Copying files for the build
    copy: {
        build: {
            files: [
                // All the files necessary to run the build, minus the manifest, we'll do that one separate so we can modify it afterwards.
                { 
                  nonull: true, 
                  expand: true, 
                  src: [
                      "configuration.json",
                      "*.html",
                      "dist/**",
                      "src/devtoolsPanel/external/**",
                      "src/devtoolsPanel/components/**",
                      "src/devtoolsPanel/perfpanel/**",
                      "images/**",
                      "_locales/**",
                      "manifest.json",
                    ], 
                    dest: "builds/<%=buildVersion%>/" 
                }
          ]          
        }
    },

    stripJsonComments: {
      build: {
        files: [
            { 
                src: "builds/latest/manifest.json", 
                dest: "builds/latest/manifest.json" 
            },
            { 
                src: "builds/<%=buildVersion%>/manifest.json", 
                dest: "builds/<%=buildVersion%>/manifest.json" 
            }
        ]
      }
    },

    zip: {
        build: {
            cwd: "builds/<%=buildVersion%>",
            src: [ "builds/<%=buildVersion%>/**" ],
            dest: "builds/lightning-inspector-<%=buildVersion%>.zip"
        }
    }

  });

    // Watch for updates, validate my js, and put things in the right directories.
    grunt.registerTask('watch', ['webpack:dev']);

    // Minimize our JS
    // Generate the right directories to be checked in.
    // Should also generate CRX files.
    grunt.registerTask('build', ['webpack:dist', "uglify:dist", "buildLatestVersion", "buildSpecificVersion"]);
    

    /**
     * Remove development only properties from manifest, and store the version to 
     * also update the specific directory in the builds directory
     */
    grunt.registerTask("clean_manifest", "Process Manifest.json", function() {
        const path = "builds/" + (grunt.option("version") || grunt.option("current_version") || "latest") + "/manifest.json";
        const manifest = grunt.file.readJSON(path);

        // Future Runs should be able to use...
        grunt.option("current_version", manifest["version"]);
         
        // Delete the Key
        delete manifest["key"];

        grunt.file.write(path, JSON.stringify(manifest));
    });

    /**
     * Once we've copied the "latest" build, lets copy the specific version number too.
     * The "current_version" is set when we clean the manifest in buildLastestVersion.
     * You should also be able to specify the build number after the task name like, buildSpecificVersion:X.X.X.X. 
     */
    grunt.registerTask("buildSpecificVersion", function(buildVersion) {
        const version = buildVersion || grunt.option("current_version");

        grunt.log.writeln("Building Inspector Version: " + version);

        // We don't want to do anything in this case.
        if(version === "" || version === null || version === "latest") {
            grunt.log.error("Invalid inspector version specified. (" + version + ")");
            return;
        }

        grunt.config.set("buildVersion", version);

        /* 
         * Run for a specific version.
         *  - Copy everything to the build specific folder /builds/[version]
         *  - Strip all the json comments from manifest.json (its not valid and chrome won't allow it in prod builds of the inspector)
         *  - Remove the dev only "key" property from the manifest. 
         */
        grunt.task.run(["copy:build", "stripJsonComments:build", "clean_manifest"]);
    });

    /**
     * Build the latest folder, so you can point your build at that folder and always get the most up to date.
     */
    grunt.registerTask("buildLatestVersion", function() {
        grunt.config.set("buildVersion", "latest");

        // Run for a specific version
        grunt.task.run(["copy:build", "stripJsonComments:build", "clean_manifest", "zip"]);
    });

  
};
