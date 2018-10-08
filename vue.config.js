// vue.config.js
module.exports = {
  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        secure: false
      },
      "/graphql": {
        target: "http://localhost:3001",
        secure: false
      }
    }
  }
};
