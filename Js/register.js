// Initialize Supabase with YOUR credentials
        const supabaseUrl = 'https://dvptsrzfbmrbexcwhkqe.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2cHRzcnpmYm1yYmV4Y3doa3FlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxOTg0NTUsImV4cCI6MjA4Mzc3NDQ1NX0.vsimT5xjZ9i_hgqExebBUaHUbGCC9zstak__tly4u4Y';
        const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        
        // DOM Elements
        const alertEl = document.getElementById('alert');
        const strengthBar = document.getElementById('strengthBar');
        const passwordMatch = document.getElementById('passwordMatch');
        
        // Show alert message
        function showAlert(message, type = 'error') {
            alertEl.textContent = message;
            alertEl.className = `alert alert-${type}`;
            alertEl.style.display = 'block';
            
            // Auto-hide success messages
            if (type === 'success') {
                setTimeout(() => {
                    alertEl.style.display = 'none';
                }, 5000);
            }
        }
        
        // Hide alert message
        function hideAlert() {
            alertEl.style.display = 'none';
        }
        
        // Check password strength
        function checkPasswordStrength(password) {
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
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (confirmPassword.length === 0) {
                passwordMatch.textContent = '';
                return false;
            }
            
            if (password === confirmPassword) {
                passwordMatch.textContent = '✓ Passwords match';
                passwordMatch.style.color = '#06d6a0';
                return true;
            } else {
                passwordMatch.textContent = '✗ Passwords do not match';
                passwordMatch.style.color = '#ef476f';
                return false;
            }
        }
        
        // Validate form inputs
        function validateForm() {
            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const terms = document.getElementById('terms').checked;
            
            // Check required fields
            if (!fullName) {
                showAlert('Please enter your full name');
                return false;
            }
            
            if (!email) {
                showAlert('Please enter your email address');
                return false;
            }
            
            // Basic email validation
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
        document.getElementById('googleRegister').addEventListener('click', async () => {
            hideAlert();
            
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/complete-profile.html',
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent'
                    }
                }
            });
            
            if (error) {
                console.error('Google registration error:', error.message);
                showAlert('Google registration failed: ' + error.message);
            }
        });
        
        // Handle GitHub Registration
        document.getElementById('githubRegister').addEventListener('click', async () => {
            hideAlert();
            
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: window.location.origin + '/complete-profile.html',
                    scopes: 'read:user user:email'
                }
            });
            
            if (error) {
                console.error('GitHub registration error:', error.message);
                showAlert('GitHub registration failed: ' + error.message);
            }
        });
        
        // Handle Email/Password Registration
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            hideAlert();
            
            // Validate form
            if (!validateForm()) {
                return;
            }
            
            // Get form values
            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const phone = document.getElementById('phone').value.trim();
            const newsletter = document.getElementById('newsletter').checked;
            
            // Show loading state
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
                
                if (authError) {
                    throw authError;
                }
                
                // 2. Create user profile in database (if sign up successful)
                if (authData.user) {
                    const { error: profileError } = await supabase
                        .from('user_profiles')
                        .insert([
                            {
                                id: authData.user.id,
                                full_name: fullName,
                                email: email,
                                phone: phone || null,
                                role: 'student',
                                newsletter_opt_in: newsletter,
                                created_at: new Date().toISOString()
                            }
                        ]);
                    
                    if (profileError) {
                        console.error('Profile creation error:', profileError);
                        // Continue anyway - we can retry later
                    }
                }
                
                // 3. Show success message
                showAlert('Registration successful! Please check your email to verify your account.', 'success');
                
                // 4. Reset form
                document.getElementById('registerForm').reset();
                strengthBar.className = 'strength-bar';
                passwordMatch.textContent = '';
                
                // 5. Redirect to login after 3 seconds
                setTimeout(() => {
                    window.location.href = 'login.html?registered=true';
                }, 3000);
                
            } catch (error) {
                console.error('Registration error:', error.message);
                showAlert('Registration failed: ' + error.message);
            } finally {
                // Reset button state
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
        
        // Real-time password strength checking
        document.getElementById('password').addEventListener('input', function(e) {
            const strength = checkPasswordStrength(e.target.value);
            console.log('Password strength:', strength + '%');
        });
        
        // Real-time password match checking
        document.getElementById('confirmPassword').addEventListener('input', checkPasswordMatch);
        
        // Auto-format phone number (optional)
        document.getElementById('phone').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.startsWith('0')) {
                value = '+234' + value.substring(1);
            }
            e.target.value = value.replace(/(\d{4})(\d{3})(\d{3})(\d{4})?/, '+$1 $2 $3 $4').trim();
        });
        
        // Check URL for registration success message
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('registered')) {
            showAlert('Registration successful! You can now log in with your credentials.', 'success');
        }
        