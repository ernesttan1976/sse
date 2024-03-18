import React, { useState, useCallback, useEffect } from "react";
import "./App.css";

function App() {
  const [facts, setFacts] = useState([]);
  const [listening, setListening] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const startEvents = () => {
    const events = new EventSource("http://localhost:3001/events");
    if (!listening) {
      events.onmessage = (event) => {
        console.log("======== Event ======", event);
        const parsedData = JSON.parse(event.data);
        console.log("========= parsedData =====", parsedData);
        setFacts((facts) => [parsedData, ...facts]);
      };

      setListening(true);
    }
  }

  useEffect(startEvents, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    fetch("http://localhost:3001/movie", {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: {
        'Content-Type': 'application/json'
      },
    }).then((response) => {
      console.log(response);
    }).catch((e) => {
      console.log(e);
    });
  }

  const handleRefresh = () => {
    startEvents()
  }

  return (
    <>
      <table className="stats-table">
        <thead>
          <tr>
            <th>Movie</th>
            <th>Title</th>
          </tr>
        </thead>
        <tbody>
          {facts.map((fact, i) => (
            <tr key={i}>
              <td>{fact.id}</td>
              <td>{fact.title}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={handleSubmit}>
        <label>
          Add A Movie Title
          <input type="text" name="title" value={formData.title}
            onChange={handleChange} />
        </label>
        <button type="submit">Add a Fact</button>
        <button onClick={handleRefresh}>{listening ? "Listening" : "Not Connected, click or refresh screen"}</button>
      </form>
    </>
  );
}

export default App;
