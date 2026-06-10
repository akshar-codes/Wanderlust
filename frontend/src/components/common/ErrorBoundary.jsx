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
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100svh",
            padding: 24,
            background: "#faf8f6",
          }}
        >
          <div
            style={{
              background: "#fff",
              border: "1px solid #ebe7e3",
              borderRadius: 28,
              padding: "48px 40px",
              maxWidth: 480,
              width: "100%",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
              boxShadow: "0 24px 80px rgba(61,43,26,0.12)",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                background: "linear-gradient(135deg, #fef2f2, #fee2e2)",
                border: "1.5px solid #fca5a5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
              }}
            >
              ⚠️
            </div>

            <div>
              <h1
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: "1.8rem",
                  color: "#ef4444",
                  marginBottom: 8,
                }}
              >
                Something went wrong
              </h1>
              {this.state.error?.message && (
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#b91c1c",
                    background: "#fef2f2",
                    borderRadius: 10,
                    padding: "10px 16px",
                    border: "1px solid #fee2e2",
                    fontFamily: "monospace",
                    wordBreak: "break-word",
                    lineHeight: 1.6,
                    marginTop: 8,
                  }}
                >
                  {this.state.error.message}
                </p>
              )}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                style={{
                  padding: "10px 22px",
                  background: "#fff",
                  border: "1.5px solid #d6d0ca",
                  borderRadius: 999,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  color: "#3d3630",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Try again
              </button>
              <Link
                to="/listings"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "10px 22px",
                  background: "linear-gradient(135deg, #ff5a5f, #e84040)",
                  borderRadius: 999,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  color: "#fff",
                  textDecoration: "none",
                  boxShadow: "0 4px 16px rgba(255,90,95,0.3)",
                }}
              >
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
