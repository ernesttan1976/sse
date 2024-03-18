import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [facts, setFacts] = useState([]);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    const events = new EventSource("http://localhost:3000/events");
    if (!listening) {
      events.onmessage = (event) => {
        console.log("======== Event ======", event);
        const parsedData = JSON.parse(event.data);
        console.log("========= parsedData =====", parsedData);
        setFacts((facts) => [parsedData, ...facts]);
      };

      setListening(true);
    }
  }, [listening, facts]);

  return (
    <table className="stats-table">
      <thead>
        <tr>
          <th>Fact</th>
          <th>Source</th>
        </tr>
      </thead>
      <tbody>
        {facts.map((fact, i) => (
          <tr key={i}>
            <td>{fact.id}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default App;
