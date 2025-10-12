// --- Start of Hamburger Menu Script ---
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            // Toggle the 'active' class on both elements
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
            
            // Prevents scrolling when the mobile menu is open
            body.classList.toggle('no-scroll'); 
            
            // Accessibility state management
            const isExpanded = menuToggle.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });
    }
});
// --- End of Hamburger Menu Script ---

// --- Smooth Scroll Functionality ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        // Only run for links pointing to an ID on the same page
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') 
            && location.hostname == this.hostname) {
            
            const target = document.querySelector(this.hash);
            
            if (target) {
                e.preventDefault(); // Stop the instant jump
                window.scrollTo({
                    top: target.offsetTop - 80, // Scroll to target, minus space for the fixed navigation bar
                    behavior: 'smooth' // The key for smooth scrolling
                });
            }
        }
    });
});
// --- End Smooth Scroll ---

// --- Active Navigation Highlighting ---
document.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href').split('/').pop();
        
        // Compare the current page file name with the link's href file name
        if (linkPath === currentPath) {
            link.classList.add('active-nav');
        }
    });
});
// --- End Active Navigation ---

// --- Code Starter Kit Script (Program Page Only) ---

// 1. Load CodeMirror Libraries (Add these to the head section as instructed)
// <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/xml/xml.min.js"></script>

document.addEventListener('DOMContentLoaded', function() {
    const htmlEditorElement = document.getElementById('html-editor');
    const previewIframe = document.getElementById('preview-iframe');

    if (htmlEditorElement) {
        // Initialize CodeMirror editor for HTML
        const editor = CodeMirror.fromTextArea(htmlEditorElement, {
            mode: 'xml',
            theme: 'darcula', // Matches the CSS theme link
            lineNumbers: true
        });

        // Function to update the iframe preview
        function updatePreview() {
            const htmlCode = editor.getValue();
            
            // Write the code directly into the iframe's document
            previewIframe.contentDocument.open();
            previewIframe.contentDocument.write(htmlCode);
            previewIframe.contentDocument.close();
        }

        // 2. Initial load of the preview
        updatePreview();

        // 3. Update the preview whenever the code changes
        editor.on('change', updatePreview);
    }
});
// --- End Code Starter Kit Script ---

