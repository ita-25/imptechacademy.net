// Js/dashboard.js
// Dashboard functionality

// Dashboard state
let currentUser = null;
let userCourses = [];
let userProgress = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Dashboard initialized');
    
    // Check authentication
    await checkAuthentication();
    
    // Initialize UI
    initializeUI();
    
    // Load user data
    await loadUserData();
    
    // Load dashboard data
    await loadDashboardData();
    
    // Setup event listeners
    setupEventListeners();
});

// Check if user is authenticated
async function checkAuthentication() {
    const supabase = window.authHelpers?.getSupabaseClient();
    if (!supabase) {
        console.error('Supabase client not available');
        redirectToLogin();
        return;
    }
    
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!session) {
            console.log('No active session, redirecting to login');
            redirectToLogin();
            return;
        }
        
        currentUser = session.user;
        console.log('User authenticated:', currentUser.email);
        
    } catch (error) {
        console.error('Authentication check failed:', error);
        redirectToLogin();
    }
}

// Redirect to login page
function redirectToLogin() {
    window.location.href = 'login.html?error=' + encodeURIComponent('Please log in to access the dashboard');
}

// Initialize UI elements
function initializeUI() {
    // Menu toggle for mobile
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
    
    // User menu dropdown
    const userMenu = document.getElementById('userMenu');
    const userMenuDropdown = document.getElementById('userMenuDropdown');
    
    if (userMenu && userMenuDropdown) {
        userMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenuDropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking elsewhere
        document.addEventListener('click', () => {
            userMenuDropdown.classList.remove('show');
        });
    }
    
    // Navigation items
    const navItems = document.querySelectorAll('.nav-item, .dropdown-item');
    navItems.forEach(item => {
        if (item.id !== 'logoutBtn' && item.id !== 'dropdownLogout') {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page) {
                    navigateToPage(page);
                }
            });
        }
    });
    
    // Logout buttons
    const logoutButtons = document.querySelectorAll('#logoutBtn, #dropdownLogout');
    logoutButtons.forEach(button => {
        button.addEventListener('click', handleLogout);
    });
}

// Navigate to different pages
function navigateToPage(page) {
    console.log('Navigating to:', page);
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
    
    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        const titles = {
            'dashboard': 'Dashboard',
            'courses': 'My Courses',
            'progress': 'Progress',
            'certificates': 'Certificates',
            'profile': 'Profile',
            'settings': 'Settings',
            'resources': 'Resources'
        };
        pageTitle.textContent = titles[page] || 'Dashboard';
    }
    
    // In a real app, you would load different content here
    // For now, we'll just show an alert
    if (page !== 'dashboard') {
        alert(`Navigating to ${page} page... (This would load different content in a real application)`);
    }
}

// Load user data
async function loadUserData() {
    if (!currentUser) return;
    
    const supabase = window.authHelpers?.getSupabaseClient();
    if (!supabase) return;
    
    try {
        // Get user profile
        const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
        
        if (error) {
            console.error('Error loading user profile:', error);
            // Use default data
            updateUserUI(currentUser);
            return;
        }
        
        // Combine auth user with profile data
        const userData = { ...currentUser, ...profile };
        updateUserUI(userData);
        
    } catch (error) {
        console.error('Error loading user data:', error);
        updateUserUI(currentUser);
    }
}

// Update user UI elements
function updateUserUI(user) {
    // Get user initials for avatar
    const fullName = user.user_metadata?.full_name || 
                    user.full_name || 
                    user.email?.split('@')[0] || 
                    'Student';
    
    const initials = getInitials(fullName);
    
    // Update all avatar elements
    const avatarElements = document.querySelectorAll('#userAvatar, #userMenuAvatar');
    avatarElements.forEach(el => {
        if (el) el.textContent = initials;
    });
    
    // Update name elements
    const nameElements = document.querySelectorAll('#userFullName, #userMenuName, #welcomeName');
    nameElements.forEach(el => {
        if (el) el.textContent = fullName;
    });
    
    // Update role
    const roleElement = document.getElementById('userRole');
    if (roleElement && user.role) {
        roleElement.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    }
}

