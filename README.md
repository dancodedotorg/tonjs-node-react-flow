# ToneJS React Flow Music App

A visual music creation application built with React, ToneJS, and React Flow. Create music by connecting nodes in a flow-based interface, with support for audio effects and real-time playback.

## Features

- **Visual Node Interface**: Drag-and-drop interface for connecting audio components
- **Multiple Sound Packs**: Choose from various music packs including Electro Dance, Groove Central, Indie Dreams, Pop Paradise, Hip Hop, Heavy Rock, and Acoustic Arcade
- **Audio Effects**: Apply high-pass filters and pitch shifting effects to your sounds
- **Real-time Playback**: Loop audio with applied effects in real-time
- **Interactive Controls**: Adjust effect parameters with sliders and controls

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)

## Installation

1. **Clone or download the repository** to your local machine

2. **Navigate to the project directory**:
   ```bash
   cd tonjs-node-react-flow
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

## Running the Application

1. **Start the development server**:
   ```bash
   npm start
   ```

2. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

The application should automatically open in your default browser. If it doesn't, manually navigate to the URL above.

## How to Use

### Basic Usage

1. **Select a Sound Pack**: In the "Song Select" node, choose a music pack from the dropdown
2. **Choose a Sound**: Select a specific sound from the chosen pack
3. **Connect Nodes**: Drag from the output handle (right side) of the Song Select node to the input handle (left side) of the Output node
4. **Play Audio**: Click the "Play Loop" button in the Output node to start playback

### Adding Effects

1. **Add Effect Nodes**: Right-click in the canvas and select "Add High Pass Filter" or "Add Pitch Shift" from the context menu
2. **Connect Effects**: Connect nodes in sequence: Song Select → Effect(s) → Output
3. **Adjust Parameters**: Use the sliders in effect nodes to modify the sound:
   - **High Pass Filter**: Adjust frequency (20Hz - 20kHz)
   - **Pitch Shift**: Adjust pitch (-10 to +10 semitones)

### Node Types

- **🎵 Song Select**: Choose music packs and individual sounds
- **🎛️ High Pass Filter**: Filter out frequencies below the set threshold
- **🎵 Pitch Shift**: Change the pitch of the audio up or down
- **🔊 Audio Output**: Play the processed audio with loop functionality

## Available Scripts

In the project directory, you can run:

- **`npm start`**: Runs the app in development mode
- **`npm test`**: Launches the test runner
- **`npm run build`**: Builds the app for production
- **`npm run eject`**: Ejects from Create React App (one-way operation)

## Technology Stack

- **React 18.2.0**: Frontend framework
- **React Flow 11.10.1**: Node-based interface library
- **ToneJS 14.7.77**: Web audio framework for sound synthesis and effects
- **Create React App**: Development environment and build tools

## Audio Sources

The application uses audio samples from Code.org's Music Lab library, featuring various genres and instrument types including:

- Drum beats and percussion
- Bass lines and sub-bass
- Lead instruments (guitar, piano, synth)
- Sound effects and transitions

## Browser Compatibility

This application requires a modern web browser with Web Audio API support:

- Chrome 66+
- Firefox 60+
- Safari 14.1+
- Edge 79+

## Troubleshooting

### Audio Not Playing
- Ensure your browser supports Web Audio API
- Check that your browser allows audio playback (some browsers require user interaction first)
- Verify your internet connection (audio files are loaded from external URLs)

### Performance Issues
- Close other browser tabs that might be using audio
- Refresh the page if audio becomes choppy
- Check browser console for any error messages

### Connection Issues
- Make sure nodes are properly connected (handles should show visual feedback)
- Verify that the Song Select node has both a pack and sound selected
- Check that the Output node shows "Connected" status

## Development

To modify or extend the application:

1. **Add New Effect Types**: Create new node components in [`src/App.js`](src/App.js)
2. **Modify Audio Processing**: Update the effect chain logic in the [`buildEffectChain`](src/App.js:445) function
3. **Add New Sound Packs**: Update the [`src/songs.json`](src/songs.json) file with new audio sources
4. **Customize Styling**: Modify [`src/App.css`](src/App.css) for visual changes

## License

This project is created for educational purposes. Audio samples are provided by Code.org's Music Lab.