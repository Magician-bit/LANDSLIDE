import React, { Component, ErrorInfo, ReactNode } from 'react';
import { MapPinOff } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class MapErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Map rendering error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 border border-slate-800 text-slate-400 p-6 z-10 relative rounded-xl">
          <MapPinOff size={48} className="mb-4 text-slate-600" />
          <h3 className="text-lg font-bold text-slate-300 mb-2">Map Interface Unavailable</h3>
          <p className="text-sm text-center max-w-sm mb-4">
            The geospatial visualization component encountered a critical rendering failure.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-sm transition-colors"
          >
            Retry Initialization
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MapErrorBoundary;
