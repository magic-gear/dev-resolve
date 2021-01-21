# dev-resolve
A webpack plugin for resolving dependency in development

## Features

The goal of the webpack plugin is to make you develop and test your self-developed dependencies of your own apps easily

- reoslves your self-developed dependencies from repo location instead of node_modules of the app project
- use babel option in each repo to transpile your self-developed dependencies, as if you are using published packages
- each self-dependency is a independent package, lockfile won't be affected like in a workspace, you can publish it easily
- package manager agnostic, we implement a link mechanism to register your package to avoid flaws of package manager link, so you can use any package manager with dev-resolve
- resolve common dependencies, some dependencies like react, you should make sure you use the same copy as in your app across all dependencies

## Install

```bash
npm add -D @mana-ui/dev-resolve
```

## Usage

### Step 1: Link your packages

```bash
cd /path/to/your/package
npx dev-resolve link
```

This create a link in a default directory, make the plugin in app can find the dependencies.

### Step 2: Config the plugin in your app

```javascript
const DevResolvePlugin = require('@mana-ui/dev-resolve')

module.exports = {
  plugins: [new DevResolvePlugin({common: ['react']}), ...other plugins],
  ...other configs
}
```
## Options

- `common`: Default `[]`. Common dependency that should resolve from app node_modules.
