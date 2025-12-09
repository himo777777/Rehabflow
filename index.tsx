import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { LiveAnnouncerProvider } from './components/ui/LiveAnnouncer';
import SkipLink from './components/ui/SkipLink';

// Initialize performance monitoring (auto-tracks Core Web Vitals)
import './utils/performance';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <LiveAnnouncerProvider>
        <SkipLink targetId="main-content" />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </LiveAnnouncerProvider>
    </ErrorBoundary>
  </React.StrictMode>
);