#!/usr/bin/env node
const { promises: fs } = require("fs");
const path = require("path");
const list = require('../lib/list')
const modulesPath = require('../lib/modulesPath')
const command = process.argv[2];

const resolveMeta = () => {
  const dest = process.cwd();
  const package = require(path.resolve(dest, "./package.json"));
  const source = path.resolve(modulesPath, package.name);
  return {
      dest,
      package,
      source
  }
}

const link = async () => {
    const {dest, package, source} =  resolveMeta()
  const { dir } = path.parse(source);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.symlink(dest, source);
  } catch (e) {
    if (e.code === "EEXIST") {
      throw `${package.name} already linked to ${await fs.readlink(source)}`;
    } else {
      throw e;
    }
  }
  console.log(`${source} -> ${dest}`);
};

const unlink = async () => {
    const {source} = resolveMeta()
    await fs.unlink(source)
}

try {
  switch (command) {
    case "link":
      link();
      break;
    case "unlink":
      unlink();
      break;
    case "list":
        list(({pkgName, dest}) => console.log(`${pkgName} -> ${dest}`))
        break
    default:
      console.log(`
Usage: dev-resolve <command>

commands:
link      register a package as a linkable dependency
unlink    unregister a linkable dependency
list      list all linkable dependencies
`);
  }
} catch (e) {
  console.error(e);
}
