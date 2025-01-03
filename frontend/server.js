// Simple express server to run frontend production build
const express = require("express");
const path = require("path");
const app = express();
require("dotenv").config();

const {
  REACT_APP_BACKEND_URL,
  REACT_APP_HOURS_CLOSE_TICKETS_AUTO,
  SERVER_PORT,
  REACT_APP_NAME_SYSTEM,
  REACT_APP_PRIMARY_COLOR,
  REACT_APP_PRIMARY_DARK,
  REACT_APP_NUMBER_SUPPORT
} = process.env;

app.use(express.static(path.join(__dirname, "build")));

app.get("/*", function (_req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(SERVER_PORT || 55371, () => {
  console.log(`Server is running on port ${SERVER_PORT || 3000}`);
  console.log(`Backend URL: ${REACT_APP_BACKEND_URL}`);
  console.log(
    `Close Tickets Auto Hours: ${REACT_APP_HOURS_CLOSE_TICKETS_AUTO}`
  );
  console.log(`System Name: ${REACT_APP_NAME_SYSTEM}`);
  console.log(`Primary Color: ${REACT_APP_PRIMARY_COLOR}`);
  console.log(`Primary Dark Color: ${REACT_APP_PRIMARY_DARK}`);
  console.log(`Support Number: ${REACT_APP_NUMBER_SUPPORT}`);
});
