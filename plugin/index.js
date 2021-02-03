/* eslint-env node */
const path = require("path")
const list = require('../lib/list')
const modulesPath = require('../lib/modulesPath')

class DependencyResolvePlugin {
  constructor(options) {
    this.options = options
    this.links = []
    list(({dest}) => this.links.push(dest)).catch(error => {
      if (error.code !== 'ENOENT') {
        throw error
      }
    })
  }
  apply(compiler) {
    if (this.links.length > 0)
    compiler.hooks.afterPlugins.tap("dependency-resolve", (compiler) => {
      for (const lib of this.options.common) {
        compiler.options.resolve.alias[lib] = path.resolve(
          compiler.context,
          "node_modules",
          lib
        )
      }
      compiler.options.resolve.modules.unshift(modulesPath)
      compiler.options.module.rules.forEach(rule => {
        rule.exclude = [rule.exclude, filename => {
          try {

          return this.links.some(link => filename.includes(link))
          } catch(e) {
            console.log(e)
            throw e
          }
        }].filter(Boolean)
      })
      compiler.options.module.rules.unshift({
        test: /\.js$/,
        exclude: [
          /node_modules[\\\/]core-js/,
          /node_modules[\\\/]@babel[\\\/]runtime/,
        ],
        use: [{
          loader: 'babel-loader',
          options: {
            links: this.links,
            customize: path.join(__dirname, './custom-loader')
          },
        }],
        include: filename => this.links.some(link => filename.includes(link))
      })
    })
  }
}

module.exports = DependencyResolvePlugin
