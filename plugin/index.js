/* eslint-env node */
const path = require("path")
const list = require('../lib/list')
const modulesPath = require('../lib/modulesPath')

class DevResolvePlugin {
  constructor(options) {
    this.options = options ?? {common: []}
    this.links = []
    this.applied = false
  }
  apply(compiler) {
    compiler.hooks.watchRun.tapPromise("DevResolvePlugin", async (compiler) => {
        if (this.applied) return
      await list(({dest}) => {
        this.links.push(dest)
      }).catch(error => {
        if (error.code !== 'ENOENT') {
          throw error
        }
      })
      for (const lib of this.options.common) {
          const {resolve} = compiler.options
          resolve.alias = resolve.alias ?? {}
        resolve.alias[lib] = path.resolve(
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
      this.applied = true
    })
  }
}

module.exports = DevResolvePlugin
