import '@testing-library/jest-dom';

// Polyfill import.meta for Jest
(global as any).import = {
  meta: {
    env: {
      VITE_PULSE_API_URL: '',
      VITE_PULSE_API_KEY: '',
      DEV: true,
      PROD: false,
      MODE: 'test',
    },
  },
};

// Mock HTML2Canvas
global.HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
  callback(new Blob(['mock-canvas-data'], { type: 'image/png' }));
});

global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(),
  putImageData: jest.fn(),
  createImageData: jest.fn(),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
})) as any;

// Mock window.URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-blob-url');
global.URL.revokeObjectURL = jest.fn();

// Mock fetch
global.fetch = jest.fn();

// Suppress console errors in tests
global.console.error = jest.fn();
global.console.warn = jest.fn();

// Mock the logger module to avoid import.meta issues
jest.mock('../utils/logger', () => ({
  logger: {
    error: jest.fn((...args) => console.error('[ERROR]', ...args)),
    warn: jest.fn((...args) => console.warn('[WARN]', ...args)),
    info: jest.fn((...args) => console.log('[INFO]', ...args)),
    debug: jest.fn((...args) => console.log('[DEBUG]', ...args)),
  }
}));
