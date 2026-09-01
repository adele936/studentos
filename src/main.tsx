import { StrictMode, Component } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; message: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'system-ui, sans-serif', color: '#17202d', background: '#f7f8fa', textAlign: 'center', padding: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Something went wrong</h1>
            <p style={{ color: '#677281', fontSize: '0.9rem' }}>{this.state.message}</p>
            <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', padding: '0.6rem 1.2rem', background: '#1b67d1', color: '#fff', border: 0, borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
