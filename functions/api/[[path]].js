/**
 * EdgeOne Pages Edge Function — TMDB API 代理
 *
 * 拦截所有 /api/* 请求，转发到 TMDB API，在服务端注入 API Key。
 * 前端请求：/api/movie/popular?language=zh-CN
 * 实际请求：https://api.themoviedb.org/3/movie/popular?language=zh-CN&api_key=XXX
 *
 * 环境变量（在 EdgeOne 控制台 → 项目设置中配置）：
 *   TMDB_API_KEY — TMDB API v3 密钥
 */

export async function onRequest(context) {
  const { request, env, params } = context;

  // 只处理 GET 请求（TMDB API 全部为 GET）
  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const url = new URL(request.url);

    // [[path]] 捕获多级路径段，可能是字符串或数组
    const tmdbPath = Array.isArray(params.path)
      ? params.path.join('/')
      : params.path;

    if (!tmdbPath) {
      return new Response(JSON.stringify({ error: 'Missing API path' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 检查环境变量是否已配置
    if (!env.TMDB_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'TMDB_API_KEY not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // 继承前端传来的查询参数，追加 api_key
    const searchParams = new URLSearchParams(url.search);
    searchParams.set('api_key', env.TMDB_API_KEY);

    const tmdbUrl = `https://api.themoviedb.org/3/${tmdbPath}?${searchParams.toString()}`;

    const tmdbRes = await fetch(tmdbUrl, {
      headers: { Accept: 'application/json' },
    });

    // 读取 TMDB 响应体，手动构建 Response（避免克隆不可序列化的响应头）
    const data = await tmdbRes.json();
    return new Response(JSON.stringify(data), {
      status: tmdbRes.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Proxy error', message: err.message }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
