/**
 * 冒烟测试站点清单：用户量大、无需登录即可看到主要内容的页面。
 * 优先覆盖自带深色模式的站点（插件真正会改写的地方）和曾出过问题的站点。
 * 被 Cloudflare 等挑战页拦截的站点会因基线文本过少被判为“无法判断”，不会误报。
 */
export const SITES: string[] = [
  // 开发者与文档
  'https://github.com/microsoft/vscode',
  'https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme',
  'https://stackoverflow.com/questions',
  'https://react.dev/',
  'https://nextjs.org/docs',
  'https://tailwindcss.com/docs/installation',
  'https://vuejs.org/guide/introduction.html',
  'https://svelte.dev/docs',
  'https://docs.astro.build/en/getting-started/',
  'https://www.typescriptlang.org/docs/',
  'https://docs.python.org/3/',
  'https://go.dev/doc/',
  'https://doc.rust-lang.org/book/',
  'https://www.npmjs.com/package/react',
  'https://learn.microsoft.com/en-us/docs/',
  'https://developers.cloudflare.com/workers/',
  'https://vercel.com/docs',
  'https://supabase.com/docs',
  'https://docs.docker.com/',
  'https://kubernetes.io/docs/home/',
  'https://gitlab.com/explore',
  'https://dev.to/',
  'https://news.ycombinator.com/',
  'https://opencode.ai/docs',
  // 产品与 SaaS
  'https://linear.app/',
  'https://www.notion.com/',
  'https://www.figma.com/',
  'https://discord.com/',
  'https://slack.com/',
  'https://www.raycast.com/',
  'https://zed.dev/',
  'https://obsidian.md/',
  'https://excalidraw.com/',
  'https://dashboard.stripe.com/login',
  // 内容与媒体
  'https://en.wikipedia.org/wiki/Light-on-dark_color_scheme',
  'https://www.youtube.com/',
  'https://www.reddit.com/r/programming/',
  'https://medium.com/',
  'https://music.apple.com/us/new',
  'https://www.twitch.tv/',
  'https://www.crunchyroll.com/',
  'https://www.bbc.com/news',
  'https://duckduckgo.com/',
  'https://www.apple.com/',
];
