npm run test
现在是先编译成js再测试

由于是es6需要babel

babel-jest @babel/core @babel/preset-env


// babel.config.js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
  ],
};