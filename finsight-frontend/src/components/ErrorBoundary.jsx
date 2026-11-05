import { Component } from 'react';

// Catches render errors so one broken page can't blank the whole app.
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('UI error:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent-red/10 border border-accent-red/20 flex items-center justify-center mx-auto mb-5 text-2xl" aria-hidden="true">!</div>
          <h1 className="font-display font-bold text-2xl text-text-primary mb-2">Something went wrong</h1>
          <p className="text-text-secondary text-sm mb-6">An unexpected error stopped this page from loading. Reloading usually fixes it.</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => window.location.reload()} className="btn-primary">Reload</button>
            <a href="/" className="btn-secondary">Go home</a>
          </div>
        </div>
      </div>
    );
  }
}
