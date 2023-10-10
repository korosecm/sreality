const express = require("express");
const cors = require("cors");
const app = express();
const { Client } = require("pg");
require("dotenv").config();
const port = process.env.PORT || 8080;

const whitelist = ["http://localhost:3000"];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.get("/", async (req, res) => {
  const jsonResponse = (responseObject, responseCode = 200) => {
    res.send(JSON.stringify(responseObject));
    console.log(
      new Date(),
      "-- Handled request:",
      req.method,
      req.url,
      responseCode
    );
  };

  const client = new Client({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    ssl: false,
  });
  await client.connect();

  var pageSize = 20;
  var numberOfRows, numberOfPages;
  var numberPerPage = 20;
  var page = 1;

  var limit = numberPerPage;

  const resTotal = await client.query(
    `SELECT COUNT(*) AS total FROM apartments;`
  );
  numberOfRows = resTotal.rows[0].total;
  numberOfPages = Math.ceil(numberOfRows / numberPerPage);

  if (req.query?.page) {
    page = req.query.page;
  }
  var offset = (page - 1) * numberPerPage;

  const entries = await client.query(
    `SELECT * FROM apartments LIMIT ${limit} OFFSET ${offset};`
  );
  const resObject = {
    items: entries.rows,
    pagination: {
      total_pages: numberOfPages,
      current: page,
      numberPerPage: numberPerPage,
      has_previous: page > 1,
      has_next: page < numberOfPages,
      last_page: Math.ceil(numberOfRows / pageSize),
    },
  };
  jsonResponse(resObject);

  // res.send({ message: "Hello World!" });
});

app.listen(port, () => {
  console.log(`Example app listening at Port: ${port}`);
});
