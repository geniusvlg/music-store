import React, { useState, useEffect } from "react";
import { Link } from "@reach/router";
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

//Registration Form Component, process user info for online session.

const RegistrationForm = (props) => {
  const [setupIntent, setSetupIntent] = useState("");
  const stripe = useStripe();
  const [email, setEmail] = useState("");
  const elements = useElements();
  const [cardSetupStatus, setCardSetupStatus] = useState("");
  const [loading, setLoading] = useState("false")

  useEffect(() => {

      const requestOptions = {
        method: "post",
        headers: {
          "Content-Type": "application/json"
        }
      };

        fetch("/create-setup-intent", requestOptions)
        .then(response => {return response.json()})
        .then(setupIntent => {setSetupIntent(setupIntent); console.log(setupIntent)})
  }, []);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  }

  const signUpPayment = (e) => {
    e.preventDefault();
    setLoading("true");

    stripe
      .confirmCardSetup(setupIntent.client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { email: email }
        }
      })
      .then(function(result) {
        if (result.error) {
          console.log(result.error.message);
          setCardSetupStatus("failed")
        } else {
          // The PaymentMethod was successfully set up
          console.log("RESULT")
          setCardSetupStatus(result.setupIntent.status)
          setLoading("false");
          console.log(result)
        
        }
      });

  };


  const { selected, details } = props;
  return (
    <div className="sr-main">
      <div
        className={`sr-payment-form payment-view ${
          selected === -1 ? "hidden" : `${cardSetupStatus === "succeeded" ? "hidden" : ""}`
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
                onChange={handleEmailChange}
              />
            </div>
            <div className="sr-combo-inputs-row">
              <div className="sr-input sr-card-element">
                <CardElement />
              </div>
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
        <button id="submit" onClick={signUpPayment}>
          <div className={`spinner ${loading === "false" ? "hidden" : ""}`} id="spinner"></div>
          <span id="button-text" className={`${loading === "true" ? "hidden" : ""}`}>Request Lesson</span>
        </button>
        <div className="sr-legal-text">
          Your card will not be charged. By registering, you hold a session slot
          which we will confirm within 24 hrs.
        </div>
      </div>

      <div className={`sr-section completed-view ${cardSetupStatus === "succeeded" ? "" : "hidden"}`}>
        <h3 id="signup-status">
          Woohoo! They are going to call you the shredder.{" "}
        </h3>
        <p>
          We've created a customer account with an id of {setupIntent.id}
          <span id="customer-id"></span> and saved the card ending in{" "}
          <span id="last4"></span>
        </p>
        <p>
          Please check your email at <span id="customer_email"></span> for a
          welcome letter.
        </p>
        <Link to="/lessons" onClick={() => window.location.reload()}>
          <button>Sign up again under a different email address</button>
        </Link>
      </div>
    </div>
  );
};
export default RegistrationForm;
