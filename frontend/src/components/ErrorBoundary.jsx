import React from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log error securely without exposing backend internals
    const sanitizedMsg = error?.message || 'Unknown runtime error';
    console.error(`[AllConnect ErrorBoundary caught an isolated error]:`, sanitizedMsg);

    // Optional error callback
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (e) {
        // Ignore errors in logging callback
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const level = this.props.level || 'page'; // 'app' | 'page' | 'widget'
    const title = this.props.title || (
      level === 'app'
        ? 'Application Encountered an Error'
        : level === 'page'
        ? 'This Page Is Temporarily Unavailable'
        : 'Section Unavailable'
    );
    const friendlyMessage = this.props.fallbackMessage || (
      level === 'widget'
        ? 'This component encountered a rendering issue. Other sections remain active and functional.'
        : 'An isolated error occurred while loading this section. Your other pages and data remain safe.'
    );

    // Modal-level isolated fallback (modal dialog overlay)
    if (level === 'modal') {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">{title || 'Booking Window Unavailable'}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {friendlyMessage || 'An unexpected issue occurred while rendering this booking window. The underlying facility records remain safe.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
              {this.props.onClose && (
                <button
                  type="button"
                  onClick={this.props.onClose}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  Close Window
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Widget-level isolated fallback (card inside dashboard or page)
    if (level === 'widget') {
      return (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-slate-800 flex items-start gap-3 my-2 text-xs shadow-sm">
          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-amber-900 text-xs">{title}</h4>
            <p className="text-[11px] text-amber-700 mt-0.5">{friendlyMessage}</p>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-amber-300 text-[11px] font-semibold text-amber-900 hover:bg-amber-100/50 transition-colors shadow-xs"
              >
                <RefreshCw className="w-3 h-3" />
                Retry Component
              </button>
            </div>
          </div>
        </div>
      );
    }

    // App-level top level crash screen
    if (level === 'app') {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 text-center shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-white">{title}</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {friendlyMessage}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Application
              </button>
              <button
                onClick={() => { window.location.href = '/'; }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-xs transition-all"
              >
                <Home className="w-3.5 h-3.5" />
                Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Default: Page-level isolated fallback
    return (
      <div className="p-6 sm:p-10 max-w-3xl mx-auto my-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4 border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900">{title}</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-lg mx-auto">
            {friendlyMessage}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
            >
              <Home className="w-3.5 h-3.5" />
              Return to Home
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export function withErrorBoundary(Component, boundaryProps = {}) {
  return function WithErrorBoundaryWrapper(props) {
    return (
      <ErrorBoundary {...boundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