// Get initials from full name
function getInitials(name) {
    return name
        .split(' ')
        .map(part => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
}

// Load dashboard data
async function loadDashboardData() {
    await loadUserCourses();
    await loadUserProgress();
    await loadStats();
    await loadActivities();
    await loadDeadlines();
    
    // Update UI with real data
    updateDashboardUI();
}

// Load user's courses
async function loadUserCourses() {
    // In a real app, this would fetch from Supabase
    // For now, we'll use mock data
    
    userCourses = [
        {
            id: 1,
            title: "Web Development Fundamentals",
            category: "web",
            description: "Learn HTML, CSS, and JavaScript from scratch",
            progress: 75,
            duration: "8 weeks",
            lessons: 24,
            icon: "fas fa-code",
            color: "web"
        },
        {
            id: 2,
            title: "UI/UX Design Principles",
            category: "design",
            description: "Master user interface and experience design",
            progress: 45,
            duration: "6 weeks",
            lessons: 18,
            icon: "fas fa-paint-brush",
            color: "design"
        },
        {
            id: 3,
            title: "Cybersecurity Basics",
            category: "cyber",
            description: "Learn essential security concepts and practices",
            progress: 20,
            duration: "10 weeks",
            lessons: 30,
            icon: "fas fa-shield-alt",
            color: "cyber"
        },
        {
            id: 4,
            title: "Cloud Computing with AWS",
            category: "cloud",
            description: "Introduction to Amazon Web Services",
            progress: 10,
            duration: "12 weeks",
            lessons: 36,
            icon: "fas fa-cloud",
            color: "cloud"
        }
    ];
}

// Load user's progress
async function loadUserProgress() {
    // Calculate progress from courses
    userProgress = userCourses.map(course => ({
        courseId: course.id,
        courseTitle: course.title,
        progress: course.progress
    }));
}

// Load dashboard statistics
async function loadStats() {
    const stats = {
        coursesCount: userCourses.length,
        avgProgress: Math.round(userCourses.reduce((sum, course) => sum + course.progress, 0) / userCourses.length),
        learningHours: userCourses.length * 12, // Mock calculation
        certificatesCount: userCourses.filter(course => course.progress === 100).length
    };
    
    // Update stats in UI
    document.getElementById('coursesCount').textContent = stats.coursesCount;
    document.getElementById('avgProgress').textContent = stats.avgProgress + '%';
    document.getElementById('learningHours').textContent = stats.learningHours;
    document.getElementById('certificatesCount').textContent = stats.certificatesCount;
}

// Load recent activities
async function loadActivities() {
    const activities = [
        {
            type: 'completed',
            title: 'Completed HTML Module',
            description: 'You finished the HTML Basics module',
            time: '2 hours ago',
            icon: 'fas fa-check-circle',
            color: 'completed'
        },
        {
            type: 'started',
            title: 'Started CSS Flexbox',
            description: 'You began learning CSS Flexbox',
            time: '1 day ago',
            icon: 'fas fa-play-circle',
            color: 'started'
        },
        {
            type: 'certificate',
            title: 'Certificate Earned',
            description: 'You earned a certificate for JavaScript Basics',
            time: '3 days ago',
            icon: 'fas fa-certificate',
            color: 'certificate'
        },
        {
            type: 'quiz',
            title: 'Quiz Completed',
            description: 'You scored 85% on the Web Fundamentals quiz',
            time: '1 week ago',
            icon: 'fas fa-question-circle',
            color: 'quiz'
        }
    ];
    
    updateActivitiesUI(activities);
}

// Load upcoming deadlines
async function loadDeadlines() {
    const deadlines = [
        {
            title: 'CSS Grid Assignment',
            course: 'Web Development Fundamentals',
            date: 'Tomorrow',
            color: 'warning'
        },
        {
            title: 'JavaScript Project',
            course: 'Web Development Fundamentals',
            date: 'In 3 days',
            color: 'warning'
        },
        {
            title: 'Mid-term Exam',
            course: 'Cybersecurity Basics',
            date: 'Next week',
            color: 'info'
        }
    ];
    
    updateDeadlinesUI(deadlines);
}

// Update dashboard UI with loaded data
function updateDashboardUI() {
    updateCoursesUI();
    updateProgressUI();
}

// Update courses UI
function updateCoursesUI() {
    const coursesGrid = document.getElementById('coursesGrid');
    if (!coursesGrid) return;
    
    // Clear loading skeletons
    coursesGrid.innerHTML = '';
    
    if (userCourses.length === 0) {
        coursesGrid.innerHTML = `
            <div class="no-data">
                <i class="fas fa-book-open"></i>
                <h3>No courses yet</h3>
                <p>Enroll in your first course to get started</p>
                <button class="btn-continue" style="margin-top: 20px;">
                    <i class="fas fa-plus"></i>
                    Browse Courses
                </button>
            </div>
        `;
        return;
    }
    
    // Add course cards
    userCourses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card-dashboard';
        courseCard.innerHTML = `
            <div class="course-header">
                <div class="course-icon ${course.color}">
                    <i class="${course.icon}"></i>
                </div>
                <h3>${course.title}</h3>
                <p>${course.description}</p>
            </div>
            <div class="course-body">
                <div class="course-meta">
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${course.duration}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-book"></i>
                        <span>${course.lessons} lessons</span>
                    </div>
                </div>
                <div class="progress-item">
                    <div class="progress-info">
                        <span class="progress-title">Progress</span>
                        <span class="progress-percentage">${course.progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${course.progress}%"></div>
                    </div>
                </div>
                <div class="course-actions">
                    <button class="btn-continue" data-course="${course.id}">
                        <i class="fas fa-play"></i>
                        ${course.progress > 0 ? 'Continue' : 'Start'}
                    </button>
                    <button class="btn-outline" data-course="${course.id}">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </div>
            </div>
        `;
        
        coursesGrid.appendChild(courseCard);
    });
    
    // Add event listeners to course buttons
    document.querySelectorAll('.btn-continue').forEach(button => {
        button.addEventListener('click', (e) => {
            const courseId = e.target.closest('.btn-continue').dataset.course;
            alert(`Continuing course ${courseId}... (This would open the course player)`);
        });
    });
}

