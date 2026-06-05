import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <Compass size={64} className="not-found-icon" />
      <h1 className="not-found-title">404</h1>
      <p className="not-found-subtitle">
        Oops — this destination doesn't exist.
      </p>
      <Link to="/listings" className="btn btn--primary">
        Back to Listings
      </Link>
    </div>
  );
}
