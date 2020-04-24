import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getPriceDollars } from "../components/Util";
import "../css/checkout.scss";
import { config } from "../components/mock_data";
import { concertSetup } from "../Services/concert";
import { useStripe } from '@stripe/react-stripe-js';

//Concert Ticket Component
/*
  This component works with i18n to show messages according to language coonfiguration (lang).
  The content of each message is located in public/locales/lang/translation.json
*/
const MIN_TIXX = 1; //min number of tickets user can buy
const MAX_TIXX = 10; //max number of tickets user can buy

const fetchCheckoutSession = async ({quantity, headline}) => {
  
  return fetch("/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      quantity: quantity,
      headline: headline
    })
  }).then((res) => res.json());
} 

const Concert = (context) => {
  const [tickets, setTickets] = useState(1); //number of tickets user want to buy
  const [total, setTotal] = useState("$0"); //total price to pay
  const [data, setData] = useState({});
  const t = useTranslation()[0];
  const stripe = useStripe();

  const increaseTicketCount = () => {
    if (tickets < MAX_TIXX) {
      setTickets(tickets + 1);
    }
  };

  const reduceTicketCount = () => {
    if (tickets > MIN_TIXX) {
      setTickets(tickets - 1);
    }
  };
  //Get info to load page, config API route in package.json "proxy"
  useEffect(() => {
    const setup = async () => {
      var result = await concertSetup();
      if (result === null) {
        //use static data
        //comment this code to work with backend only
        result = config;
      }
      setData(result);
    };
    setup();
  }, []);
  //Calculate total when number of tickets changes
  useEffect(() => {
    setTotal(getPriceDollars(tickets * data.basePrice, true));
  }, [data, tickets]);

  const handleClick = async (event) => {

    console.log(t("headline"))
    // Call your backend to create the Checkout session.
    const { sessionId } = await fetchCheckoutSession({
      quantity: tickets,
      headline: t("headline")
    });
    // When the customer clicks on the button, redirect them to Checkout.
    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });
    // If `redirectToCheckout` fails due to a browser or network
    // error, display the localized error message to your customer
    // using `error.message`.
    if (error) {
      context.history.push("/concert")
    }
  };

  return (
    <main className="main-checkout">
      <div className="sr-root">
        <div className="sr-checkout-main">
          <section className="container">
            <div>
              <h1>{t("headline")}</h1>
              <h2>{t("date")}</h2>
              <h4>{t("subline")}</h4>
              <div className="p-image">
                <img
                  src="/assets/img/kid.jpg"
                  width="640"
                  height="400"
                  alt=""
                />
              </div>
            </div>
            <div className="quantity-setter">
              <button
                disabled={tickets <= 1}
                className="increment-btn"
                id="subtract"
                onClick={() => reduceTicketCount()}
              >
                -
              </button>
              <input
                type="number"
                id="quantity-input"
                min="1"
                max="10"
                value={tickets}
                disabled
              />
              <button
                disabled={tickets >= 10}
                className="increment-btn"
                id="add"
                onClick={() => increaseTicketCount()}
              >
                +
              </button>
            </div>
            <p className="sr-legal-text">{t("sr-legal-text")}</p>
            <button className="button" id="submit" onClick={handleClick}>
              {t("button.submit", { total: total })}
            </button>
          </section>
          <div id="error-message"></div>
        </div>
      </div>
    </main>
  );
};

export default Concert;
