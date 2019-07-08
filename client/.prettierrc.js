module.exports = {
  overrides: [
    {
      files: "src/**/*.js",
      options: {
        arrowParens: "always",
        bracketSpacing: true,
        insertPragma: false,
        jsxBracketSameLine: false,
        proseWrap: "preserve",
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: "all",
        useTabs: false
      }
    }
  ],
  printWidth: 100
};
