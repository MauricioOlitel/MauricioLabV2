const path = require('path');

module.exports = (config, { isProd, isDev, isTest }) => {
  /**
   * Customize the webpack by modifying the config object.
   * Consult https://webpack.js.org/configuration for more information
   */

  for (const plugin of config.plugins) {
    // Change tsconfig for ForkTsCheckerWebpackPlugin to version which excludes test files
    if (plugin.tsconfig && plugin.options?.tsconfig) {
      const tsconfig = plugin.tsconfig.replace('.json', '.build.json');
      plugin.options.tsconfig = tsconfig;
      plugin.tsconfig = tsconfig;
    }
  }

  return {
    ...config,
    performance: {
      ...config.performance,
      hints: false,
    },
    module: {
      ...config.module,
      rules: [
        ...config.module.rules,
        // Transpile specific modern ESM packages that ship untranspiled optional chaining
        {
          test: /\.(js|mjs)$/,
          include: [
            path.dirname(require.resolve('emoji-mart/package.json')),
            path.dirname(require.resolve('@emoji-mart/react/package.json')),
          ],
          use: {
            loader: require.resolve('babel-loader'),
            options: {
              presets: [
                [require.resolve('@babel/preset-env'), { targets: 'defaults' }],
                require.resolve('@babel/preset-react'),
              ],
              plugins: [
                // ensure optional chaining/nullish coalescing parsed if env preset target decides not to transpile
                require.resolve('@babel/plugin-proposal-optional-chaining'),
                require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
              ],
              cacheDirectory: true,
            },
          },
        },
        {
          test: /index\.ts$/,
          include: [path.join(__dirname, 'src/feature-library/')],
          use: 'import-glob',
        },
        {
          test: /\.ts$/,
          include: [path.join(__dirname, 'src/utils/feature-loader/')],
          use: 'import-glob',
        },
        {
          test: /\.tsx$/,
          include: [path.join(__dirname, 'src/utils/feature-loader/')],
          use: 'import-glob',
        },
      ],
    },
  };
};
