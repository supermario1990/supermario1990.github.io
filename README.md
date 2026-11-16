# supermario1990 知识库

基于 Hexo 7 + Fluid 主题的技术知识库，托管在 GitHub Pages：<https://supermario1990.github.io/>

- **`hexo` 分支＝源码**（Markdown、配置、主题依赖）。日常写作、提交都在这个分支。
- **`main` 分支＝构建产物**（静态 HTML/CSS/JS），由 `hexo deploy` 强制推送生成，**不要手改**。
- GitHub Pages 的发布源就是 `main` 分支根目录，所以推送 `hexo` 分支不会影响线上，只有 `npm run deploy` 才更新线上。

```
hexo 分支（source/ + _config*.yml + package.json）
        │  hexo generate
        ▼
     public/（静态站点）
        │  hexo deploy（hexo-deployer-git，force push）
        ▼
main 分支根目录 → GitHub Pages 自动发布
```

## 0. 换一台机器：从零到发布

```bash
# 1. 拉源码分支（注意是 hexo，不是 main）
git clone -b hexo git@github.com:supermario1990/supermario1990.github.io.git blog
cd blog

# 2. 装依赖（首次或换了机器都要跑）
npm install

# 3. 本地预览
npm run server                 # http://localhost:4000

# 4. 写文章（见第 2、3 节），然后发布
npm run deploy
```

前提：机器上有 Node.js ≥ 18、npm、git，并且这台机器的 SSH key 已加到 GitHub 账号（`ssh -T git@github.com` 能返回 `Hi supermario1990!`）。

## 1. 环境与版本

| 组件 | 版本 | 说明 |
| --- | --- | --- |
| Node.js | ≥ 18（实测 23.10.0） | 低版本可能跑不动 Hexo 7 |
| hexo | 7.3.0 | **不要升到 8.x**，见下方坑位 |
| hexo-cli | 4.3.2 | 提供 `hexo` 命令 |
| hexo-theme-fluid | 1.9.9 | 主题，npm 安装，不放进 `themes/` 目录 |
| hexo-renderer-marked | 7.x | Markdown 渲染 |

已知坑位（都已在 `package.json` 里处理好，重装环境时留意）：

1. **Hexo 8 不兼容**：装成 hexo 8 后执行 `npx hexo generate` 只会输出 `init/help/version` 三个命令的帮助，站点命令完全不加载。解决办法是锁 `hexo@^7.3.0`（当前配置），必要时 `npm install hexo@7.3.0`。
2. **`package.json` 必须有 `hexo` 字段**：`"hexo": { "version": "7.3.0" }`。没有这个字段，hexo-cli 不认为当前目录是个 Hexo 站点，同样只显示 3 个命令。
3. **缺 `@adobe/css-tools` 会报 500**：Fluid 的 stylus 渲染依赖它，已在 `dependencies` 中声明；若见到 `Cannot find module '@adobe/css-tools'`，执行 `npm i @adobe/css-tools`。
4. 任何奇怪报错，先 `rm -rf node_modules package-lock.json && npm install` 再试。

## 2. 新建文章

```bash
npm run new -- "Redis 持久化：RDB 与 AOF 的取舍"
```

会在 `source/_posts/` 生成 `Redis-持久化：RDB-与-AOF-的取舍.md`。

**文件名直接决定 URL**，所以生成后请重命名为英文小写 + 短横线：

```
source/_posts/redis-persistence.md  →  https://supermario1990.github.io/articles/redis-persistence.html
```

URL 规则来自 `_config.yml`：

```yaml
permalink: articles/:title.html
```

`:title` 就是去掉扩展名的文件名。中文、空格、大写文件名会生成需要转义的长 URL，尽量避免。
老地址 `articles/epoll-to-io-uring.html` 就是靠这条规则保持不变的。

## 3. front matter 字段

