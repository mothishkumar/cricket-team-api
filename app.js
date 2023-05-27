const express = require("express");
const app = express();
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

app.use(express.json());

const dbPath = path.join(__dirname, "students.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/student/", async (request, response) => {
  const getStudentQuery = `
          select *
          from student;
          `;
  const students = await db.all(getStudentQuery);
  response.send(students);
});

app.get("/student/", async (request, response) => {
  const {
    offset = 2,
    limit = 5,
    search_q = "",
    order = "ASC",
    order_by = "id",
  } = request.query;
  const getstudentQuery = `
    SELECT
      *
    FROM
     student
    WHERE
     name LIKE '%${search_q}%'
     ORDER BY ${order_by} ${order}
    LIMIT ${limit} OFFSET ${offset};`;
  const studentArray = await db.get(getstudentQuery);
  response.send(studentArray);
});

module.exports = app;
