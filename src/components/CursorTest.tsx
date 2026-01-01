import React, { useState } from 'react';

export const CursorTest = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[99999] flex items-center justify-center"
      onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
      onClick={() => {
        console.log('CLICKED AT:', pos);
        console.log('Device Pixel Ratio:', window.devicePixelRatio);
        console.log('Window Size:', { w: window.innerWidth, h: window.innerHeight });
      }}
    >
      {/* Instructions */}
      <div className="text-white text-center">
        <h1 className="text-4xl font-bold mb-4">🎯 CURSOR TEST</h1>
        <p className="text-xl mb-2">Move your mouse - the crosshair should follow PERFECTLY</p>
        <div className="text-lg space-y-1 bg-gray-900 p-4 rounded-lg inline-block">
          <div>Mouse X: <span className="text-green-400 font-mono">{pos.x}px</span></div>
          <div>Mouse Y: <span className="text-green-400 font-mono">{pos.y}px</span></div>
          <div>Browser Zoom: <span className="text-yellow-400 font-mono">{window.devicePixelRatio}</span></div>
          <div className="mt-4 text-sm text-gray-400">
            {window.devicePixelRatio === 1 ? '✅ Zoom is 100%' : '⚠️ Zoom is NOT 100% - Press Ctrl+0!'}
          </div>
        </div>
        <p className="text-sm mt-4 text-gray-400">Click anywhere to log coordinates to console</p>
      </div>

      {/* Perfect Crosshair at cursor */}
      <div
        className="fixed pointer-events-none"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Vertical line */}
        <div className="w-0.5 h-12 bg-red-500 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        
        {/* Horizontal line */}
        <div className="h-0.5 w-12 bg-red-500 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        
        {/* Center dot */}
        <div className="w-2 h-2 bg-red-500 rounded-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        
        {/* Outer circle */}
        <div className="w-8 h-8 border-2 border-red-500 rounded-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
    </div>
  );
};
