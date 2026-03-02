// Js/auth.js
// Shared authentication functions with "Coming Soon" modal for social logins

// Wait for supabase to be available
function getSupabaseClient() {
    return window.supabaseClient;
}

// Show alert message (original function kept for other uses)
function showAlert(elementId, message, type = 'error') {
    const alertEl = document.getElementById(elementId);
    if (!alertEl) return;
    
    alertEl.textContent = message;
    alertEl.className = `alert alert-${type}`;
    alertEl.style.display = 'block';
    
    if (type === 'success') {
        setTimeout(() => {
            alertEl.style.display = 'none';
        }, 5000);
    }
}

// Hide alert message
function hideAlert(elementId) {
    const alertEl = document.getElementById(elementId);
    if (alertEl) alertEl.style.display = 'none';
}

// Check if user is logged in
async function checkAuth() {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
    } catch (error) {
        console.error('Auth check failed:', error);
        return null;
    }
}

// Redirect if already logged in
async function redirectIfLoggedIn(targetPage = 'dashboard.html') {
    const session = await checkAuth();
    if (session) {
        window.location.href = targetPage;
        return true;
    }
    return false;
}

// Check password strength
function checkPasswordStrength(password) {
    if (!password) return 0;
    
    let strength = 0;
    
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    strength = Math.min(strength, 100);
    
    if (strength <= 25) return { score: strength, level: 'weak', color: '#ef476f' };
    if (strength <= 50) return { score: strength, level: 'fair', color: '#ffd166' };
    if (strength <= 75) return { score: strength, level: 'good', color: '#06d6a0' };
    return { score: strength, level: 'strong', color: '#118ab2' };
}

// Validate email format
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Format phone number (for Nigeria)
function formatPhoneNumber(phone) {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '234' + cleaned.substring(1);
    }
    if (cleaned.startsWith('234')) {
        cleaned = '+' + cleaned;
    }
    return cleaned;
}

// Set button loading state
function setButtonLoading(button, isLoading) {
    if (!button) return;
    
    if (isLoading) {
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        button.disabled = true;
    } else {
        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
        }
        button.disabled = false;
    }
}

// Check URL parameters for messages
function checkUrlMessages() {
    const urlParams = new URLSearchParams(window.location.search);
    const messages = {};
    
    if (urlParams.has('error')) {
        messages.error = decodeURIComponent(urlParams.get('error'));
    }
    if (urlParams.has('success')) {
        messages.success = decodeURIComponent(urlParams.get('success'));
    }
    if (urlParams.has('registered')) {
        messages.success = 'Registration successful! You can now log in.';
    }
    
    return messages;
}

// Create user profile after registration
async function createUserProfile(user, additionalData = {}) {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    
    const userEmail = user.email || 'student@imptechacademy.com';
    const userName = user.user_metadata?.full_name || 
                    user.user_metadata?.name || 
                    userEmail.split('@')[0];
    
    const profileData = {
        id: user.id,
        full_name: userName,
        email: userEmail,
        role: 'student',
        created_at: new Date().toISOString(),
        ...additionalData
    };
    
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .insert([profileData]);
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Profile creation failed:', error);
        return null;
    }
}

// ==============================================
// "Coming Soon" Modal for Social Login Buttons
// ==============================================

// Create and inject modal HTML if it doesn't exist
function createComingSoonModal() {
    // Check if modal already exists
    if (document.getElementById('comingSoonModal')) return;

    const modalHTML = `
        <div id="comingSoonModal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <i class="fas fa-rocket" style="font-size: 48px; color: #4f46e5; margin-bottom: 20px;"></i>
                <h2>Coming Soon!</h2>
                <p>Google and GitHub login are under development. They will be available shortly.</p>
                <p>In the meantime, please <strong>register with your email</strong> to get started.</p>
                <button class="modal-btn">Got it</button>
            </div>
        </div>
    `;

    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstChild);

    // Add modal styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .modal {
            display: none;
            position: fixed;
            z-index: 9999;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
            animation: fadeIn 0.3s;
        }
        .modal-content {
            background-color: #fff;
            margin: 15% auto;
            padding: 30px;
            border-radius: 16px;
            width: 90%;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            animation: slideDown 0.3s;
        }
        .close-modal {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
        }
        .close-modal:hover {
            color: #000;
        }
        .modal h2 {
            margin: 10px 0 15px;
            color: #1e293b;
            font-family: 'Poppins', sans-serif;
        }
        .modal p {
            color: #475569;
            line-height: 1.6;
            margin-bottom: 10px;
        }
        .modal-btn {
            background: #4f46e5;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 30px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 15px;
            transition: background 0.3s;
        }
        .modal-btn:hover {
            background: #4338ca;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideDown {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    // Add event listeners for close
    const modal = document.getElementById('comingSoonModal');
    const closeBtn = modal.querySelector('.close-modal');
    const gotItBtn = modal.querySelector('.modal-btn');

    function closeModal() {
        modal.style.display = 'none';
    }

    closeBtn.addEventListener('click', closeModal);
    gotItBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
}

// Show the modal
function showComingSoonModal() {
    const modal = document.getElementById('comingSoonModal');
    if (modal) {
        modal.style.display = 'block';
    } else {
        // If modal doesn't exist for some reason, create it on the fly
        createComingSoonModal();
        setTimeout(() => {
            document.getElementById('comingSoonModal').style.display = 'block';
        }, 100);
    }
}

// Attach click handlers to social login buttons
function setupSocialLoginModals() {
    // Create modal first
    createComingSoonModal();

    // Find all buttons/links that might be social login
    const elements = document.querySelectorAll('a, button, .btn, .social-btn');
    
    elements.forEach(el => {
        const text = el.innerText || el.textContent;
        // Check if it's Google or GitHub (case-insensitive)
        if (/google|github/i.test(text)) {
            // Remove any existing click listeners (optional, but we'll override)
            el.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                showComingSoonModal();
                return false;
            });
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSocialLoginModals);
} else {
    setupSocialLoginModals();
}

// Export helpers
if (typeof window !== 'undefined') {
    window.authHelpers = {
        getSupabaseClient,
        showAlert,
        hideAlert,
        checkAuth,
        redirectIfLoggedIn,
        checkPasswordStrength,
        isValidEmail,
        formatPhoneNumber,
        setButtonLoading,
        checkUrlMessages,
        createUserProfile
    };
}
