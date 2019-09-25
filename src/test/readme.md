## 执行：
在根目录下执行:
```bash
npm run test
或者 
jest
```


现在是先编译成js再测试

## 依赖
由于是es6需要babel
babel-jest @babel/core @babel/preset-env

### babel配置
```json
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
```

## 单独测试 
Jest world.test.js

## 调试
node --inspect-brk ./node_modules/jest/bin/jest.js octree.test.js
