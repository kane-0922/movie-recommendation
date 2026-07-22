**在线地址**：https://reel-movie.chaukane2004.workers.dev （注意：国内访问可能需要科学上网）

# REEL · 每日好片

电影推荐应用 — 基于 TMDB API 的精选电影发现平台，支持每日推荐、分类筛选和我的片单管理。

## 功能

- **今日推荐** — 基于日期的确定性随机算法，每天从 TMDB 高分影片中精选 5 部推荐，附带每日电影台词
- **筛选推荐** — 按 6 大类型（动作冒险、动画喜剧、科幻奇幻、纪录剧情、惊悚恐怖、爱情家庭）浏览高分电影
- **电影详情** — 查看完整信息：导演、时长、评分、简介，以及相似电影推荐
- **我的片单** — 标记「想看」和「看过」，数据持久化到本地存储
- **每日台词** — 内置 633 条华语电影经典台词，随机展示

## 技术栈

| 类别 | 技术                                       |
| ---- | ------------------------------------------ |
| 框架 | React 19                                   |
| 构建 | Vite 8                                     |
| 语言 | TypeScript 5.7                             |
| 路由 | react-router-dom v7                        |
| 样式 | CSS Modules + Tailwind CSS 4               |
| 数据 | TMDB API v3                                |
| 部署 | EdgeOne Pages（静态托管 + Edge Functions） |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 `http://localhost:5173`。

## 项目结构

```
src/
├── types/movie.ts            # 共享类型：Movie, WatchStatus, Quote
├── api/tmdb.ts               # TMDB API 封装（开发直连 / 生产走 Edge Functions 代理）
├── utils/date.ts             # 日期工具
├── utils/movie.ts            # 电影工具（图片 URL、每日推荐种子算法、每日台词）
├── data/quotes.json          # 633 条华语电影台词
├── components/               # 可复用组件
│   ├── MovieCard.tsx          # 电影卡片（海报 + 评分）
│   ├── MovieDetail.tsx        # 电影详情视图
│   ├── MovieDetailRoute.tsx   # 详情路由包装（缓存 + 数据获取）
│   ├── TrendingSection.tsx    # 横向滚动 Trending 列表
│   ├── ActionButtons.tsx      # 想看/看过切换按钮
│   ├── GenreTag.tsx           # 类型标签
│   ├── MyListItem.tsx         # 片单列表项
│   └── SimilarMovieRow.tsx    # 相似电影行
├── pages/
│   ├── TodayPage.tsx          # 今日推荐页
│   ├── FilterPage.tsx         # 筛选推荐页
│   └── MyListPage.tsx         # 我的片单页
├── App.tsx                    # 根组件（状态管理 + 路由编排）
├── App.module.css
├── main.tsx                   # 入口（BrowserRouter）
└── index.css                  # 全局样式 + CSS 变量 + 字体
```
