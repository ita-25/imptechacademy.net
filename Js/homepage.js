// Homepage JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Homepage loaded');
    
    // Initialize components
    initLoadingScreen();
    initTypingEffect();
    initMobileMenu();
    initSmoothScroll();
    initCounters();
    loadCourses();
    initContactForm();
    
    // Check auth status for navigation
    checkAuthStatus();
});

// Loading screen
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        // Hide loading screen after 2 seconds
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 2000);
    }
}

// Typing effect for hero section
function initTypingEffect() {
    const typingElement = document.getElementById('typingText');
    if (!typingElement) return;
    
    const words = ['Code', 'Tech Skills', 'Your Future', 'Innovation', 'Solutions'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingDelay = 100;
    let erasingDelay = 50;
    let newWordDelay = 2000;
    
    function type() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            // Remove character
            typingElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typingDelay = erasingDelay;
        } else {
            // Add character
            typingElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typingDelay = 100;
        }
        
        if (!isDeleting && charIndex === currentWord.length) {
            // Word completed, pause then start deleting
            isDeleting = true;
            typingDelay = newWordDelay;
        } else if (isDeleting && charIndex === 0) {
            // Word deleted, move to next word
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typingDelay = 500;
        }
        
        setTimeout(type, typingDelay);
    }
    
    // Start typing effect after a delay
    setTimeout(type, 1000);
}

// Mobile menu toggle
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
            
            // Toggle icon
            const icon = menuToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !menuToggle.contains(e.target) && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
                menuToggle.querySelector('i').classList.remove('fa-times');
                menuToggle.querySelector('i').classList.add('fa-bars');
            }
        });
    }
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            if (href === '#' || href === '#!') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                // Close mobile menu if open
                const navLinks = document.querySelector('.nav-links');
                const menuToggle = document.getElementById('menuToggle');
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    menuToggle.classList.remove('active');
                    menuToggle.querySelector('i').classList.remove('fa-times');
                    menuToggle.querySelector('i').classList.add('fa-bars');
                }
                
                // Smooth scroll
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Animated counters
function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    if (!counters.length) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-count'));
                const duration = 2000; // 2 seconds
                const step = target / (duration / 16); // 60fps
                let current = 0;
                
                const updateCounter = () => {
                    current += step;
                    if (current < target) {
                        counter.textContent = Math.floor(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                };
                
                counter.classList.add('animated');
                updateCounter();
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

// Load courses from database
async function loadCourses() {
    const coursesGrid = document.getElementById('coursesGrid');
    if (!coursesGrid) return;
    
    try {
        // Get Supabase client
        const supabase = window.supabaseClient;
        if (!supabase) {
            console.warn('Supabase client not available');
            showSampleCourses();
            return;
        }
        
        // Fetch published courses from database
        const { data: courses, error } = await supabase
            .from('courses')
            .select('*')
            .eq('is_published', true)
            .limit(6)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error loading courses:', error);
            showSampleCourses();
            return;
        }
        
        if (courses && courses.length > 0) {
            renderCourses(courses);
        } else {
            showSampleCourses();
        }
        
    } catch (error) {
        console.error('Failed to load courses:', error);
        showSampleCourses();
    }
}

// Render courses to the grid
function renderCourses(courses) {
    const coursesGrid = document.getElementById('coursesGrid');
    if (!coursesGrid) return;
    
    // Clear loading state
    coursesGrid.innerHTML = '';
    
    // Course category icons mapping
    const categoryIcons = {
        'web-development': 'fas fa-code',
        'cybersecurity': 'fas fa-shield-alt',
        'cloud-computing': 'fas fa-cloud',
        'data-science': 'fas fa-chart-bar',
        'ai-ml': 'fas fa-robot',
        'mobile-development': 'fas fa-mobile-alt',
        'ui-ux-design': 'fas fa-paint-brush',
        'devops': 'fas fa-server',
        'project-management': 'fas fa-tasks',
        'it-support': 'fas fa-headset',
        'digital-marketing': 'fas fa-bullhorn',
        'blockchain': 'fas fa-link'
    };
    
    // Course category colors
    const categoryColors = {
        'web-development': '#4361ee',
        'cybersecurity': '#ef476f',
        'cloud-computing': '#7209b7',
        'data-science': '#06d6a0',
        'ai-ml': '#ff9e00',
        'mobile-development': '#118ab2',
        'ui-ux-design': '#8338ec',
        'devops': '#3a86ff',
        'project-management': '#fb5607',
        'it-support': '#ff006e',
        'digital-marketing': '#ffbe0b',
        'blockchain': '#06d6a0'
    };
    
    courses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        courseCard.innerHTML = `
            <div class="course-image" style="background: linear-gradient(135deg, ${categoryColors[course.category] || '#4361ee'}, ${categoryColors[course.category] || '#3a56d4'}80)"></div>
            <div class="course-content">
                <span class="course-category" style="background: ${categoryColors[course.category] || '#4361ee'}20; color: ${categoryColors[course.category] || '#4361ee'}">
                    ${course.category.replace('-', ' ').toUpperCase()}
                </span>
                <h3 class="course-title">${course.title}</h3>
                <p class="course-description">${course.short_description || 'Learn valuable skills with our expert-led course.'}</p>
                <div class="course-meta">
                    <span class="duration">
                        <i class="fas fa-clock"></i> ${course.duration_weeks} weeks
                    </span>
                    <span class="level">
                        <i class="fas fa-signal"></i> ${course.level}
                    </span>
                </div>
                <a href="course.html?slug=${course.slug}" class="btn btn-outline" style="margin-top: 1rem; display: inline-block;">
                    Learn More
                </a>
            </div>
        `;
        
        coursesGrid.appendChild(courseCard);
    });
}

