import { Component } from "react";
import { Link } from "react-router-dom";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production, forward to your error tracking service (Sentry etc.)
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-page">
          <div className="error-boundary-card">
            <h1 className="error-boundary-title">Something went wrong</h1>
            <p className="error-boundary-msg">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <div className="error-boundary-actions">
              <button
                className="btn btn--secondary"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Try again
              </button>
              <Link to="/listings" className="btn btn--primary">
                Go to Listings
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
