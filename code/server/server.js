const express = require("express");
const app = express();
const { resolve } = require("path");
// Replace if using a different env file or config
const env = require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const allitems = {};

// const MIN_ITEMS_FOR_DISCOUNT = 2;
app.use(express.static(process.env.STATIC_DIR));

app.use(
  express.json({
    // Should use middleware or a function to compute it only when hitting the Stripe webhook endpoint.
    verify: function(req, res, buf) {
      if (req.originalUrl.startsWith("/webhook")) {
        req.rawBody = buf.toString();
      }
    }
  })
);

// load items file for video courses
let file = require("../items.json");
file.forEach(function(item) {
  item.selected = false;
  allitems[item.itemId] = item;
});


// load config file
let fs = require("fs");
let configFile = fs.readFileSync("../config.json");
const config = JSON.parse(configFile);

// const asyncMiddleware = fn => (req, res, next) => {
//   Promise.resolve(fn(req, res, next)).catch(next);
// };

// Routes
//// Get started! Shows the main page of the challenge with links to the
// different sections.
app.get("/", (req, res) => {
  const path = resolve(process.env.STATIC_DIR + "/index.html");
  res.sendFile(path);
});

// Chalellenge Section 1
// Challenge section 1: shows the videos purchase page.
app.get("/videos", (req, res) => {
  const path = resolve(process.env.STATIC_DIR + "/videos.html");
  res.sendFile(path);
});

// Challenge section 1: returns config information that is used by the client JavaScript
// to display the videos page.
app.get("/setup-video-page", (req, res) => {
  res.send({ 
    discountFactor: config.video_discount_factor,
    minItemsForDiscount: config.video_min_items_for_discount,
    items: allitems,
  });
});

app.get("/get-stripe-publishable-key", (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
});

const calculateOrderAmount = (items) => {
    let totalPrice = 0;
      items.forEach(item => {
        switch(item.itemId) {
            case 'guitar':
                totalPrice += 1500;
                break;
            case 'piano':
                totalPrice += 2500;
                break;
            case 'ukelele':
                totalPrice += 1000;
                break;
            case 'drums':
                totalPrice += 3000;
                break;
            case 'banjo':
                totalPrice += 3500;
                break;
            case 'g2':
                totalPrice += 1500;
                break;
        }

      });

      return  (items.length > 1) ? totalPrice * 0.8 : totalPrice;
};


app.post("/create-payment-intent", async (req, res) => {
  console.log("FETCH");
  const { items } = req.body;
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: 'usd'
  });

  // Send publishable key and PaymentIntent details to client
  res.send({
    clientSecret: paymentIntent.client_secret
  });
});

//app.post("/create-payment-intent", (req, res) => {
//    res.send('Hello World');
//});

app.post("/webhook", async (req, res) => {
  let data, eventType;

  // Check if webhook signing is configured.
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers["stripe-signature"];
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // we can retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  if (eventType === "payment_intent.succeeded") {
    // Funds have been captured
    // Fulfill any orders, e-mail receipts, etc
    // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
    console.log("💰 Payment captured!");
  } else if (eventType === "payment_intent.payment_failed") {
    console.log("❌ Payment failed.");
  }
  res.sendStatus(200);
});


// Challenge Section 2
// Challenge section 2: shows the concert tickets page.
app.get("/concert", (req, res) => {
  const path = resolve(process.env.STATIC_DIR + "/concert.html");
  res.sendFile(path);
});


app.get("/setup-concert-page", (req, res) => {
  res.send({ 
    basePrice: config.checkout_base_price,
    currency: config.checkout_currency
  });
});

//show success page, after user buy concert tickets
app.get("/concert-success", (req, res) => {
  const path = resolve(process.env.STATIC_DIR + "/concert-success.html");
  console.log(path);
  res.sendFile(path);
})

// Challenge Section 3
// Challenge section 3: shows the lesson sign up page.
app.get("/lessons", (req, res) => {
  const path = resolve(process.env.STATIC_DIR + "/lessons.html");
  res.sendFile(path);
});

// Challenge Section 3
// Displays the account update page for a given customer
app.get("/account-update/:customer_id", (req, res) => {
  const path = resolve(process.env.STATIC_DIR + "/account-update.html");
  res.sendFile(path);
});


