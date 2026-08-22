import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Copy, Check, RotateCcw, Info } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    copied: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, copied: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Landslide Detector Runtime Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleCopy = () => {
    const diagnosticData = {
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'N/A',
      pathname: typeof window !== 'undefined' ? window.location.pathname : 'N/A',
      mode: import.meta.env.MODE,
      baseUrl: import.meta.env.BASE_URL,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
      errorMessage: this.state.error?.message || String(this.state.error),
      errorStack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack
    };

    navigator.clipboard?.writeText(JSON.stringify(diagnosticData, null, 2))
      .then(() => {
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 2500);
      })
      .catch(() => {});
  };

  public render() {
    if (this.state.hasError) {
      const isClient = typeof window !== 'undefined';
      const currentUrl = isClient ? window.location.href : 'N/A';
      const currentPath = isClient ? window.location.pathname : 'N/A';

      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-300 font-sans p-4 md:p-8">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-950 border border-red-900 flex items-center justify-center shrink-0">
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100 tracking-wide">LANDSLIDE DETECTOR</h1>
                <p className="text-xs text-red-400 font-medium">Application Render Interruption Caught</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 mb-5 text-left text-xs font-mono overflow-auto max-h-60 space-y-2">
              <div className="text-red-400 font-bold break-all">
                {this.state.error?.name || 'Error'}: {this.state.error?.message || String(this.state.error)}
              </div>
              {this.state.error?.stack && (
                <pre className="text-slate-500 text-[11px] whitespace-pre-wrap leading-relaxed">
                  {this.state.error.stack}
                </pre>
              )}
            </div>

            {/* Diagnostic Details */}
            <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 mb-6 text-xs text-slate-400 space-y-1.5 font-mono">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
                <Info size={14} className="text-blue-400" />
                <span>Deployment Diagnostic Context</span>
              </div>
              <div className="truncate"><span className="text-slate-500">URL:</span> {currentUrl}</div>
              <div className="truncate"><span className="text-slate-500">Path:</span> {currentPath}</div>
              <div><span className="text-slate-500">Vite Base:</span> {import.meta.env.BASE_URL}</div>
              <div><span className="text-slate-500">Mode:</span> {import.meta.env.MODE}</div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') window.location.reload();
                }}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-blue-600/20"
              >
                <RotateCcw size={14} />
                Reload Application
              </button>
              <button
                onClick={this.handleCopy}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
              >
                {this.state.copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {this.state.copied ? 'Copied!' : 'Copy Diagnostics'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