// Update progress UI
function updateProgressUI() {
    const progressList = document.getElementById('progressList');
    if (!progressList) return;
    
    // Clear loading skeletons
    progressList.innerHTML = '';
    
    if (userProgress.length === 0) {
        progressList.innerHTML = `
            <div class="no-data">
                <i class="fas fa-chart-line"></i>
                <h3>No progress yet</h3>
                <p>Start a course to see your progress here</p>
            </div>
        `;
        return;
    }
    
    // Add progress bars
    userProgress.forEach(progress => {
        const progressItem = document.createElement('div');
        progressItem.className = 'progress-item';
        progressItem.innerHTML = `
            <div class="progress-info">
                <span class="progress-title">${progress.courseTitle}</span>
                <span class="progress-percentage">${progress.progress}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress.progress}%"></div>
            </div>
        `;
        progressList.appendChild(progressItem);
    });
}

// Update activities UI
function updateActivitiesUI(activities) {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    // Clear loading skeletons
    activityList.innerHTML = '';
    
    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon ${activity.color}">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
                <div class="activity-time">${activity.time}</div>
            </div>
        `;
        activityList.appendChild(activityItem);
    });
}

// Update deadlines UI
function updateDeadlinesUI(deadlines) {
    const deadlineList = document.getElementById('deadlineList');
    if (!deadlineList) return;
    
    // Clear loading skeletons
    deadlineList.innerHTML = '';
    
    deadlines.forEach(deadline => {
        const deadlineItem = document.createElement('div');
        deadlineItem.className = 'deadline-item';
        deadlineItem.innerHTML = `
            <div class="deadline-info">
                <h4>${deadline.title}</h4>
                <p>${deadline.course}</p>
            </div>
            <div class="deadline-date">${deadline.date}</div>
        `;
        deadlineList.appendChild(deadlineItem);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Notification button
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            alert('Notifications would open here');
        });
    }
    
    // Quick action buttons
    document.querySelectorAll('.action-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.currentTarget.dataset.page;
            if (page) {
                navigateToPage(page);
            }
        });
    });
    
    // Course continue buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.btn-continue')) {
            const button = e.target.closest('.btn-continue');
            const courseId = button.dataset.course;
            alert(`Opening course ${courseId}...`);
        }
    });
    
    // Close sidebar when clicking on mobile
    if (window.innerWidth <= 768) {
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const menuToggle = document.getElementById('menuToggle');
            
            if (sidebar && menuToggle && 
                !sidebar.contains(e.target) && 
                !menuToggle.contains(e.target) && 
                sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    }
}

// Handle logout
async function handleLogout(e) {
    e.preventDefault();
    
    const supabase = window.authHelpers?.getSupabaseClient();
    if (!supabase) return;
    
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        // Clear local storage
        localStorage.clear();
        
        // Redirect to login
        window.location.href = 'login.html?success=' + encodeURIComponent('Logged out successfully');
        
    } catch (error) {
        console.error('Logout failed:', error);
        alert('Logout failed. Please try again.');
    }
}

// Handle window resize
window.addEventListener('resize', function() {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth > 768 && sidebar) {
        sidebar.classList.remove('open');
    }
});

// Real-time updates (optional)
function setupRealTimeUpdates() {
    const supabase = window.authHelpers?.getSupabaseClient();
    if (!supabase) return;
    
    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_OUT') {
            redirectToLogin();
        }
    });
}

// Initialize real-time updates
setupRealTimeUpdates();
