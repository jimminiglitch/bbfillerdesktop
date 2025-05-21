# BBFillerDesktop

BBFillerDesktop is a creative application designed to showcase various media projects, including films, games, music, and interactive experiences. This project serves as a digital portfolio for Benjamin Filler, featuring a unique user interface that mimics a desktop environment.

## Project Structure

- **public/images**: Contains images used in the application, organized into subdirectories for desktop and icons.
- **public/sounds**: Contains sound files used in the application.
- **public/style.css**: Defines the CSS styles for the application, controlling the visual appearance of the UI.
- **src/components**: Contains reusable components for the application.
  - **bff-paint.astro**: Defines the BffPaint component for painting functionality.
  - **bff-recorder.astro**: Defines the BffRecorder component for recording functionality.
- **src/pages**: Contains the main entry point for the application.
  - **index.astro**: Defines the layout and structure of the UI, including desktop icons and popup windows.
- **src/scripts**: Contains JavaScript files for interactive behavior.
  - **script.js**: Handles window management and UI interactions.
  - **video.js**: Manages video playback and interactions.
- **src/windows**: Contains various windows for displaying content.
  - **about.astro**: Displays information about the application or the creator.
  - **contact.astro**: Provides contact information or a contact form.
  - **bbfillercv/index.html**: Displays the creator's resume.
  - **bbfillernature/index.html**: Showcases nature-related content.
  - **bbfillermusic/index.html**: Showcases music-related content.
  - **spacesnake/index.html**: Hosts a game or interactive experience.
  - **rave-city-3d/pages/3drave.html**: Showcases a 3D experience or interactive content.

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd bbfillerdesktop
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Usage

To start the application, run:
```
npm start
```

Open your browser and navigate to `http://localhost:3000` to view the application.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.