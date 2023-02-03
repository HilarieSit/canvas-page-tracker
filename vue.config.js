const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})

module.exports = {
  devServer: {
      proxy: 'https://localhost:5000'
  },
  publicPath: process.env.NODE_ENV === 'production' ? '/canvas-page-tracker/' : '/',
}