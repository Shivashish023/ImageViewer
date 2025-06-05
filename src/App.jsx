import React, { useState, useEffect } from 'react';
import ImageViewer from './ImgView';
const LoadingSpinner = () => (
  <div className="flex flex-col items-center gap-4">
    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    <p className="text-xl font-semibold text-white animate-pulse">Loading </p>
  </div>
);
const loadData = async () => {
  const images = [];
  try {
   
    const imageModules = import.meta.glob('/data/images/*.jpg');
    const jsonModules = import.meta.glob('/data/jsons/*.json');

    const imagePaths = Object.keys(imageModules);

    const batchSize = 5;
    for (let i = 0; i < imagePaths.length; i += batchSize) {
      const batch = imagePaths.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (imagePath) => {
          try {
            const imageName = imagePath.split('/').pop();
            const jsonPath = `/data/jsons/${imageName.replace('.jpg', '.json')}`;

            if (!jsonModules[jsonPath]) {
              console.warn(`No JSON found for ${imageName}`);
              return;
            }

            const imageModule = await imageModules[imagePath]();
            const jsonModule = await jsonModules[jsonPath]();
            const jsonData = jsonModule.default;

            if (!jsonData?.input?.data || !jsonData?.output?.predictions) {
              console.warn(`Invalid JSON data for ${imageName}`);
              return;
            }

            images.push({
              src: imageModule.default,
              alt: `Image ${imageName}`,
              width: jsonData.input.data.width || 0,
              height: jsonData.input.data.height || 0,
              bboxes: jsonData.output.predictions.map(prediction => ({
                confidence: prediction.confidence,
                label: prediction.label,
                x: prediction.bbox.x,
                y: prediction.bbox.y,
                width: prediction.bbox.width,
                height: prediction.bbox.height,
              }))
            });
          } catch (err) {
            console.warn(`Error loading ${imagePath}:`, err);
          }
        })
      );
    }

    return images.sort((a, b) => a.alt.localeCompare(b.alt));
  } catch (error) {
    console.error('Error loading images or JSON data:', error);
    throw error;
  }
};

const App = () => {
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const data = await loadData();
        if (mounted && data.length > 0) {
          setImages(data);
        } else if (mounted) {
          setError('No images found. Make sure images are in the correct folder.');
        }
      } catch (err) {
        if (mounted) {
          console.error('Loading error:', err);
          setError('Error loading images. Check console for details.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-800">
       <LoadingSpinner/>
      </div>
    );
  }

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
