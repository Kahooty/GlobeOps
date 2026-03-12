import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[GlobeOps] Render error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          background: '#0a0a0a',
          color: '#ff3333',
          padding: '2rem',
          fontFamily: "'JetBrains Mono', monospace",
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <div style={{ color: '#33ff33', fontSize: '14px' }}>[GLOBEOPS SYSTEM ERROR]</div>
          <pre style={{ color: '#ff3333', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              background: 'transparent',
              border: '1px solid #33ff33',
              color: '#33ff33',
              padding: '0.5rem 1rem',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '12px',
              cursor: 'pointer',
              width: 'fit-content',
            }}
          >
            [RETRY]
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
