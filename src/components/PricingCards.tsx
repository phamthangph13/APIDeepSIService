import { Link } from "react-router-dom";
import { usePlans } from "../context/PlansContext";
import { Sticker } from "./Sticker";

type PricingCardsProps = {
  compact?: boolean;
  currentPlan?: string;
};

export function PricingCards({ compact = false, currentPlan }: PricingCardsProps) {
  const { plans } = usePlans();

  return (
    <div className={`pricing-grid${compact ? " pricing-grid--compact" : ""}`}>
      {plans.map((plan) => {
        const isCurrent = currentPlan === plan.id;
        return (
          <article
            key={plan.id}
            className={`price-card price-card--${plan.accent}${plan.popular ? " price-card--popular" : ""}${isCurrent ? " price-card--current" : ""}`}
            data-reveal
          >
            <div className="price-card__top">
              <div className="price-card__name-row">
                <span className="mono price-card__index">
                  {plan.id === "free" ? "01" : plan.id === "plus" ? "02" : "03"}
                </span>
                <h3 className="price-card__name">{plan.name}</h3>
              </div>
              <Sticker
                name={plan.sticker}
                size={compact ? 54 : 68}
                rotate={plan.id === "free" ? -7 : plan.id === "plus" ? 5 : -3}
                flat={plan.accent === "moss"}
                decorative
              />
            </div>

            {plan.popular ? (
              <span className="price-card__badge">
                <Sticker name="star" size={18} flat decorative />
                Được chọn nhiều
              </span>
            ) : null}

            <p className="price-card__tagline">{plan.tagline}</p>

            <div className="price-card__price">
              <strong>{plan.priceLabel}</strong>
              <span>{plan.cadence}</span>
            </div>
            <p className="price-card__quota">{plan.quotaLabel}</p>

            {!compact ? <p className="price-card__description">{plan.description}</p> : null}

            <ul className="price-card__features">
              {plan.features.map((feature) => (
                <li key={feature}>
                  <Sticker name="check" size={17} flat decorative />
                  <span>{feature}</span>
                </li>
              ))}
              {plan.notIncluded?.map((feature) => (
                <li className="is-muted" key={feature}>
                  <Sticker name="lock" size={16} flat decorative />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {isCurrent ? (
              <span className="price-card__current">
                <Sticker name="check" size={17} flat decorative />
                Gói hiện tại
              </span>
            ) : (
              <Link
                to={`/register?plan=${plan.id}`}
                className={`btn btn--${plan.popular ? "light" : plan.id === "ultral" ? "primary" : "secondary"} btn--md btn--full price-card__cta`}
              >
                <span>{plan.cta}</span>
                <Sticker name="arrow" size={21} rotate={-10} flat decorative />
              </Link>
            )}
          </article>
        );
      })}
    </div>
  );
}
