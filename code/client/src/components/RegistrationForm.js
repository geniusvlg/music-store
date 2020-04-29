import React, { useState, useEffect } from "react";
import { Link } from "@reach/router";
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

//Registration Form Component, process user info for online session.

const RegistrationForm = (props) => {
  const { selected, details } = props; 
  const [setupIntent, setSetupIntent] = useState("");
  const [status, setStatus] = useState("");
  const stripe = useStripe();
  const [email, setEmail] = useState("");
  const elements = useElements();
  const [loading, setLoading] = useState("false")
  const [id, setId] = useState("")

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  }

  const createSetupIntent = () => {
      setLoading("true");
     const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          date: props.date,
          email: email
        })
      };

        fetch("/create-setup-intent", requestOptions)
        .then(response => {return response.json()})
        .then(setupIntent => {
          // console.log("successfully")
          // console.log(setupIntent)
          // setSetupIntent(setupIntent)
          // signUpPayment(setupIntent); 
          setSetupIntent(setupIntent)

          try {
            signUpPayment(setupIntent); 
          } catch (err) {
             setId(setupIntent.error.id)
             setLoading("false")
             setStatus("failed")
          }

        })
        // .catch(error => { 
        //   setLoading("false")
        //   setSetupIntent("failed")
        //   console.log(error.message)
        //   setCustomerId(error.id)
        // });
  }

  const signUpPayment = (setupIntent) => {
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
        } else {
          // The PaymentMethod was successfully set up
          console.log("RESULT")
          setLoading("false");
          console.log(result)
          setStatus("succeeded")
        }
      });

  };
    
  return (
    <div className="sr-main">
      <div
        className={`sr-payment-form payment-view ${
          selected === -1 ? "hidden" : `${status === "succeeded" ? "hidden" : ""}`
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
            className={`sr-field-error ${status === "failed" ? "" : "hidden"}`}
            id="customer-exists-error"
            role="alert"
          >
            A customer with the email address of
            <span id="error_msg_customer_email"> {email}</span> already exists. If you'd
            like to update the card on file, please visit 
             <a id="account_link" href={"/account-update/" + id} style={{color: "blue", textDecoration: 'underline'}}> this</a>
          </div>
        </div>
        <button id="submit" onClick={createSetupIntent}>
          <div className={`spinner ${loading === "false" ? "hidden" : ""}`} id="spinner"></div>
          <span id="button-text" className={`${loading === "true" ? "hidden" : ""}`}>Request Lesson</span>
        </button>
        <div className="sr-legal-text">
          Your card will not be charged. By registering, you hold a session slot
          which we will confirm within 24 hrs.
        </div>
      </div>

      <div className={`sr-section completed-view ${status === "succeeded" ? "" : "hidden"}`}>
        <h3 id="signup-status">
          Woohoo! They are going to call you the shredder.{" "}
        </h3>
        <p>
          We've created a customer account with an id of {setupIntent.customer}
          <span id="customer-id"></span> and saved the card ending in{" "}
          <span id="last4"></span>
        </p>
        <p>
          Please check your email at <span id="customer_email">{email}</span> for a
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
