import React, { Suspense } from "react";
import { Router } from "@reach/router";
import EcoNav from "./EcoNavigation";

import Home from "../pages/Home";
import Videos from "../pages/Videos";
import Concert from "../pages/Concert";
import Lessons from "../pages/Lessons";
import ConcertSuccess from "../pages/ConcertSuccess";
import AccountUpdate from "../pages/AccountUpdate";
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';

import "../css/normalize.scss";


const stripePromise = loadStripe("pk_test_rER8AHTNoETz7UaT8bHbwXuA00zvCXYGUr");

const App = () => {
   
  return (
    <Elements stripe={stripePromise}>
    <React.StrictMode>
      <Suspense fallback="loading">
        <header>
          <EcoNav
            links={[
              { name: "Home", url: "/" },
              { name: "Video Courses", url: "/videos" },
              { name: "Concert Tickets", url: "/concert" },
              { name: "Music Lessons", url: "/lessons" },
            ]}
          />
        </header>
        {
          // Routes for principal UI sections.
          // Concert Tickets Challenge: /concert
          // Online Video Purchase: /video
          // Online Lessons: /lessons
        }
        <Router>
          <Home path="/" />
          <Videos path="/videos" />
          <Concert path="/concert" />
          <ConcertSuccess path="/concert-success/:id" />
          <Lessons path="/lessons" />
          <AccountUpdate path="/account-update/:id" />
        </Router>
      </Suspense>
    </React.StrictMode>
    </Elements>
  );
};

export default App;
