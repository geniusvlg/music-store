import React from "react";
import { Link } from "@reach/router";

//Registration Form Component, process user info for online session.

const RegistrationForm = (props) => {
  const { selected, details } = props;
  return (
    <div className="sr-main">
      <div
        className={`sr-payment-form payment-view ${
          selected === -1 ? "hidden" : ""
        }`}
      >
        <h3>Registration details</h3>
        <div id="summary-table" className="summary-table">
          <font color="red">{details}</font>
        </div>
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
              <div className="sr-input sr-card-element"></div>
            </div>
          </div>
          <div className="sr-field-error" id="card-errors" role="alert"></div>
          <div
            className="sr-field-error"
            id="customer-exists-error"
            role="alert"
            hidden
          >
            A customer with the email address of{" "}
            <span id="error_msg_customer_email"></span> already exists. If you'd
            like to update the card on file, please visit
            <span id="account_link"></span>.
          </div>
        </div>
        <button id="submit">
          <div className="spinner hidden" id="spinner"></div>
          <span id="button-text">Request Lesson</span>
        </button>
        <div className="sr-legal-text">
          Your card will not be charged. By registering, you hold a session slot
          which we will confirm within 24 hrs.
        </div>
      </div>

      <div className="sr-section hidden completed-view">
        <h3 id="signup-status">
          Woohoo! They are going to call you the shredder.{" "}
        </h3>
        <p>
          We've created a customer account with an id of{" "}
          <span id="customer-id"></span> and saved the card ending in{" "}
          <span id="last4"></span>
        </p>
        <p>
          Please check your email at <span id="customer_email"></span> for a
          welcome letter.
        </p>
        <Link to="/lessons">
          <button>Sign up again under a different email address</button>
        </Link>
      </div>
    </div>
  );
};
export default RegistrationForm;
