import React, { useState, useEffect } from 'react';
import ImageViewer from './ImgView';
import i1 from "../data/images/000000000785.jpg";
import i2 from "../data/images/000000001268.jpg";

const loadData = async () => {
  return [
    {
      src: i1,
      alt: 'Cute kitten 1',
      bboxes: [
        { x: 50, y: 50, width: 150, height: 150, className: 'Kitten', confidence: 0.95 },
      ],
    },
    {
      src: i2,
      alt: 'Cute kitten 2',
      bboxes: [
        { x: 100, y: 80, width: 120, height: 120, className: 'Kitten', confidence: 0.87 },
      ],
    },
  ];
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
        setError('Error loading images');
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
        <h1 className="text-4xl font-extrabold mb-8 text-center text-white drop-shadow-md">
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
