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



// --- Updated Code Starter Kit Script (Program Page Only) ---

document.addEventListener('DOMContentLoaded', function() {
    const htmlEditorElement = document.getElementById('html-editor');
    const previewIframe = document.getElementById('preview-iframe');
    const colorInputs = document.querySelectorAll('.color-controls input[type="color"]');

    if (htmlEditorElement) {
        // Initialize CodeMirror editor
        const editor = CodeMirror.fromTextArea(htmlEditorElement, {
            mode: 'xml',
            theme: 'darcula',
            lineNumbers: true
        });

        // Function to update the CodeMirror content and preview
        function updatePreview() {
            const htmlCode = editor.getValue();
            
            // Write the current code into the iframe's document
            previewIframe.contentDocument.open();
            previewIframe.contentDocument.write(htmlCode);
            previewIframe.contentDocument.close();
        }

        // Function to handle color changes
        function handleColorChange() {
            const headingColor = document.getElementById('primaryColor').value;
            const boxColor = document.getElementById('bgColor').value;
            const pageColor = document.getElementById('pageColor').value;

            // 1. Get the current HTML content from the editor
            let htmlCode = editor.getValue();
            
            // 2. REGEX: Find and replace the CSS color values within the <style> block of the code
            
            // a. Replace Heading Color (#28a745)
            htmlCode = htmlCode.replace(/(h1 \{ color: )#[a-fA-F0-9]{6}(; \/\* Impact Tech's primary green \*\/\})/, `$1${headingColor}$2`);
            
            // b. Replace Box Background (#ffffff)
            htmlCode = htmlCode.replace(/(.ita-box \{.*?background-color: )#[a-fA-F0-9]{6}(;.*?)/s, `$1${boxColor};`);

            // c. Replace Page Background (#f4f4f9)
            htmlCode = htmlCode.replace(/(body \{.*?background-color: )#[a-fA-F0-9]{6}(;.*?)/s, `$1${pageColor};`);


            // 3. Update the CodeMirror editor with the new colored code
            // (This visually updates the code the user sees)
            editor.setValue(htmlCode); 
        }


        // --- Event Listeners ---
        
        // Listen for changes in the color pickers
        colorInputs.forEach(input => {
            input.addEventListener('input', handleColorChange);
        });

        // Listen for changes directly in the code editor (user typing)
        editor.on('change', updatePreview);
        
        // Initial load of the preview (after colors are set)
        updatePreview();
    }
});
// --- End Updated Code Starter Kit Script ---
