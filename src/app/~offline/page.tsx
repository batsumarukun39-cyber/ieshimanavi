export default function OfflinePage() {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>オフライン — 家島ナビ</title>
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
          body{min-height:100dvh;display:flex;align-items:center;justify-content:center;
               background:#f8fafc;font-family:sans-serif;color:#1e293b}
          .card{text-align:center;padding:2rem 2.5rem;background:#fff;border-radius:1rem;
                box-shadow:0 2px 16px rgba(0,0,0,.08);max-width:340px;width:90%}
          .icon{font-size:3rem;margin-bottom:1rem}
          h1{font-size:1.25rem;margin-bottom:.5rem}
          p{font-size:.9rem;color:#64748b;margin-bottom:1.5rem;line-height:1.6}
          .btns{display:flex;flex-direction:column;gap:.75rem}
          a{display:block;padding:.75rem 1.5rem;background:#1d4ed8;color:#fff;
            border-radius:.5rem;font-size:1rem;text-decoration:none;min-height:44px;
            display:flex;align-items:center;justify-content:center}
          a:hover{background:#1e40af}
          a.sec{background:#e2e8f0;color:#1e293b}
          a.sec:hover{background:#cbd5e1}
        `}</style>
      </head>
      <body>
        <div className="card">
          <div className="icon">📡</div>
          <h1>オフラインです</h1>
          <p>
            インターネットに接続できません。<br />
            一度アクセスしたページや地図は<br />
            引き続きご覧いただけます。
          </p>
          <div className="btns">
            <a href="/ja">ホームへ戻る</a>
            <a href="javascript:location.reload()" className="sec">再読み込み</a>
          </div>
        </div>
      </body>
    </html>
  );
}
