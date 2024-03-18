const express = require("express");
// const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

const PORT = 3001;
let clients = [];
let movies = [];

app.use(cors({
  origin : "*",
}));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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

  console.log(`Events connection started: client: ${clientId}`)

  request.on("close", () => {
    console.log(`Client ${clientId} Connection closed`);
    clients = clients.filter((client) => client.id !== clientId);
  });

  return

}

app.get("/events", eventsHandler);

// ...

function sendEventsToAllClients(newMovie) {
  // use response stream to send events to different clients
  clients.forEach((client) =>
    client.response.write(`data: ${JSON.stringify(newMovie)}\n\n`)
  );
}

async function addMovie(request, response, next) {
  const newMovie = request.body;
  newMovie.id = Date.now(); // you can use UUID package to generate unique ids
  movies.push(newMovie);
  response.json(newMovie);
  console.log(request.body)
  console.log(`Add Movie ${JSON.stringify(newMovie)}`)
  console.log(`Movies: ${JSON.stringify(movies)}`)

  //either send single newMovie or send the whole array, depends what you want
  sendEventsToAllClients(newMovie)
  return
}
/**
 * Route just to simulate the send events scenario,
 * In your case it could be DB update or any async operation completion
 */
app.post("/movie", addMovie);

app.listen(PORT, () => {
  console.log(`Movies Events service listening at http://localhost:${PORT}`);
});