// Show sample courses if database fails
function showSampleCourses() {
    const coursesGrid = document.getElementById('coursesGrid');
    if (!coursesGrid) return;
    
    coursesGrid.innerHTML = '';
    
    const sampleCourses = [
        {
            title: 'Web Development Fundamentals',
            category: 'web-development',
            short_description: 'Learn HTML, CSS, and JavaScript from scratch. Build your first website in 8 weeks.',
            duration_weeks: 8,
            level: 'Beginner',
            color: '#4361ee'
        },
        {
            title: 'Cybersecurity Basics',
            category: 'cybersecurity',
            short_description: 'Protect yourself and others from cyber threats. Learn essential security concepts.',
            duration_weeks: 10,
            level: 'Beginner',
            color: '#ef476f'
        },
        {
            title: 'Cloud Computing with AWS',
            category: 'cloud-computing',
            short_description: 'Master Amazon Web Services and deploy scalable applications in the cloud.',
            duration_weeks: 12,
            level: 'Intermediate',
            color: '#7209b7'
        },
        {
            title: 'Data Science Fundamentals',
            category: 'data-science',
            short_description: 'Learn Python, statistics, and machine learning for data analysis and visualization.',
            duration_weeks: 14,
            level: 'Intermediate',
            color: '#06d6a0'
        },
        {
            title: 'AI & Machine Learning',
            category: 'ai-ml',
            short_description: 'Build intelligent systems with Python, TensorFlow, and neural networks.',
            duration_weeks: 16,
            level: 'Advanced',
            color: '#ff9e00'
        },
        {
            title: 'Mobile App Development',
            category: 'mobile-development',
            short_description: 'Build native and cross-platform mobile applications with React Native.',
            duration_weeks: 12,
            level: 'Intermediate',
            color: '#118ab2'
        }
    ];
    
    sampleCourses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        courseCard.innerHTML = `
            <div class="course-image" style="background: linear-gradient(135deg, ${course.color}, ${course.color}80)"></div>
            <div class="course-content">
                <span class="course-category" style="background: ${course.color}20; color: ${course.color}">
                    ${course.category.replace('-', ' ').toUpperCase()}
                </span>
                <h3 class="course-title">${course.title}</h3>
                <p class="course-description">${course.short_description}</p>
                <div class="course-meta">
                    <span class="duration">
                        <i class="fas fa-clock"></i> ${course.duration_weeks} weeks
                    </span>
                    <span class="level">
                        <i class="fas fa-signal"></i> ${course.level}
                    </span>
                </div>
                <a href="course.html" class="btn btn-outline" style="margin-top: 1rem; display: inline-block;">
                    Learn More
                </a>
            </div>
        `;
        
        coursesGrid.appendChild(courseCard);
    });
}

// Contact form submission
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name') || contactForm.querySelector('input[type="text"]').value,
            email: formData.get('email') || contactForm.querySelector('input[type="email"]').value,
            interest: formData.get('interest') || contactForm.querySelector('select').value,
            message: formData.get('message') || contactForm.querySelector('textarea').value
        };
        
        // Basic validation
        if (!data.name || !data.email || !data.message) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Show loading state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            // In a real app, you would send this to your backend
            // For now, simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Show success message
            alert('Thank you for your message! We will get back to you soon.');
            
            // Reset form
            contactForm.reset();
            
        } catch (error) {
            console.error('Form submission error:', error);
            alert('Sorry, there was an error sending your message. Please try again.');
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Check auth status for navigation
async function checkAuthStatus() {
    try {
        const supabase = window.supabaseClient;
        if (!supabase) return;
        
        const { data: { session } } = await supabase.auth.getSession();
        const navButtons = document.querySelector('.nav-buttons');
        
        if (navButtons && session) {
            // User is logged in
            navButtons.innerHTML = `
                <a href="dashboard.html" class="btn btn-outline">
                    <i class="fas fa-tachometer-alt"></i>
                    Dashboard
                </a>
                <a href="#" class="btn btn-primary" id="logoutHome">
                    <i class="fas fa-sign-out-alt"></i>
                    Logout
                </a>
            `;
            
            // Add logout handler
            document.getElementById('logoutHome')?.addEventListener('click', async (e) => {
                e.preventDefault();
                await supabase.auth.signOut();
                window.location.href = 'index.html';
            });
        }
    } catch (error) {
        console.error('Auth check failed:', error);
    }
}

// Initialize on scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.feature-card, .course-card, .testimonial-card').forEach(el => {
        observer.observe(el);
    });
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        animation: fadeInUp 0.6s ease forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .feature-card,
    .course-card,
    .testimonial-card {
        opacity: 0;
    }
`;
document.head.appendChild(style);

// Initialize scroll animations
initScrollAnimations();

// Add intersection observer for nav background
const nav = document.querySelector('.navbar');
if (nav) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            nav.style.background = 'rgba(15, 23, 42, 0.95)';
            nav.style.backdropFilter = 'blur(10px)';
            nav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            nav.style.background = 'transparent';
            nav.style.backdropFilter = 'none';
            nav.style.boxShadow = 'none';
        }
    });
}
