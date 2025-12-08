    // Function to display the pop-up
    function openPopup() {
        document.getElementById('flyer-popup').style.display = 'block';
    }

    // Function to close the pop-up
    function closePopup() {
        document.getElementById('flyer-popup').style.display = 'none';
    }

    // Automatically open the pop-up after 10 seconds (10,000 milliseconds)
    // You can adjust this number!
    setTimeout(openPopup, 10000); 

    // Optional: Close the popup if the user clicks outside of the flyer content
    window.onclick = function(event) {
        let popup = document.getElementById('flyer-popup');
        if (event.target == popup) {
            closePopup();
        }
    }