// Js/supabase-config.js
(function() {
    // Only run once
    if (window.supabaseClient) return;
    
    const supabaseUrl = 'https://dvptsrzfbmrbexcwhkqe.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2cHRzcnpmYm1yYmV4Y3doa3FlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxOTg0NTUsImV4cCI6MjA4Mzc3NDQ1NX0.vsimT5xjZ9i_hgqExebBUaHUbGCC9zstak__tly4u4Y';
    
    window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
})();
