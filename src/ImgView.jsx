import React, { useState, useRef, useEffect } from 'react';
import { FaSearchPlus, FaSearchMinus } from 'react-icons/fa';

const ImageViewer = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [bboxColors, setBboxColors] = useState([]);
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

  const currentImage = images[currentIndex];

  useEffect(() => {
    if (currentImage?.bboxes) {
      const colors = currentImage.bboxes.map(() => getRandomColor());
      setBboxColors(colors);
    }
  }, [currentImage]);

  const resetView = () => {
    setScale(1);
    setPos({ x: 0, y: 0 });
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
    const container = containerRef.current;
    if (!container) return;
    
    const newScale = scale + 0.1;
    setScale(newScale);
  };

  const handleZoomOut = () => {
    if (scale >= 1.1) {
      const newScale = scale - 0.1;
      setScale(newScale);
    }
  };

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  useEffect(() => {
    const image = imgRef.current;
    let isDragging = false;
    let prevPos = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
      isDragging = true;
      prevPos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevPos.x;
      const dy = e.clientY - prevPos.y;
      prevPos = { x: e.clientX, y: e.clientY };
      setPos((pos) => ({
        x: pos.x + dx,
        y: pos.y + dy
      }));
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleMouseLeave = () => {
      isDragging = false;
    };

    const handleTouchStart = (e) => {
      isDragging = true;
      const touch = e.touches[0];
      prevPos = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const dx = touch.clientX - prevPos.x;
      const dy = touch.clientY - prevPos.y;
      prevPos = { x: touch.clientX, y: touch.clientY };
      setPos((pos) => ({
        x: pos.x + dx,
        y: pos.y + dy
      }));
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    image?.addEventListener("mousedown", handleMouseDown);
    image?.addEventListener("mousemove", handleMouseMove);
    image?.addEventListener("mouseup", handleMouseUp);
    image?.addEventListener("mouseleave", handleMouseLeave);
    image?.addEventListener("touchstart", handleTouchStart);
    image?.addEventListener("touchmove", handleTouchMove);
    image?.addEventListener("touchend", handleTouchEnd);

    return () => {
      image?.removeEventListener("mousedown", handleMouseDown);
      image?.removeEventListener("mousemove", handleMouseMove);
      image?.removeEventListener("mouseup", handleMouseUp);
      image?.removeEventListener("mouseleave", handleMouseLeave);
      image?.removeEventListener("touchstart", handleTouchStart);
      image?.removeEventListener("touchmove", handleTouchMove);
      image?.removeEventListener("touchend", handleTouchEnd);
    };
  }, [imgRef, scale]);

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current || !currentImage) return;
      
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 32; 
      
      const maxWidth = viewportWidth - (padding * 2);
      const maxHeight = viewportHeight - (padding * 2) - 100; 
      
      const imageAspectRatio = currentImage.width / currentImage.height;
      let newWidth = currentImage.width;
      let newHeight = currentImage.height;
      
      if (newWidth > maxWidth) {
        newWidth = maxWidth;
        newHeight = newWidth / imageAspectRatio;
      }
      
      if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = newHeight * imageAspectRatio;
      }
      
      setContainerDimensions({ width: newWidth, height: newHeight });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [currentImage]);

  return (
    <div className="flex flex-col min-h-[70vh] bg-gray-900 text-white items-center justify-center p-3 md:p-8">
      <div 
        ref={containerRef}
        className="relative border-2 border-gray-400 overflow-hidden"
        style={{
          height: containerDimensions.height,
          width: containerDimensions.width,
          maxWidth: '100%',
          maxHeight: 'calc(100vh - 200px)',
        }}
      >
        {currentImage && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              transform: `scale(${scale})`,
              transformOrigin: '50% 50%',
              transition: 'transform 0.1s ease-out'
            }}
          >
            <img
              src={currentImage.src}
              ref={imgRef}
              className="w-full h-full object-contain"
              style={{
                cursor: "move",
                transform: `translate(${pos.x}px, ${pos.y}px)`,
              }}
              draggable={false}
              alt={currentImage.alt}
            />
            {currentImage.bboxes.length > 0 && currentImage.bboxes.map((bbox, index) => (
              <div
                key={index}
                className="absolute border"
                style={{
                  left: `${(bbox.x / currentImage.width) * 100}%`,
                  top: `${(bbox.y / currentImage.height) * 100}%`,
                  width: `${(bbox.width / currentImage.width) * 100}%`,
                  height: `${(bbox.height / currentImage.height) * 100}%`,
                  pointerEvents: 'none',
                  border: `2px solid ${bboxColors[index]}`,
                  transform: `translate(${pos.x}px, ${pos.y}px)`,
                }}
              >
                <div className="text-red-500 text-[8px] md:text-xs p-1">
                  {`Label: ${bbox.label || 'Unknown'}, Confidence: ${bbox.confidence.toFixed(2)}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-4xl mt-4 px-4 gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 cursor-pointer w-full sm:w-auto text-sm md:text-base"
        >
          Previous
        </button>
        
        <div className="flex items-center space-x-2 order-first sm:order-none">
          <button
            onClick={handleZoomIn}
            className="p-2 text-white hover:text-gray-300 cursor-pointer text-lg md:text-xl"
            aria-label="Zoom In"
          >
            <FaSearchPlus />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 text-white hover:text-gray-300 cursor-pointer text-lg md:text-xl"
            aria-label="Zoom Out"
          >
            <FaSearchMinus />
          </button>
        </div>
        
        <button
          onClick={handleNext}
          disabled={currentIndex === images.length - 1}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 cursor-pointer w-full sm:w-auto text-sm md:text-base"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ImageViewer;
