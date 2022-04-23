const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

const PORT = 3000;
let clients = [];
let movies = [];

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/status", (request, response) =>
  response.json({ clients: clients.length })
);

function eventsHandler(request, response, next) {
  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  };
  response.writeHead(200, headers);

  const data = `data: ${JSON.stringify(movies)}\n\n`;

  response.write(data);

  const clientId = Date.now();

  const newClient = {
    id: clientId,
    response,
  };
  /**
   * register client's response stream which eventually
   * will get used to send events to client
   */

  clients.push(newClient);

  request.on("close", () => {
    console.log(`${clientId} Connection closed`);
    clients = clients.filter((client) => client.id !== clientId);
  });
}

app.get("/events", eventsHandler);

// ...

function sendEventsToAllCliets(newMovie) {
  // use response stream to send events to different clients
  clients.forEach((client) =>
    client.response.write(`data: ${JSON.stringify(newMovie)}\n\n`)
  );
}

async function addMovie(request, respsonse, next) {
  const newMovie = request.body;
  newMovie.id = Date.now(); // you can use UUID package to generate unique ids
  movies.push(newMovie);
  respsonse.json(newMovie);
  return sendEventsToAllCliets(newMovie);
}
/**
 * Route just to simulate the send events scenario,
 * In your case it could be DB update or any async operation completion
 */
app.post("/movie", addMovie);

app.listen(PORT, () => {
  console.log(`Movies Events service listening at http://localhost:${PORT}`);
});