```yaml
---
title: "Redis 持久化：RDB 与 AOF 的取舍"
date: 2026-11-20 10:00:00
updated: 2026-11-20 10:00:00
tags:
  - Redis
  - 持久化
categories:
  - 存储
description: 一句话摘要，用于首页卡片与页面 meta description。
eyebrow: 深度技术报告 · STORAGE
words: 约 8000 字
---
```

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 是 | 标题。**含冒号、`#`、`[]` 等 YAML 特殊字符时必须用双引号包住**，否则整段 front matter 解析失败 |
| `date` | 是 | `YYYY-MM-DD HH:mm:ss`（按 `_config.yml` 的 `timezone: Asia/Shanghai` 解析），首页按它倒序 |
| `updated` | 否 | 同上格式，用于标记修订时间 |
| `tags` | 否 | YAML 列表写法，每项一行 `- 名称`，自动生成 `/tags/` 聚合页 |
| `categories` | 否 | 同上，自动生成 `/categories/` 聚合页；一篇文章建议只给一个 |
| `description` | 是 | 纯文本一句话摘要，首页卡片和 meta description 都用它 |
| `eyebrow` / `words` | 否 | 旧站点遗留的自定义字段，Fluid 不渲染，保留只为备查，不影响构建 |

注意：`date` 不要写成未来时间再指望“定时发布”——`future: true` 会让它立即可见，日期只是排序依据。

## 4. 图片 / 图示

- 存放：`source/assets/diagrams/`（新类型可以自建 `source/assets/img/`，构建后会原样拷到 `public/assets/...`）。
- 引用：**站点根路径，以 `/` 开头**：

```markdown
![图 01 从 select 到 io_uring 的演进](/assets/diagrams/fig-01.svg)
```

为什么用 `/` 开头：文章最终地址在 `/articles/xxx.html`，用相对路径（`../assets/...`）一旦 permalink 改动就会 404；根路径不受层级影响。

文件名只用英文、数字、短横线（`fig-01.svg`），上线后大小写敏感，`.SVG` 与 `.svg` 是不同文件。

## 5. 本地预览

```bash
npm run server            # 默认 http://localhost:4000
npm run server -- -p 5000 # 端口被占用时换一个
```

预览是动态服务，不会生成 `public/`，改完 Markdown 刷新浏览器即可看到。
注意不能用 `file://` 直接打开 `public/` 里的 HTML，评论和相对资源会失效。

## 6. 构建与发布

```bash
npm run clean      # 清空 public/ 和 db.json（可选，排障时用）
npm run build      # 只生成到 public/，不推送
npm run deploy     # 生成 + 推送到 main 分支（真正上线）
```

`npm run deploy` 的实际行为（hexo-deployer-git）：

1. 先 `hexo generate` 生成 `public/`
2. 在 `.deploy_git/` 里提交全部产物
3. **force push** 到 `git@github.com:supermario1990/supermario1990.github.io.git` 的 `main` 分支

因为第 3 步是强制覆盖，**`main` 上任何手工修改都会在下次部署时被抹掉**——所有改动都必须改在 `hexo` 分支的 `source/` 或配置里。

部署目标是 `_config.yml` 的 `deploy` 段，换仓库/换分支只需改这里：

```yaml
deploy:
  type: git
  repo: git@github.com:supermario1990/supermario1990.github.io.git
  branch: main
```

**生效时间**：推送后 GitHub Pages 一般 **1 分钟内**重建完成。

**查看构建状态**：

- 仓库 → **Settings → Pages**，顶部会显示 “Your site is live at …” 或最近一次部署的提交与状态；
- 仓库 → **Actions** 或 **Deployments** 列表里的 `pages-build-deployment`；
- 命令行（有 token 时）：`curl -H "Authorization: Bearer $TOKEN" https://api.github.com/repos/supermario1990/supermario1990.github.io/pages`，看 `status` 是否为 `built`。

## 7. 仓库分支结构

| 分支 | 内容 | 谁来改 |
| --- | --- | --- |
| `hexo` | `source/`、`_config.yml`、`_config.fluid.yml`、`package.json`、`README.md` | 你（手动 / 编辑器） |
| `main` | `index.html`、`articles/`、`css/`、`js/`、`assets/` 等构建产物 | `hexo deploy`（自动，force push） |

- 写作请始终 `git clone -b hexo`，不要在 `main` 上写文章。
- `node_modules/`、`public/`、`.deploy_git/`、`db.json` 已在 `.gitignore` 中忽略，不要提交。
- 源码分支的日常流程：`git add -A && git commit -m "…" && git push origin hexo`（不影响线上），要上线再 `npm run deploy`。

## 8. 评论（giscus）

