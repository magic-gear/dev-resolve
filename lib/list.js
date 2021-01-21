const modulesPath = require('./modulesPath')
const { promises: fs } = require("fs");
const path = require('path')

const list =  async(callback, dir = modulesPath, scope) => {
    const files = await fs.readdir(dir)
    for (const file of files) {
        const absPath = path.resolve(dir, file)
        if ((await fs.lstat(absPath)).isSymbolicLink()) {
            callback({
                pkgName: [scope, file].filter(Boolean).join('/'),
                dest: await fs.readlink(absPath)
            })
        } else {
            await list(callback, absPath, file)
        }
    }
}

module.exports = list