import React from "react";
import { Link } from "@reach/router";

//Payment Form, process user information to allow payment.

const PaymentForm = (props) => {
  const { active } = props;

  return (
    <div>
      <form
        id="payment-form"
        className={`sr-payment-form payment-view ${active ? "" : "hidden"}`}
      >
        <h3>Payment details</h3>
        <div className="sr-form-row">
          <div className="sr-combo-inputs">
            <div className="sr-combo-inputs-row">
              <input
                type="text"
                id="name"
                placeholder="Name"
                autoComplete="cardholder"
                className="sr-input"
              />
            </div>
            <div className="sr-combo-inputs-row">
              <input
                type="text"
                id="email"
                placeholder="Email"
                autoComplete="cardholder"
              />
            </div>

            <div className="sr-combo-inputs-row">
              <div id="card-element" className="sr-input sr-card-element"></div>
            </div>
          </div>
          <div className="sr-field-error" id="name-errors" role="alert"></div>
          <div className="sr-field-error" id="email-errors" role="alert"></div>
          <div className="sr-field-error" id="card-errors" role="alert"></div>
        </div>
        <button id="submit">
          <div className="spinner hidden" id="spinner"></div>
          <span id="button-text hidden">Purchase</span>
        </button>
        <div className="sr-legal-text">
          Your card will be immediately charged
        </div>
      </form>
      <div className="sr-section completed-view hidden">
        <h3 id="order-status">Thank you for your order!</h3>
        <p>
          Payment Id: <span id="payment-id"></span>
        </p>
        <p>Please check your email for download instructions.</p>
        <Link to="/video">
          {" "}
          <button>Place Another Order</button>
        </Link>
      </div>
    </div>
  );
};

export default PaymentForm;
