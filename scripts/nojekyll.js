/* 构建后写入 .nojekyll，避免 GitHub Pages 走 Jekyll 处理静态文件 */
const fs = require('fs');
const path = require('path');

hexo.extend.filter.register('after_generate', function () {
  fs.mkdirSync(hexo.public_dir, { recursive: true });
  fs.writeFileSync(path.join(hexo.public_dir, '.nojekyll'), '');
});