评论基于 GitHub Discussions，由 Fluid 主题内置支持，配置在 **`_config.fluid.yml`**：

```yaml
post:
  comments:
    enable: true
    type: giscus

giscus:
  repo: supermario1990/supermario1990.github.io
  repo-id: R_kgDOVwIH1g
  category: Comments
  category-id: DIC_kwDOVwIH1s4DLPt3
  mapping: pathname
  reactions-enabled: 1
  emit-metadata: 0
  input-position: top
  lang: zh-CN
```

换仓库或换分类时要改的地方：

| 场景 | 要改的字段 |
| --- | --- |
| 换仓库 | `giscus.repo` 与 `giscus.repo-id` |
| 换讨论分类 | `giscus.category` 与 `giscus.category-id` |
| 换文章与讨论的匹配方式 | `giscus.mapping`（`pathname` / `url` / `title` / `og:title` / 手动 `specific`） |

两个 ID 的获取方式：

- `repo-id`：仓库的 node_id，`curl -H "Authorization: Bearer $TOKEN" https://api.github.com/repos/<owner>/<repo>` 里的 `node_id`；
- `category-id`：打开 <https://giscus.app>，填入仓库并选好分类，页面底部生成的脚本里 `data-category-id` 就是。

前置条件（缺一评论就不显示）：仓库 **Settings → Features → Discussions 已开启**；**giscus GitHub App 已安装到该仓库**；分类类型建议 `Announcements`（只有维护者能建帖，giscus 要求如此）。

## 9. 常见问题

**改完推送了，线上没变化**

1. `git status` 确认改动真的 commit 并 push 到 `hexo` 分支了（推 `hexo` 本身不上线）；
2. 确认执行过 `npm run deploy`，且终端末尾出现 `Deploy done: git`；
3. 看 Settings → Pages 的构建状态，`.deploy_git` 里 `git log` 能看到最新一次 `Site updated:` 提交；
4. 浏览器强制刷新（Cmd+Shift+R）或访问 `https://supermario1990.github.io/?v=2` 绕过 CDN 缓存；
5. 只改了文章但首页没更新：`npm run clean && npm run deploy`，清掉 `db.json` 旧缓存。

**新文章没出现在首页**

- 文件是否在 `source/_posts/`、扩展名是否 `.md`；
- front matter 是否被 YAML 语法搞坏（`title` 带冒号没加引号最常见），`hexo generate` 会报 warning；
- `date` 是否写成了明显错误的格式。

**图片 404**

- 引用是否以 `/` 开头（`/assets/diagrams/fig-01.svg`）；
- 文件是否真的在 `source/assets/diagrams/` 下、大小写是否一致；
- 部署后可直接访问 `https://supermario1990.github.io/assets/diagrams/fig-01.svg` 验证。

**评论区空白 / 只有“评论还没有启用”**

- `_config.fluid.yml` 里 `post.comments.enable: true`、`type: giscus`；
- `repo-id`、`category-id` 是否与当前仓库、分类一致；
- 仓库 Discussions 是否开启、giscus App 是否已安装；
- 浏览器控制台若出现 `Discussion not found`，是首条评论前的正常提示，发一条评论就会自动建帖；
- 本地用 `file://` 打开页面时 giscus 不会加载，必须走 `npm run server`。

**执行 hexo 命令只输出 init/help/version**

`package.json` 缺 `"hexo": { "version": "…" }` 字段，或 hexo 版本装成了 8.x。执行 `npm install hexo@7.3.0` 并确认字段存在。

**部署时报权限错误**

`ssh -T git@github.com` 检查 SSH key；远程地址应为 `git@github.com:supermario1990/supermario1990.github.io.git`（`git remote -v` 查看）。

## 10. 目录结构

```
_config.yml            站点配置（permalink、deploy 目标等）
_config.fluid.yml      Fluid 主题覆盖配置（目录、评论等）
package.json           依赖与 npm 脚本；不要删 hexo 字段
scripts/nojekyll.js    构建后写 public/.nojekyll
source/_posts/*.md     文章源文件
source/assets/         图片与 SVG 图示
source/css/custom.css  窄屏排版加固
source/js/mobile-toc.js 手机端折叠目录
public/                构建产物（忽略，不提交）
themes/                不使用（主题由 npm 安装）
```
