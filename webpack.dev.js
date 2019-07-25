const merge = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "development",
  devtool: "source-map",
  target: "web",
  watch: true,
  bail: false,
  devServer: {
    contentBase: "./dist"
  }
});
