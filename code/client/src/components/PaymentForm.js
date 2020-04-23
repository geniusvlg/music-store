import React, { useState } from "react";
import { Link } from "@reach/router";
import {useStripe, useElements, CardElement} from '@stripe/react-stripe-js';
import '../css/cardsection.css'

//Payment Form, process user information to allow payment.

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
};


function PaymentForm(props) {
  const { active } = props;
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState("Wizeline");
  const [email, setEmail] = useState("huy.nguyen@wizeline.com");
  const [paymentId, setPaymentId] = useState(null);
  const [status, setStatus] = useState("failed");

  const handleNameChange = (e) => {
    setName(e.target.value);
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  }

  const submitPayment = (e) => {
    e.preventDefault();

    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: props.items })
    };

    fetch("/create-payment-intent", requestOptions)
        .then(response => {return response.json()})
        .then(paymentIntent => {handlePayment(paymentIntent)});
  }

  const handlePayment = async (paymentIntent) => {

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    const result = await stripe.confirmCardPayment(paymentIntent.clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: name,
          email: email
        },
      }
    });

    if (result.error) {
      // Show error to your customer (e.g., insufficient funds)
      console.log(result.error.message);
    } else {
      // The payment has been processed!
      if (result.paymentIntent.status === 'succeeded') {
        setPaymentId(result.paymentIntent.id)
        setStatus(result.paymentIntent.status)

        // Show a success message to your customer
        // There's a risk of the customer closing tohe window before callback
        // execution. Set up a webhook or plugin to listen for the
        // payment_intent.succeeded event that handles any business critical
        // post-payment actions.
      }
    }

  };


  return (
    <div>
      <form
        id="payment-form"
        className={`sr-payment-form payment-view ${active ? `${status === "succeeded" ? "hidden" : ""}` : "hidden"} `}
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
                onChange={handleNameChange}
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
              <div id="card-element" className="sr-input sr-card-element">
                <CardElement options={CARD_ELEMENT_OPTIONS} />
              </div>
            </div>
          </div>
          <div className="sr-field-error" id="name-errors" role="alert"></div>
          <div className="sr-field-error" id="email-errors" role="alert"></div>
          <div className="sr-field-error" id="card-errors" role="alert"></div>
        </div>
        <button id="submit" onClick={submitPayment}>
          <div className="spinner hidden" id="spinner"></div>
          <span id="button-text hidden">Purchase</span>
        </button>
        <div className="sr-legal-text">
          Your card will be immediately chargedx  
        </div>
      </form>
      <div className={`sr-section completed-view ${status === "succeeded" ? "" : "hidden"}`}>
        <h3 id="order-status">Thank you for your order!</h3>
        <p>
          Payment Id: <span id="payment-id" style={{color: "#ed5f74"}}>{paymentId}</span>
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
