const babelEnv = process.env.BABEL_ENV;


// use browser target w/ es6 imports for webpack
const envPresetConfig = (babelEnv === 'webpack') ? { targets: { browsers: '> 1%' }, 'modules' : false } : {};


module.exports = {
  presets: [
    [ "@babel/preset-env", envPresetConfig ],
    '@babel/preset-react'
  ],
  plugins: [     
    '@babel/plugin-proposal-class-properties', 
    '@babel/plugin-transform-react-jsx',
    'lodash',
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    '@babel/plugin-transform-runtime'
  ],
  sourceMaps: true,
};
