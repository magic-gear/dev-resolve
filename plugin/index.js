/* eslint-env node */
const path = require("path");
const list = require("../lib/list");
const modulesPath = require("../lib/modulesPath");

const test = /\.jsx?$/

class DevResolvePlugin {
  constructor() {
    this.links = [];
    this.applied = false;
  }
  apply(compiler) {
    const logger = compiler.getInfrastructureLogger("DevResolvePlugin");
    compiler.hooks.watchRun.tapPromise("DevResolvePlugin", async (compiler) => {
      if (this.applied) return;
      await list(({ pkgName, dest }) => {
        this.links.push(dest);
        logger.info(`${pkgName} -> ${dest}`);
      }).catch((error) => {
        if (error.code !== "ENOENT") {
          throw error;
        }
      });
      let peers = []
      for (const link of this.links) {
        const {peerDependencies = {}} = require(path.resolve(link, 'package.json'))
        peers = peers.concat(Object.keys(peerDependencies))
      }

      for (const lib of new Set(peers)) {
        const { resolve } = compiler.options;
        resolve.alias = resolve.alias || {};
        resolve.alias[lib] = path.resolve(
          compiler.context,
          "node_modules",
          lib
        );
      }
      compiler.options.resolve.modules.unshift(modulesPath);
      compiler.options.module.rules.unshift({
        test,
        exclude: [
          /node_modules[\\\/]core-js/,
          /node_modules[\\\/]@babel[\\\/]runtime/,
        ],
        use: [
          {
            loader: "babel-loader",
            options: {
              links: this.links,
              customize: path.join(__dirname, "./custom-loader"),
            },
          },
        ],
        include: (filename) =>
          this.links.some((link) => filename.includes(link)),
      });
      this.applied = true;
    });
  }
}

module.exports = DevResolvePlugin;
