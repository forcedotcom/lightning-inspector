'use strict';

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    const webpack = require('webpack');
    const CopyWebpackPlugin = require('copy-webpack-plugin');
    const webpackDevConfig = require('./webpack.dev.js');
    const webpackProdConfig = require('./webpack.prod.js');

    grunt.initConfig({
        webpack: {
            prod: webpackProdConfig,
            dev: webpackDevConfig
        },

        // Typescript
        ts: {
            default: {
                tsconfig: './tsconfig.json'
            }
        },

        // Uglify for Compression
        uglify: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'dist/',
                        src: ['**/*.js'],
                        dest: 'dist/',
                        ext: '.js'
                    }
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
                            'configuration.json',
                            '*.html',
                            'dist/**',
                            'src/devtoolsPanel/external/**',
                            'src/devtoolsPanel/components/**',
                            'src/devtoolsPanel/perfpanel/**',
                            'stylesheets-previewer/**',
                            'images/**',
                            '_locales/**',
                            'manifest.json'
                        ],
                        dest: 'builds/'
                    }
                ]
            }
        },

        stripJsonComments: {
            build: {
                files: [
                    {
                        src: 'builds/manifest.json',
                        dest: 'builds/manifest.json'
                    }
                ]
            }
        },

        zip: {
            build: {
                cwd: 'builds/',
                src: ['builds/**'],
                dest: 'lightning-inspector-<%=buildVersion%>.zip'
            }
        }
    });

    // Watch for updates, validate my js, and put things in the right directories.
    grunt.registerTask('watch', ['webpack:dev']);

    // Minimize our JS
    // Generate the right directories to be checked in.
    // Should also generate CRX files.
    grunt.registerTask('build', ['webpack:prod', 'uglify:dist', 'buildLatestVersion']);

    /**
     * Remove development only properties from manifest, and store the version to
     * also update the specific directory in the builds directory
     */
    grunt.registerTask('clean_manifest', 'Process Manifest.json', function() {
        const path = 'builds/manifest.json';
        const manifest = grunt.file.readJSON(path);

        // Future Runs should be able to use...
        grunt.option('current_version', manifest['version']);

        // Delete the Key
        delete manifest['key'];

        grunt.file.write(path, JSON.stringify(manifest));
    });

    /**
     * Build the latest folder, so you can point your build at that folder and always get the most up to date.
     */
    grunt.registerTask('buildLatestVersion', function() {
        grunt.config.set('buildVersion', 'latest');

        // Run for a specific version
        grunt.task.run(['copy:build', 'stripJsonComments:build', 'clean_manifest', 'zip']);
    });
};