// Challenge section 3: '/schedule-lesson'
// Authorize a payment for a lesson
//
// Parameters:
// customer_id: id of the customer
// amount: amount of the lesson in cents
// description: a description of this lesson
//
// Example call:
// curl -X POST http://localhost:4242/schedule_lesson \
//  -d customer_id=cus_GlY8vzEaWTFmps \
//  -d amount=4500 \
//  -d description="Lesson on Feb 25th"
//
// Returns: a JSON response of one of the following forms:
// For a successful payment, return the payment intent:
//   {
//        payment: <payment_intent>
//    }
//
// For errors:
//  {
//    error:
//       code: the code returned from the Stripe error if there was one
//       message: the message returned from the Stripe error. if no payment method was
//         found for that customer return an msg "no payment methods found for <customer_id>"
//    payment_intent_id: if a payment intent was created but not successfully authorized
// }
app.post("/schedule-lesson", async (req, res) => {});


// Challenge section 3: '/complete-lesson-payment'
// Capture a payment for a lesson.
//
// Parameters:
// amount: (optional) amount to capture if different than the original amount authorized
//
// Example call:
// curl -X POST http://localhost:4242/complete_lesson_payment \
//  -d payment_intent_id=pi_XXX \
//  -d amount=4500
//
// Returns: a JSON response of one of the following forms:
//
// For a successful payment, return the payment intent:
//   {
//        payment: <payment_intent>
//    }
//
// for errors:
//  {
//    error:
//       code: the code returned from the error
//       message: the message returned from the error from Stripe
// }
//
app.post("/complete-lesson-payment", async (req, res) => {});


// Challenge section 3: '/delete-account'
// Deletes a customer object if there are no uncaptured payment intents for them.
//
// Parameters: 
//   customer_id: the id of the customer to delete
//
// Example request
//   curl -X POST http://localhost:4242/delete-account \
//    -d customer_id=cusXXX
//
// Returns 1 of 3 responses:
// If the customer had no uncaptured charges and was successfully deleted returns the response:
//   {
//        deleted: true
//   }
//
// If the customer had uncaptured payment intents, return a list of the payment intent ids:
//   {
//     uncaptured_payments: ids of any uncaptured payment intents
//   }
//
// If there was an error:
//  {
//    error: {
//        code: e.error.code,
//        message: e.error.message
//      }
//  }
//
app.post("/delete-account/:customer_id", async (req, res) => {});


// Challenge section 3: '/refund-lesson'
// Refunds a lesson payment.  Refund the payment from the customer (or cancel the auth
// if a payment hasn't occurred).
// Sets the refund reason to 'requested_by_customer'
//
// Parameters:
// payment_intent_id: the payment intent to refund
// amount: (optional) amount to refund if different than the original payment
//
// Example call:
// curl -X POST http://localhost:4242/refund-lesson \
//   -d payment_intent_id=pi_XXX \
//   -d amount=2500
//
// Returns
// If the refund is successfully created returns a JSON response of the format:
// 
// {
//   refund: refund.id
// }
//
// If there was an error:
//  {
//    error: {
//        code: e.error.code,
//        message: e.error.message
//      }
//  }
app.post("/refund-lesson", async (req, res) => {});


// Challenge section 3: '/calculate-lesson-total'
// Returns the total amounts for payments for lessons, ignoring payments
// for videos and concert tickets.
//
// Example call: curl -X GET http://localhost:4242/calculate-lesson-total
//
// Returns a JSON response of the format:
// {
//      payment_total: total before fees and refunds (including disputes), and excluding payments
//         that haven't yet been captured.
//         This should be equivalent to net + fee totals.
//      fee_total: total amount in fees that the store has paid to Stripe
//      net_total: net amount the store has earned from the payments.
// }
//
app.get("/calculate-lesson-total", (req, res) => {});


// Challenge section 3: '/find-customers-with-failed-payments'
// Returns any customer who meets the following conditions:
// The last attempt to make a payment for that customer failed.
// The payment method associated with that customer is the same payment method used
// for the failed payment, in other words, the customer has not yet supplied a new payment method.
//
// Example request: curl -X GET http://localhost:4242/find-customers-with-failed-payments
//
// Returns a JSON response with information about each customer identified and their associated last payment
// attempt and, if they have a payment method on file, info about the payment method
// {
//   <customer_id>:
//     customer: {
//       email: customer.email,
//       name: customer.name,
//       card_on_file: [true| false] returns whether a customer has a card associated with them.
//     },
//     payment_intent: {
//       created: created timestamp for the payment intent
//       description: description from the payment intent
//       status: the status of the payment intent
//       error: the error returned from the payment attempt
//     },
//     payment_method: {
//       last4: last four of the card stored on the customer
//       brand: brand of the card stored on the customer
//     }
//   },
//   <customer_id>: {},
//   <customer_id>: {},
// }
//
app.get("/find-customers-with-failed-payments", (req, res) => {});

function errorHandler(err, req, res, next) {
  res.status(500).send({ error: { message: err.message } });
}

app.use(errorHandler);

app.listen(4242, () => console.log(`Node server listening on port http://localhost:${4242}`));

