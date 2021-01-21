module.exports = (babel) => {
  const ref = {}
  return {
    customOptions({links, ...loader}) {
      ref.links = links
      return { loader }
    },

    // Passed Babel's 'PartialConfig' object.
    config(cfg) {
      const { filename } = cfg.options
      const link = ref.links.find((link) => cfg.options.filename.includes(link))
      if (link) {
        const partialConfig = babel.loadPartialConfig({cwd: link, filename})
        if (partialConfig)
          return partialConfig.options
      }
      return cfg.options
    },

    result(result) {
      return {
        ...result,
        code: result.code,
      }
    },
  }
}
