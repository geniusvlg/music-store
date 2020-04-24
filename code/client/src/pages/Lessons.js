import React, { useState, useEffect } from "react";
import RegistrationForm from "../components/RegistrationForm";
import "../css/lessons.scss";

//Lessons main component
const Lessons = () => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];
  const [sessions, setSessions] = useState([]); //info about available sessions
  const [selected, setSelected] = useState(-1); //index of selected session
  const [details, setDetailes] = useState(""); //details about selected session


  //format session's date
  const formatSession = (index, id, session, time) => {
    let date = session.getDate();
    if (date <= 9) {
      date = "0" + date;
    }
    date = `${date} ${months[session.getMonth()]} ${time}`;
    return { index, id, title: date, selected: "" };
  };

  //toggle selected session
  const toggleItem = (index) => {
    let items = sessions;
    if (selected !== -1) {
      items[selected].selected = "";
    }
    items[index].selected = "selected";
    setSelected(index);
    setSessions(items);
    setDetailes(
      `You have requested a lesson for ${items[index].title} Please complete the registration form to reserve your lesson.`
    );
  };
  //Load sessions info.
  useEffect(() => {
    let items = [];
    let session = new Date();

    session.setDate(session.getDate() + 9);
    items.push(formatSession(0, "first", session, "3:00 p.m."));

    session.setDate(session.getDate() + 5);
    items.push(formatSession(1, "second", session, "4:00 p.m."));

    session.setDate(session.getDate() + 7);
    items.push(formatSession(2, "third", session, "5:00 p.m."));

    setSessions(sessions.concat(items));
  }, []);


  return (
    <main className="main-lessons">
      <div className="sr-title">
        <h2>Guitar lessons</h2>
      </div>
      <div className="sr-instructions">
        Choose from one of our available lessons to get started.
      </div>
      <div className="sr-body">
        {
          //Component to process user info for registration.
        }
        <RegistrationForm selected={selected} details={details} />
        {
          //Generate HTML for each session.
        }
        <div id="sr-items" className="sr-items">
          {sessions.map((session) => (
            <div
              className={`sr-item ${session.selected}`}
              id={session.id}
              key={session.index}
            >
              <button2
                id={session.id}
                onClick={() => toggleItem(session.index)}
              >
                {session.title}
              </button2>
            </div>
          ))}
        </div>
        <div className="eco-items">
          <div className="eco-product-img">
            <img src="/assets/img/guitar.jpg" alt="" />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Lessons;
