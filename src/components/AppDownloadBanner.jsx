import { useState, useEffect } from 'react';

export default function AppDownloadBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('app_download_banner_dismissed');
    if (dismissed) return;

    const path = window.location.pathname;
    if (path === '/app' || path.startsWith('/oauth/') || path.startsWith('/auth/')) return;

    setShow(true);
  }, []);

  if (!show) return null;

  const dismiss = () => {
    sessionStorage.setItem('app_download_banner_dismissed', '1');
    setShow(false);
  };

  return (
    <div className="app-download-banner">
      <div className="app-download-banner-icon">
        <i className="fa-brands fa-android" />
      </div>
      <span className="app-download-banner-text">下载 ABDL Space App，体验更佳</span>
      <div className="app-download-banner-actions">
        <a href="/app" className="app-download-banner-link">
          下载 <i className="fa-solid fa-arrow-down" />
        </a>
        <button className="app-download-banner-close" onClick={dismiss}>
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
    </div>
  );
}
