// This file contains JavaScript code that handles the interactive behavior of the application, such as opening and closing windows, managing the taskbar, and other UI interactions.

document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    const clock = document.getElementById('clock');

    // Toggle start menu visibility
    startButton.addEventListener('click', () => {
        startMenu.classList.toggle('visible');
    });

    // Close start menu when clicking outside
    document.addEventListener('click', (event) => {
        if (!startButton.contains(event.target) && !startMenu.contains(event.target)) {
            startMenu.classList.remove('visible');
        }
    });

    // Update clock every second
    setInterval(() => {
        const now = new Date();
        clock.textContent = now.toLocaleTimeString();
    }, 1000);

    // Function to open a window
    window.openWindow = (windowId) => {
        const windowElement = document.getElementById(windowId);
        if (windowElement) {
            windowElement.classList.remove('hidden');
        }
    };

    // Function to close a window
    window.closeWindow = (windowId) => {
        const windowElement = document.getElementById(windowId);
        if (windowElement) {
            windowElement.classList.add('hidden');
        }
    };

    // Add event listeners for close buttons
    document.querySelectorAll('.close').forEach(button => {
        button.addEventListener('click', (event) => {
            const windowId = event.target.closest('.popup-window').id;
            closeWindow(windowId);
        });
    });

    // Add event listeners for minimize buttons
    document.querySelectorAll('.minimize').forEach(button => {
        button.addEventListener('click', (event) => {
            const windowElement = event.target.closest('.popup-window');
            windowElement.classList.toggle('minimized');
        });
    });

    // Add event listeners for maximize buttons
    document.querySelectorAll('.maximize').forEach(button => {
        button.addEventListener('click', (event) => {
            const windowElement = event.target.closest('.popup-window');
            windowElement.classList.toggle('maximized');
        });
    });
});