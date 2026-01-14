// Initialize Supabase with YOUR credentials
        const supabaseUrl = 'https://dvptsrzfbmrbexcwhkqe.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2cHRzcnpmYm1yYmV4Y3doa3FlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxOTg0NTUsImV4cCI6MjA4Mzc3NDQ1NX0.vsimT5xjZ9i_hgqExebBUaHUbGCC9zstak__tly4u4Y';
        
        // Log credentials for debugging
        console.log('Supabase URL:', supabaseUrl);
        console.log('Supabase Key (first 20 chars):', supabaseKey.substring(0, 20) + '...');
        
        const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        
        // DOM Elements
        const alertEl = document.getElementById('alert');
        const emailForm = document.getElementById('emailForm');
        
        // Show alert message
        function showAlert(message, type = 'error') {
            alertEl.textContent = message;
            alertEl.className = `alert alert-${type}`;
            alertEl.style.display = 'block';
            
            // Auto-hide success messages after 5 seconds
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
        
        // Check if user is already logged in
        async function checkSession() {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error) {
                    console.error('Session check error:', error);
                    return;
                }
                
                if (session) {
                    console.log('User already logged in:', session.user.email);
                    showAlert(`Welcome back, ${session.user.email}! Redirecting to dashboard...`, 'success');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 2000);
                }
            } catch (error) {
                console.error('Session check failed:', error);
            }
        }
        
        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            checkSession();
            
            // Handle Google Login
            document.getElementById('googleLogin').addEventListener('click', handleGoogleLogin);
            
            // Handle GitHub Login
            document.getElementById('githubLogin').addEventListener('click', handleGitHubLogin);
            
            // Handle Email/Password Login
            emailForm.addEventListener('submit', handleEmailLogin);
            
            // Check URL parameters for messages
            checkUrlParams();
        });
        
        // Check URL parameters for error/success messages
        function checkUrlParams() {
            const urlParams = new URLSearchParams(window.location.search);
            
            if (urlParams.has('error')) {
                showAlert(decodeURIComponent(urlParams.get('error')), 'error');
            }
            
            if (urlParams.has('success')) {
                showAlert(decodeURIComponent(urlParams.get('success')), 'success');
            }
            
            if (urlParams.has('registered')) {
                showAlert('Registration successful! You can now log in.', 'success');
            }
        }
        
        // Handle Google Login
        async function handleGoogleLogin() {
            hideAlert();
            console.log('Google login clicked');
            
            try {
                const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: window.location.origin + '/dashboard.html',
                        queryParams: {
                            access_type: 'offline',
                            prompt: 'consent'
                        }
                    }
                });
                
                if (error) {
                    console.error('Google login error:', error);
                    showAlert('Google login failed: ' + error.message);
                } else {
                    console.log('Google login initiated');
                }
            } catch (error) {
                console.error('Google login exception:', error);
                showAlert('Google login failed. Please try again.');
            }
        }
        
        // Handle GitHub Login
        async function handleGitHubLogin() {
            hideAlert();
            console.log('GitHub login clicked');
            
            try {
                const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'github',
                    options: {
                        redirectTo: window.location.origin + '/dashboard.html',
                        scopes: 'read:user user:email'
                    }
                });
                
                if (error) {
                    console.error('GitHub login error:', error);
                    showAlert('GitHub login failed: ' + error.message);
                } else {
                    console.log('GitHub login initiated');
                }
            } catch (error) {
                console.error('GitHub login exception:', error);
                showAlert('GitHub login failed. Please try again.');
            }
        }
        
        // Handle Email/Password Login
        async function handleEmailLogin(e) {
            e.preventDefault();
            hideAlert();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember').checked;
            
            // Validate inputs
            if (!email || !password) {
                showAlert('Please enter both email and password');
                return;
            }
            
            console.log('Email login attempt:', email);
            
            // Show loading state
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
                    console.error('Email login error:', error);
                    
                    // Specific error handling
                    if (error.message.includes('Invalid login credentials')) {
                        showAlert('Invalid email or password. Please try again.');
                    } else if (error.message.includes('Email not confirmed')) {
                        showAlert('Please verify your email address before logging in.');
                    } else {
                        showAlert('Login failed: ' + error.message);
                    }
                } else {
                    console.log('Login successful:', data.user.email);
                    showAlert('Login successful! Redirecting...', 'success');
                    
                    // Save session if "Remember me" is checked
                    if (rememberMe) {
                        localStorage.setItem('rememberedEmail', email);
                    } else {
                        localStorage.removeItem('rememberedEmail');
                    }
                    
                    // Redirect to dashboard
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                }
            } catch (error) {
                console.error('Login exception:', error);
                showAlert('An unexpected error occurred. Please try again.');
            } finally {
                // Reset button state
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        }
        
        // Listen for auth state changes
        supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event);
            
            if (event === 'SIGNED_IN' && session) {
                console.log('User signed in:', session.user);
                checkAndCreateProfile(session.user);
            }
        });
        
        // Function to ensure user has a profile
        async function checkAndCreateProfile(user) {
            try {
                const { data: profile, error } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                
                if (error || !profile) {
                    // Create profile if doesn't exist
                    const userEmail = user.email || 'student@imptechacademy.com';
                    const userName = user.user_metadata?.full_name || 
                                    user.user_metadata?.name || 
                                    userEmail.split('@')[0];
                    
                    const { error: insertError } = await supabase
                        .from('user_profiles')
                        .insert([
                            {
                                id: user.id,
                                full_name: userName,
                                email: userEmail,
                                role: 'student',
                                created_at: new Date().toISOString()
                            }
                        ]);
                    
                    if (insertError) {
                        console.error('Error creating profile:', insertError);
                    } else {
                        console.log('Profile created successfully for:', userName);
                    }
                }
            } catch (error) {
                console.error('Profile check failed:', error);
            }
        }
        
        // Load remembered email if exists
        window.addEventListener('load', function() {
            const rememberedEmail = localStorage.getItem('rememberedEmail');
            if (rememberedEmail) {
                document.getElementById('email').value = rememberedEmail;
                document.getElementById('remember').checked = true;
            }
        });
        
        // Add Enter key support
        document.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
                const form = e.target.closest('form');
                if (form) {
                    form.dispatchEvent(new Event('submit'));
                }
            }
        });
