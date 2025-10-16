import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import App from './App';

// Mock Plotly.js to avoid canvas and WebGL dependencies
vi.mock('react-plotly.js', () => ({
  default: vi.fn(({ data, layout, ...props }) => (
    <div data-testid="plotly-chart" {...props}>
      Mock Plotly Chart
    </div>
  ))
}));

vi.mock('plotly.js', () => ({
  default: {
    newPlot: vi.fn(),
    react: vi.fn(),
    redraw: vi.fn(),
    relayout: vi.fn()
  }
}));

// Mock environment initialization
vi.mock('./utils/envValidation', () => ({
  initializeEnvironment: vi.fn(() => true)
}));

// Mock the components to avoid complex dependencies
vi.mock('./pages/JSONExpressPage', () => ({
  default: function MockJSONExpressPage() {
    return <div data-testid="json-express-page">JSON Express Page</div>;
  }
}));

vi.mock('./pages/FastAPIPage', () => ({
  default: function MockFastAPIPage() {
    return <div data-testid="fastapi-page">FastAPI Page</div>;
  }
}));

// Mock canvas for jsdom
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Array(4) })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => ({ data: new Array(4) })),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn()
  }))
});

// Mock URL.createObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  value: vi.fn(() => 'mock-object-url')
});

Object.defineProperty(URL, 'revokeObjectURL', {
  value: vi.fn()
});

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
  });

  test('renders navigation links', () => {
    render(<App />);
    
    // Check for navigation links (updated text to match actual component)
    expect(screen.getByText('JSON Express API')).toBeInTheDocument();
    expect(screen.getByText('FastAPI Plotly Charts')).toBeInTheDocument();
    expect(screen.getByText('Multi-Backend Dashboard')).toBeInTheDocument();
  });
});
