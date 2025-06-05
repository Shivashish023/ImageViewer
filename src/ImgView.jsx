import React, { useState, useRef, useEffect } from 'react';
import { FaSearchPlus, FaSearchMinus } from 'react-icons/fa';

const ImageViewer = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [bboxColors, setBboxColors] = useState([]);
  const [imageScale, setImageScale] = useState(1);
  const [showBboxes, setShowBboxes] = useState(false);
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const lastTouchRef = useRef({ x: 0, y: 0 });
  const initialPinchDistanceRef = useRef(null);

  const currentImage = images[currentIndex];

  useEffect(() => {
    if (!containerRef.current) return;

    const updateImageScale = () => {
      if (currentImage && containerRef.current) {
        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        let newImageScale;
        
        if (currentImage.width > containerWidth || currentImage.height > containerHeight) {
          const scaleX = containerWidth / currentImage.width;
          const scaleY = containerHeight / currentImage.height;
          newImageScale = Math.min(scaleX, scaleY);
        } else {
          const scaleX = containerWidth / currentImage.width;
          const scaleY = containerHeight / currentImage.height;
          newImageScale = Math.min(scaleX, scaleY, 1);
        }
        
        setImageScale(newImageScale);
        setScale(1);
        setPos({ x: 0, y: 0 });
      }
    };

    const resizeObserver = new ResizeObserver(updateImageScale);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [currentImage]);

  useEffect(() => {
    if (currentImage?.bboxes) {
      const colors = currentImage.bboxes.map(() => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      });
      setBboxColors(colors);
    }
  }, [currentImage]);

  useEffect(() => {
    const container = containerRef.current;
    const image = imgRef.current;
    if (!container || !image) return;

    let isDragging = false;
    let lastMousePos = { x: 0, y: 0 };

    const getDistance = (touch1, touch2) => {
      return Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
    };

    const handleTouchStart = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      lastTouchRef.current = { x: touch.clientX, y: touch.clientY };

      if (e.touches.length === 2) {
        initialPinchDistanceRef.current = getDistance(e.touches[0], e.touches[1]);
      }
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      
      if (e.touches.length === 2) {
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        if (initialPinchDistanceRef.current !== null) {
          const scaleDiff = (currentDistance - initialPinchDistanceRef.current) * 0.01;
          const newScale = Math.max(1, Math.min(3, scale + scaleDiff));
          setScale(newScale);
        }
        initialPinchDistanceRef.current = currentDistance;
        return;
      }

      const touch = e.touches[0];
      const dx = touch.clientX - lastTouchRef.current.x;
      const dy = touch.clientY - lastTouchRef.current.y;
      
      lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
      
      setPos((prevPos) => ({
        x: prevPos.x + dx,
        y: prevPos.y + dy
      }));
    };

    const handleTouchEnd = () => {
      initialPinchDistanceRef.current = null;
    };

    const handleMouseDown = (e) => {
      isDragging = true;
      lastMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      lastMousePos = { x: e.clientX, y: e.clientY };
      
      setPos((prevPos) => ({
        x: prevPos.x + dx,
        y: prevPos.y + dy
      }));
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scale]);

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
    setScale(prevScale => Math.min(3, prevScale + 0.1));
  };

  const handleZoomOut = () => {
    setScale(prevScale => Math.max(1, prevScale - 0.1));
  };

  return (
    <div className="flex flex-col w-full min-h-[70vh] bg-gray-800 text-white items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8">
      <div 
        ref={containerRef}
        className="relative border-2 bg-gray-950 border-gray-400 overflow-hidden w-full max-w-[90vw] md:max-w-[85vw] lg:max-w-[80vw] xl:max-w-[1000px]"
        style={{
          aspectRatio: '4/3',
          height: 'auto',
          minHeight: '300px',
          maxHeight: 'calc(100vh - 200px)',
          touchAction: 'none'
        }}
      >
        {currentImage && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                position: 'relative',
                width: currentImage.width * imageScale,
                height: currentImage.height * imageScale,
                transform: `scale(${scale})`,
                transformOrigin: 'center',
                transition: 'transform 0.1s ease-out'
              }}
            >
              <img
                src={currentImage.src}
                ref={imgRef}
                style={{
                  width: '100%',
                  height: '100%',
                  cursor: "move",
                  transform: `translate(${pos.x}px, ${pos.y}px)`,
                  objectFit: 'contain'
                }}
                draggable={false}
                alt={currentImage.alt}
              />
              {showBboxes && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    transform: `translate(${pos.x}px, ${pos.y}px)`,
                    pointerEvents: 'none'
                  }}
                >
                  {currentImage.bboxes?.length > 0 && currentImage.bboxes.map((bbox, index) => (
                    <div
                      key={index}
                      className="absolute"
                      style={{
                        left: `${(bbox.x / currentImage.width) * 100}%`,
                        top: `${(bbox.y / currentImage.height) * 100}%`,
                        width: `${(bbox.width / currentImage.width) * 100}%`,
                        height: `${(bbox.height / currentImage.height) * 100}%`,
                        border: `2px solid ${bboxColors[index]}`,
                        pointerEvents: 'none',
                      }}
                    >
                      <div 
                        className="absolute left-0 top-0 text-red-500 text-[8px] sm:text-[10px] md:text-xs p-1 whitespace-nowrap bg-opacity-50"
                        style={{
                          fontSize: `${Math.max(8, Math.min(12, scale * 10))}px`
                        }}
                      >
                        {`Label: ${bbox.label || 'Unknown'}, Confidence: ${bbox.confidence.toFixed(2)}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {currentImage?.bboxes?.length > 0 && (
          <label className="absolute top-2 right-2 flex items-center gap-2 bg-gray-800 bg-opacity-75 px-3 py-1.5 rounded-md cursor-pointer hover:bg-opacity-90 transition-all duration-200">
            <input
              type="checkbox"
              checked={showBboxes}
              onChange={(e) => setShowBboxes(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-white select-none">Overlay</span>
          </label>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-[90vw] md:max-w-[85vw] lg:max-w-[80vw] xl:max-w-[1000px] mt-4 px-2 sm:px-4 gap-4">
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
