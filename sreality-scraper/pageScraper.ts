const { Client } = require("pg");
require("dotenv").config();

const scraperObject = {
  url: "https://www.sreality.cz/en/search/for-sale/apartments",
  async scraper(browser) {
    let pageIdx = 1;
    let properties = [];

    // Navigate to the selected page
    while (properties.length < 500) {
      let page = await browser.newPage();
      await page.goto(
        `https://www.sreality.cz/en/search/for-sale/apartments?page=${pageIdx}`
      );
      // Wait for the required DOM to be rendered
      await page.waitForSelector(".dir-property-list");
      // Get the link to all the required apartments
      let tmpData = await page.$$eval(".property", (links) => {
        links = links.map((el) => {
          return {
            title: el.querySelector(".title > .name").innerText,
            imageUrl: el.querySelector("img").src,
          };
        });
        return links;
      });
      properties = [...properties, ...tmpData];
      pageIdx += 1;
      page.close();
    }
    console.log(properties);

    // Connect to db
    const client = new Client({
      host: process.env.PG_HOST,
      port: process.env.PG_PORT,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
      ssl: false,
    });
    await client.connect();
    const res = await client.query("SELECT $1::text as connected", [
      "Connection to postgres successful!",
    ]);
    console.log(res.rows[0].connected);

    // Recreate table
    let dropTableQuery = "DROP TABLE IF EXISTS apartments";
    const resDrop = await client.query(dropTableQuery);
    let createTableQuery = `CREATE TABLE IF NOT EXISTS apartments(
        id int PRIMARY KEY NOT NULL,
        title varchar,
        imageUrl varchar
      );`;
    const resCreate = await client.query(createTableQuery);

    // Insert to db
    let insertRowQuery = `INSERT INTO apartments VALUES`;
    properties.forEach((el, idx) => {
      if (idx < properties.length - 1) {
        insertRowQuery += `(${idx}, '${el.title}', '${el.imageUrl}'),`;
      } else {
        insertRowQuery += `(${idx}, '${el.title}', '${el.imageUrl}');`;
      }
    });
    let insertRow = await client.query(insertRowQuery);
    console.log("Row inserted");

    await client.end();
  },
};

module.exports = scraperObject;
