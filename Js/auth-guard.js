// Auth Guard 
// requirement ni admin toh 
// pag admin gumagamit true / pag user lang pop up 
// ilagay kada modules

function getCurrentUser() {
    return JSON.parse(sessionStorage.getItem("currentUser"));
}

function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === "Admin";
}

function requireAdmin(actionName = "this action") {
    if (isAdmin()) return true;

    showNotAuthorized(actionName);
    return false;
}

function showNotAuthorized(actionName = "this action") {

    const existing = document.querySelector(".auth-popup-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.className = "auth-popup-overlay";
    overlay.innerHTML = `
        <div class="auth-popup">
            <div class="auth-popup-icon">
                <i class="fa-solid fa-lock"></i>
            </div>
            <h2>Not Authorized</h2>
            <p>You don't have permission to perform <strong>${actionName}</strong>.</p>
            <p class="auth-popup-sub">Only <strong>Admin</strong> users can perform this action. Please contact your administrator.</p>
            <button class="auth-popup-btn" onclick="document.querySelector('.auth-popup-overlay').remove()">Got it</button>
        </div>
    `;
    document.body.appendChild(overlay);

    // close button
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.remove();
    });
}

// styles ng modal

const authStyles = document.createElement("style");
authStyles.textContent = `
    .auth-popup-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.15s ease;
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
    }
    .auth-popup {
        background: #fff;
        border-radius: 16px;
        padding: 2.5rem 2rem;
        width: 380px;
        max-width: 95vw;
        text-align: center;
        box-shadow: 0 12px 40px rgba(0,0,0,0.2);
        animation: slideUp 0.2s ease;
    }
    @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to   { transform: translateY(0);    opacity: 1; }
    }
    .auth-popup-icon {
        width: 64px;
        height: 64px;
        background: #fff5f5;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.2rem;
    }
    .auth-popup-icon i {
        font-size: 1.8rem;
        color: #e53e3e;
    }
    .auth-popup h2 {
        font-size: 1.25rem;
        color: #1a202c;
        margin: 0 0 0.5rem;
    }
    .auth-popup p {
        font-size: 0.9rem;
        color: #555;
        margin: 0 0 0.4rem;
        line-height: 1.5;
    }
    .auth-popup-sub {
        font-size: 0.82rem !important;
        color: #888 !important;
        margin-bottom: 1.5rem !important;
    }
    .auth-popup-btn {
        background: #e53e3e;
        color: #fff;
        border: none;
        border-radius: 8px;
        padding: 0.6rem 2rem;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
    }
    .auth-popup-btn:hover { background: #c53030; }
`;
document.head.appendChild(authStyles);