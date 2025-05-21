// This file contains JavaScript code that manages video playback or interactions within the application.

document.addEventListener('DOMContentLoaded', () => {
    const videoPopups = document.querySelectorAll('.popup-window');

    videoPopups.forEach(popup => {
        const closeButton = popup.querySelector('.close');
        const minimizeButton = popup.querySelector('.minimize');
        const maximizeButton = popup.querySelector('.maximize');

        closeButton.addEventListener('click', () => {
            popup.classList.add('hidden');
            const iframe = popup.querySelector('iframe');
            if (iframe) {
                iframe.src = ''; // Stop video playback
            }
        });

        minimizeButton.addEventListener('click', () => {
            popup.classList.toggle('minimized');
        });

        maximizeButton.addEventListener('click', () => {
            popup.classList.toggle('maximized');
        });
    });

    // Function to open video popups
    window.openVideoPopup = (videoId) => {
        const popup = document.getElementById(videoId);
        if (popup) {
            popup.classList.remove('hidden');
            const iframe = popup.querySelector('iframe');
            if (iframe) {
                iframe.src = iframe.dataset.src; // Set the video source
            }
        }
    };
});