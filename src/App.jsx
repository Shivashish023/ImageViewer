import React, { useState, useEffect } from 'react';
import ImageViewer from './ImgView';

const loadData = async () => {
  const images = [];
  try {
    const imageModules = import.meta.glob('../data/images/*.jpg');
    const jsonModules = import.meta.glob('../data/jsons/*.json');

    for (const path in imageModules) {
      const module = await imageModules[path]();
      const imageName = path.split('/').pop(); 
      const jsonPath = `../data/jsons/${imageName.replace('.jpg', '.json')}`; 
      let jsonData = null;
      if (jsonModules[jsonPath]) {
        const jsonModule = await jsonModules[jsonPath]();
        jsonData = jsonModule.default; 
      }

      const width = jsonData?.input.data.width || 0;
      const height = jsonData?.input.data.height || 0;

      const bboxes = jsonData?.output.predictions.map(prediction => ({
        confidence: prediction.confidence,
        label: prediction.label,
        x: prediction.bbox.x,
        y: prediction.bbox.y,
        width: prediction.bbox.width,
        height: prediction.bbox.height,
      })) || [];

      images.push({
        src: module.default,
        alt: `Image ${imageName}`,
        bboxes, 
        width,
        height,
      });
    }
  } catch (error) {
    console.error('Error loading images or JSON data:', error);
    throw error;
  }
  return images;
};

const App = () => {
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await loadData();
        setImages(data);
      } catch (err) {
        setError('Error loading images or JSON data');
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-800">
        <p className="text-xl font-semibold text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col items-center py-10 px-4">
      <div className="bg-gray-900 rounded-xl shadow-lg w-full max-w-5xl p-8 flex flex-col h-full">
        <h1 className="text-4xl font-extrabold mb-5 text-center text-white drop-shadow-md">
          Image Viewer
        </h1>
        <div className="flex flex-col flex-grow rounded-lg overflow-hidden shadow-inner bg-gray-700">
          {images.length > 0 ? (
            <ImageViewer images={images} />
          ) : (
            <p className="text-center text-gray-400 my-auto p-4">No images found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
