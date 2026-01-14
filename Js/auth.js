// Js/auth.js
// Shared authentication functions

// Wait for supabase to be available
function getSupabaseClient() {
    return window.supabaseClient;
}

// Show alert message
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
    
    // Length check
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    // Cap at 100
    strength = Math.min(strength, 100);
    
    // Return strength level
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
    
    // Remove all non-digits
    let cleaned = phone.replace(/\D/g, '');
    
    // If starts with 0, convert to +234
    if (cleaned.startsWith('0')) {
        cleaned = '234' + cleaned.substring(1);
    }
    
    // If starts with 234, add +
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

// Export functions for use in other files
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
