const { transformSync } = require("esbuild");

module.exports = {
  process(source, filename) {
    const result = transformSync(source, {
      loader: "ts",
      format: "cjs",
      sourcefile: filename,
      target: "node24",
    });

    return { code: result.code };
  },
};
