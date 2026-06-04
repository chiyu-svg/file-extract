import React from 'react';

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: string;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: '' };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error: error.message };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
                    <div className="text-center p-8">
                        <div className="text-4xl mb-4">😵</div>
                        <h2 className="text-xl font-bold mb-2">出了点问题</h2>
                        <p className="text-gray-400 text-sm mb-4">{this.state.error}</p>
                        <button
                            onClick={() => this.setState({ hasError: false, error: '' })}
                            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                        >
                            重新加载
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
