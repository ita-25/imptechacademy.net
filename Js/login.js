
        // Initialize Supabase with YOUR credentials
        const supabaseUrl = 'https://dvptsrzfbmrbexcwhkqe.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2cHRzcnpmYm1yYmV4Y3doa3FlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxOTg0NTUsImV4cCI6MjA4Mzc3NDQ1NX0.vsimT5xjZ9i_hgqExebBUaHUbGCC9zstak__tly4u4Y';
        const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        
        // DOM Elements
        const alertEl = document.getElementById('alert');
        
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
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                console.log('User already logged in:', session.user.email);
                // Show welcome back message
                showAlert(`Welcome back, ${session.user.email}! Redirecting to dashboard...`, 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            }
        });
        
        // Handle Google Login
        document.getElementById('googleLogin').addEventListener('click', async () => {
            hideAlert();
            
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
                console.error('Google login error:', error.message);
                showAlert('Google login failed: ' + error.message);
            }
        });
        
        // Handle GitHub Login (NEW!)
        document.getElementById('githubLogin').addEventListener('click', async () => {
            hideAlert();
            
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: window.location.origin + '/dashboard.html',
                    scopes: 'read:user user:email' // Request GitHub scopes
                }
            });
            
            if (error) {
                console.error('GitHub login error:', error.message);
                showAlert('GitHub login failed: ' + error.message);
            }
        });
        
        // Handle Email/Password Login
        document.getElementById('emailForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            hideAlert();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error) {
                showAlert('Login failed: ' + error.message);
            } else {
                showAlert('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            }
        });
        
        // Listen for auth state changes
        supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event);
            
            if (event === 'SIGNED_IN') {
                console.log('User signed in:', session.user);
                
                // Check if user has a profile
                checkAndCreateProfile(session.user);
            }
        });
        
        // Function to ensure user has a profile
        async function checkAndCreateProfile(user) {
            const { data: profile, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            
            if (error || !profile) {
                // Create profile if doesn't exist
                const { error: insertError } = await supabase
                    .from('user_profiles')
                    .insert([
                        {
                            id: user.id,
                            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student',
                            email: user.email,
                            role: 'student',
                            created_at: new Date().toISOString()
                        }
                    ]);
                
                if (insertError) {
                    console.error('Error creating profile:', insertError);
                } else {
                    console.log('Profile created successfully');
                }
            }
        }