# movie-recommendation — Claude Code 项目指令

## 项目概述

电影推荐应用（React 19 + Vite 8 + TypeScript 5.7），对接 TMDB API，包含今日推荐、电影详情、我的片单三个页面。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 19（函数组件 + Hooks） |
| 构建 | Vite 8（`@vitejs/plugin-react` + `@tailwindcss/vite`） |
| 语言 | TypeScript 5.7（strict 模式） |
| 路由 | react-router-dom v7（BrowserRouter） |
| 样式 | **CSS Modules（`*.module.css`）**，辅以 Tailwind CSS 4 |
| API | TMDB API（`api.themoviedb.org/3`），中文语言 |

## 目录结构约定

```
src/
  types/movie.ts          # 共享类型：WatchStatus, Movie, Quote
  api/tmdb.ts             # TMDB API 封装（fetch + 数据映射）
  utils/date.ts           # 日期工具
  utils/movie.ts          # 电影工具（图片URL、每日推荐、每日台词）
  components/             # 可复用组件（每个文件 export default function）
  pages/                  # 页面级组件（接收 props，不含路由逻辑）
  App.tsx                 # 根组件：全局状态 + 数据获取 + 路由编排 (~130行)
```

## 代码风格约定

### 组件
- **所有组件使用 `export default function`**，不使用箭头函数导出
- 组件 props 类型写在参数解构后面的 `{}` 内联，不单独定义 interface（示例见下方）
- 状态管理在 App.tsx 中集中处理，通过 props 向下传递（无 Context/Redux）
- 子组件通过回调（`onToggle`、`onClick`）向上通知 App

```tsx
// props 内联类型示例
export default function MovieCard({
  movie,
  status,
  onToggle,
  onClick
}: {
  movie: Movie
  status: WatchStatus
  onToggle: (id: number, t: Exclude<WatchStatus, 'none'>) => void
  onClick: () => void
}) { ... }
```

### 样式
- **使用 CSS Modules（`*.module.css`）**，每个组件同级放一个同名 `.module.css` 文件
- 全局 CSS 变量定义在 `src/index.css` 的 `:root` 中
- 动态样式用条件 className 切换（如 `` className={`${styles.btn} ${active ? styles.active : ''}`} ``）
- hover 效果用 CSS `:hover` 伪类，不用 `onMouseEnter`/`onMouseLeave`
- 颜色体系：背景 `#0a0a0c` / `#111113`，文字 `#f0ece3` / `#ede8df`，金色 `#c9a86c`
- CSS 变量：`--bg-primary`、`--bg-secondary`、`--text-primary`、`--accent`、`--font-heading`、`--font-body` 等
- 字体：标题 `'Playfair Display', serif`，正文 `'DM Sans', system-ui, sans-serif`
- 滚动容器加 `className="hide-scrollbar"` 隐藏滚动条
- 允许搭配 Tailwind 原子类

### TypeScript
- `moduleResolution: "bundler"`，路径别名 `@/*` → `./src/*`
- 类型定义集中在 `src/types/movie.ts`
- `WatchStatus = 'none' | 'want' | 'watched'`
- 向子组件传递 status 时：单个电影用 `status[movie.id] ?? 'none'`（结果是 `WatchStatus`），批量用 `Record<number, WatchStatus>`

## 路由结构

| 路径 | 页面 | 组件 |
|------|------|------|
| `/` | 今日推荐 | `TodayPage` |
| `/movie/:id` | 电影详情 | `MovieDetailRoute` → `MovieDetail` |
| `/mylist` | 我的片单 | `MyListPage` |

## 数据流

```
App.tsx (useState × 9, useEffect × 3, useMemo × 4)
  ├─ TodayPage (dailyPicks, trendingMovies, genreList, status, callbacks)
  │    ├─ FeaturedCard (单个 Movie + WatchStatus)
  │    ├─ MovieCard × N
  │    └─ TrendingSection (Movie[] + Record<number, WatchStatus>)
  ├─ MyListPage (wantList, watchedList, myFilter, callbacks)
  │    └─ MyListItem × N
  └─ MovieDetailRoute (allMovies, detailCache)
       └─ MovieDetail (单个 Movie + similar movies)
```

## 注意事项
- TMDB API Key 硬编码在 `src/api/tmdb.ts` 中（仅用于开发学习）
- 每日推荐使用基于日期的 PRNG 种子，同一批电影内确定性选取
- `detailCache` 缓存已获取的详情数据，避免重复请求
- 每个组件的样式写在对应的 `*.module.css` 文件中，全局样式放在 `src/index.css`
- 修改 App.tsx 时注意保持 ~150 行以内的体量，复杂逻辑下沉到子组件
