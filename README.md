# React + Vite
# Image Viewer with Bounding Box Visualization

A modern, responsive React application for viewing images with bounding box annotations. This project provides an interactive interface to display images along with their corresponding object detection annotations, featuring zoom, pan, and navigation capabilities.

## Features

- 🖼️ Smooth image navigation with previous/next controls
- 🔍 Interactive zoom in/out functionality
- 🖱️ Pan capability for detailed image inspection
- 📦 Bounding box visualization with labels and confidence scores
- 📱 Fully responsive design that works on all device sizes
- 🔄 Automatic aspect ratio maintenance
- ⚡ Fast image loading with Vite

## Tech Stack
- React
- Vite
- Tailwind CSS
- React Icons

## Project Structure

```
project-root/
├── data/
│   ├── images/     # JPG image files
│   └── jsons/      # Corresponding JSON annotation files
├── src/
│   ├── App.jsx     # Main application component
│   └── ImgView.jsx # Image viewer component
├── index.html
└── package.json
```



## Usage

- Use the Previous/Next buttons to navigate between images
- Click and drag to pan around the image
- Use the zoom buttons  to zoom in/out
- Bounding boxes will automatically scale and move with the image
- Labels and confidence scores are displayed on each bounding box

## Features in Detail

### Image Navigation
- Smooth transitions between images
- Automatic reset of zoom/pan on image change
- Disabled navigation buttons at start/end of image set

### Zoom & Pan
- Center-based zooming for natural interaction
- Smooth zoom transitions
- Maintains bounding box positions during zoom/pan
- Responsive to both button clicks and mouse interactions

### Bounding Box Display
- Color-coded boxes for easy distinction
- Labels and confidence scores visible on boxes
- Boxes scale and move with image transformations
- Maintains position accuracy during all interactions

### Responsive Design
- Works on mobile, tablet, and desktop devices
- Adaptive layout for different screen sizes
- Touch-friendly controls
- Maintains image aspect ratio across all devices


