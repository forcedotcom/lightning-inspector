"use strict";

module.exports = function(grunt) {
  require("load-grunt-tasks")(grunt);
  const webpack = require("webpack");
  const CopyWebpackPlugin = require("copy-webpack-plugin");
  const webpackDevConfig = require("./webpack.dev.js");
  const webpackProdConfig = require("./webpack.prod.js");

  grunt.initConfig({
    webpack: {
      prod: webpackProdConfig,
      dev: webpackDevConfig
    },

    // Uglify for Compression
    uglify: {
      dist: {
        files: [
          {
            expand: true,
            cwd: "dist/",
            src: ["**/*.js"],
            dest: "dist/",
            ext: ".js"
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
              "configuration.json",
              "*.html",
              "dist/**",
              "src/devtoolsPanel/external/**",
              "src/devtoolsPanel/components/**",
              "src/devtoolsPanel/perfpanel/**",
              "stylesheets-previewer/**",
              "images/**",
              "_locales/**",
              "manifest.json"
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
        src: ["builds/<%=buildVersion%>/**"],
        dest: "builds/lightning-inspector-<%=buildVersion%>.zip"
      }
    }
  });

  // Watch for updates, validate my js, and put things in the right directories.
  grunt.registerTask("watch", ["webpack:dev"]);

  // Minimize our JS
  // Generate the right directories to be checked in.
  // Should also generate CRX files.
  grunt.registerTask("build", [
    "webpack:prod",
    "uglify:dist",
    "buildLatestVersion"
  ]);

  /**
   * Remove development only properties from manifest, and store the version to
   * also update the specific directory in the builds directory
   */
  grunt.registerTask("clean_manifest", "Process Manifest.json", function() {
    const path =
      "builds/" +
      (grunt.option("version") || grunt.option("current_version") || "latest") +
      "/manifest.json";
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
    if (version === "" || version === null || version === "latest") {
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
    grunt.task.run([
      "copy:build",
      "stripJsonComments:build",
      "clean_manifest",
      "zip"
    ]);
  });
};
