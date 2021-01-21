/* eslint-env node */
const path = require("path")
const child_process = require("child_process")

class DependencyResolvePlugin {
  constructor(options) {
    this.options = options
    const info = JSON.parse(child_process.execSync('npm ls --global=true --depth=0 --link=true --json=true --long=true').toString())
    this.links = []
    for (const json of Object.values(info.dependencies)) {
        this.links.push(json.link)
    }
    this.linkedFolder = path.resolve(
      child_process.execSync("npm prefix -g").toString().trim(),
      "lib/node_modules"
    )
  }
  apply(compiler) {
    compiler.hooks.afterPlugins.tap("dependency-resolve", (compiler) => {
      for (const lib of this.options.common) {
        compiler.options.resolve.alias[lib] = path.resolve(
          compiler.context,
          "node_modules",
          lib
        )
      }
      compiler.options.resolve.modules.unshift(this.linkedFolder)
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
        use: {
          loader: 'babel-loader',
          options: {
            links: this.links,
            customize: path.join(__dirname, './custom-loader')
          },
          include: filename => {
            return this.links.some(link => filename.includes(link))
          }
        },
      })
    })
  }
}

module.exports = DependencyResolvePlugin
