import React, { useState, useRef, useEffect } from 'react';
import { FaSearchPlus, FaSearchMinus } from 'react-icons/fa';

const ImageViewer = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });
  const imgRef = useRef(null);

  const currentImage = images[currentIndex];

  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      resetView();
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      resetView();
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev / 1.2, 0.2));
  };

  const onMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    offsetStart.current = { ...offset };
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset({ x: offsetStart.current.x + dx, y: offsetStart.current.y + dy });
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const imgElement = imgRef.current;
    if (imgElement) {
      const containerWidth = imgElement.parentElement.clientWidth;
      const containerHeight = imgElement.parentElement.clientHeight;
      const imgWidth = imgElement.naturalWidth;
      const imgHeight = imgElement.naturalHeight;


      const xOffset = (containerWidth - imgWidth * scale) / 2;
      const yOffset = (containerHeight - imgHeight * scale) / 2;

      setOffset({ x: xOffset, y: yOffset });
    }
  }, [currentImage, scale]); 

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        className="relative flex-grow border border-gray-700 rounded bg-gray-800 overflow-hidden cursor-grab select-none"
        style={{ userSelect: isDragging ? 'none' : 'auto' }}
      >
        <img
          ref={imgRef} 
          src={currentImage.src}
          alt={currentImage.alt}
          className="block max-w-full max-h-full select-none pointer-events-none"
          style={{
            transformOrigin: 'top left',
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          }}
          draggable={false}
        />
        {currentImage.bboxes.map((bbox, index) => (
          <div
            key={index}
            className="absolute border-2 border-blue-400 rounded pointer-events-none"
            title={`${bbox.className} (${(bbox.confidence * 100).toFixed(1)}%)`}
            style={{
              left: bbox.x * scale + offset.x,
              top: bbox.y * scale + offset.y,
              width: bbox.width * scale,
              height: bbox.height * scale,
            }}
          >
            <span className="absolute -top-5 left-0 px-1 text-xs font-semibold bg-gray-900 bg-opacity-80 rounded-b text-blue-300 pointer-events-auto">
              {bbox.className} ({(bbox.confidence * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between m-3 ">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 cursor-pointer"
        >
          Previous
        </button>
        <div className="flex items-center">
          <button
            onClick={handleZoomIn}
            className="p-2 text-white hover:text-gray-300 cursor-pointer"
          >
            <FaSearchPlus />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 text-white hover:text-gray-300 cursor-pointer"
          >
            <FaSearchMinus />
          </button>
        </div>
        <button
          onClick={handleNext}
          disabled={currentIndex === images.length - 1}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 cursor-pointer "
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ImageViewer;
