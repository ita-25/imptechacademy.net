document.addEventListener('DOMContentLoaded', function() {
    const supabase = window.supabaseClient;
    
    if (!supabase) {
        console.error('Supabase client not found.');
        return;
    }
    
    // Check if we are on the login page
    const loginForm = document.getElementById('emailForm');
    if (!loginForm) return;
    
    // DOM Elements
    const alertEl = document.getElementById('alert');
    
    // Show alert message
    function showAlert(message, type = 'error') {
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
    function hideAlert() {
        if (alertEl) alertEl.style.display = 'none';
    }
    
    // Handle Google Login
    const googleLoginBtn = document.getElementById('googleLogin');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            hideAlert();
            
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/dashboard.html'
                }
            });
            
            if (error) {
                console.error('Google login error:', error);
                showAlert('Google login failed: ' + error.message);
            }
        });
    }
    
    // Handle GitHub Login
    const githubLoginBtn = document.getElementById('githubLogin');
    if (githubLoginBtn) {
        githubLoginBtn.addEventListener('click', async () => {
            hideAlert();
            
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: window.location.origin + '/dashboard.html',
                    scopes: 'read:user user:email'
                }
            });
            
            if (error) {
                console.error('GitHub login error:', error);
                showAlert('GitHub login failed: ' + error.message);
            }
        });
    }
    
    // Handle Email/Password Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember')?.checked;
        
        if (!email || !password) {
            showAlert('Please enter both email and password');
            return;
        }
        
        // Show loading
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
        submitBtn.disabled = true;
        
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    showAlert('Invalid email or password. Please try again.');
                } else if (error.message.includes('Email not confirmed')) {
                    showAlert('Please verify your email address before logging in.');
                } else {
                    showAlert('Login failed: ' + error.message);
                }
            } else {
                showAlert('Login successful! Redirecting...', 'success');
                
                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            }
        } catch (error) {
            console.error('Login error:', error);
            showAlert('An unexpected error occurred. Please try again.');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
    
    // Check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            window.location.href = 'dashboard.html';
        }
    });
    
    // Load remembered email
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.value = rememberedEmail;
            document.getElementById('remember').checked = true;
        }
    }
});
