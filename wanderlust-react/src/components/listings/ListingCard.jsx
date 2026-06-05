import { Link } from "react-router-dom";

export default function ListingCard({ listing, showTax }) {
  const basePrice = listing.price;
  const displayPrice = showTax
    ? (basePrice * 1.18).toLocaleString("en-IN")
    : basePrice.toLocaleString("en-IN");

  return (
    <Link to={`/listings/${listing._id}`} className="listing-card-link">
      <article className="listing-card">
        <div className="listing-card__img-wrap">
          <img
            src={listing.image?.url}
            alt={listing.title}
            className="listing-card__img"
            loading="lazy"
          />
          <div className="listing-card__overlay" aria-hidden />
        </div>
        <div className="listing-card__body">
          <h3 className="listing-card__title">{listing.title}</h3>
          <p className="listing-card__location">
            {listing.location}, {listing.country}
          </p>
          <p className="listing-card__price">
            <span className="price-amount">₹{displayPrice}</span>
            <span className="price-unit"> / night</span>
            {showTax && <span className="price-tax-note"> (incl. 18% tax)</span>}
          </p>
        </div>
      </article>
    </Link>
  );
}
