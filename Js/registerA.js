document.addEventListener('DOMContentLoaded', function() {
    const supabase = window.supabaseClient;
    
    if (!supabase) {
        console.error('Supabase client not found.');
        return;
    }
    
    // Check if we are on the registration page
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;
    
    // DOM Elements
    const alertEl = document.getElementById('alert');
    const strengthBar = document.getElementById('strengthBar');
    const passwordMatchEl = document.getElementById('passwordMatch');
    
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
    
    // Check password strength
    function checkPasswordStrength(password) {
        if (!strengthBar) return 0;
        
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (password.length >= 12) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;
        
        strength = Math.min(strength, 100);
        
        // Update strength bar
        strengthBar.className = 'strength-bar';
        if (strength <= 25) {
            strengthBar.classList.add('weak');
        } else if (strength <= 50) {
            strengthBar.classList.add('fair');
        } else if (strength <= 75) {
            strengthBar.classList.add('good');
        } else {
            strengthBar.classList.add('strong');
        }
        
        return strength;
    }
    
    // Check if passwords match
    function checkPasswordMatch() {
        if (!passwordMatchEl) return false;
        
        const password = document.getElementById('password')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;
        
        if (confirmPassword.length === 0) {
            passwordMatchEl.textContent = '';
            return false;
        }
        
        if (password === confirmPassword) {
            passwordMatchEl.textContent = '✓ Passwords match';
            passwordMatchEl.style.color = '#06d6a0';
            return true;
        } else {
            passwordMatchEl.textContent = '✗ Passwords do not match';
            passwordMatchEl.style.color = '#ef476f';
            return false;
        }
    }
    
    // Validate form
    function validateForm() {
        const fullName = document.getElementById('fullName')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const password = document.getElementById('password')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;
        const terms = document.getElementById('terms')?.checked;
        
        if (!fullName) {
            showAlert('Please enter your full name');
            return false;
        }
        
        if (!email) {
            showAlert('Please enter your email address');
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showAlert('Please enter a valid email address');
            return false;
        }
        
        if (password.length < 8) {
            showAlert('Password must be at least 8 characters long');
            return false;
        }
        
        if (!checkPasswordMatch()) {
            showAlert('Passwords do not match');
            return false;
        }
        
        if (!terms) {
            showAlert('You must agree to the Terms of Service and Privacy Policy');
            return false;
        }
        
        return true;
    }
    
    // Handle Google Registration
    const googleRegisterBtn = document.getElementById('googleRegister');
    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener('click', async () => {
            hideAlert();
            
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/dashboard.html'
                }
            });
            
            if (error) {
                console.error('Google registration error:', error);
                showAlert('Google registration failed: ' + error.message);
            }
        });
    }
    
    // Handle GitHub Registration
    const githubRegisterBtn = document.getElementById('githubRegister');
    if (githubRegisterBtn) {
        githubRegisterBtn.addEventListener('click', async () => {
            hideAlert();
            
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: window.location.origin + '/dashboard.html',
                    scopes: 'read:user user:email'
                }
            });
            
            if (error) {
                console.error('GitHub registration error:', error);
                showAlert('GitHub registration failed: ' + error.message);
            }
        });
    }
    
    // Handle Email/Password Registration
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert();
        
        if (!validateForm()) return;
        
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const phone = document.getElementById('phone').value.trim();
        const newsletter = document.getElementById('newsletter').checked;
        
        // Show loading
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        submitBtn.disabled = true;
        
        try {
            // 1. Register user with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName,
                        phone: phone,
                        newsletter_opt_in: newsletter
                    }
                }
            });
            
            if (authError) throw authError;
            
            // 2. Create user profile in database
            if (authData.user) {
                const { error: profileError } = await supabase
                    .from('user_profiles')
                    .insert([
                        {
                            id: authData.user.id,
                            full_name: fullName,
                            email: email,
                            phone: phone || null,
                            newsletter_opt_in: newsletter,
                            role: 'student'
                        }
                    ]);
                
                if (profileError) {
                    console.error('Profile creation error:', profileError);
                }
            }
            
            // 3. Show success message
            showAlert('Registration successful! Please check your email to verify your account.', 'success');
            
            // 4. Reset form
            registerForm.reset();
            if (strengthBar) strengthBar.className = 'strength-bar';
            if (passwordMatchEl) passwordMatchEl.textContent = '';
            
            // 5. Redirect to login after 3 seconds
            setTimeout(() => {
                window.location.href = 'login.html?registered=true';
            }, 3000);
            
        } catch (error) {
            console.error('Registration error:', error);
            showAlert('Registration failed: ' + error.message);
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
    
    // Real-time password strength checking
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function(e) {
            checkPasswordStrength(e.target.value);
        });
    }
    
    // Real-time password match checking
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    }
    
    // Check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            window.location.href = 'dashboard.html';
        }
    });
});
