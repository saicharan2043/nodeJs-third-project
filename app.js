const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
const newDBPath = path.join(__dirname, "./todoApplication.db");
app.use(express.json());

let db = null;

const initilazationDBAndServer = async () => {
  try {
    db = await open({
      filename: newDBPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => console.log("server is running"));
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initilazationDBAndServer();

app.get("/todos/", async (request, Response) => {
  const todoDetails = request.query;
  const { priority, status, search_q = "" } = request.query;
  const isPriorityTrue = (todoDetails) => {
    if (todoDetails.priority !== undefined) {
      return true;
    }
  };

  const isStatusTrue = (todoDetails) => {
    if (todoDetails.status !== undefined) {
      return true;
    }
  };

  const isStatusPriorityTrue = (todoDetails) => {
    if (
      todoDetails.priority !== undefined &&
      todoDetails.status !== undefined
    ) {
      return true;
    }
  };

  let sqlQuery = null;
  switch (true) {
    case isStatusPriorityTrue(todoDetails):
      sqlQuery = `select * from todo where priority='${priority}' and status = '${status}'`;
      break;
    case isPriorityTrue(todoDetails):
      sqlQuery = `select * from todo where priority='${priority}'`;
      break;
    case isStatusTrue(todoDetails):
      sqlQuery = `select * from todo where status='${status}'`;
      break;
    default:
      sqlQuery = `select * from todo where todo Like '%${search_q}%'`;
      break;
  }
  const dbResponse = await db.all(sqlQuery);
  Response.send(dbResponse);
});

app.get("/todos/:todoId/", async (request, Response) => {
  const { todoId } = request.params;
  const dbQuery = `
        select * from todo where id = ${todoId};
    `;
  const dbResponse = await db.get(dbQuery);
  Response.send(dbResponse);
});

app.post("/todos/", async (request, Response) => {
  const todoDetails = request.body;
  const { todo, id, priority, status } = todoDetails;
  const sqlQuery = `
        insert into todo(
            id , todo , priority , status
        )
        values (${id} , '${todo}' , '${priority}' , '${status}')
    `;
  const dbResponse = await db.run(sqlQuery);
  const todoId = dbResponse.lastID;
  Response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, Response) => {
  const todoDetails = request.body;
  const { todo, priority, status } = todoDetails;
  const { todoId } = request.params;
  console.log(status);
  if (todo !== undefined) {
    const sqlQuery = `
        update todo set todo = '${todo}'
      `;
    const dbResponse = await db.run(sqlQuery);
    Response.send("Todo Updated");
  } else if (priority !== undefined) {
    const sqlQuery = `
        update todo set priority = '${priority}'
      `;
    const dbResponse = await db.run(sqlQuery);
    Response.send("Priority Updated");
  } else {
    const sqlQuery = `
        update todo set status = '${status}'
      `;
    const dbResponse = await db.run(sqlQuery);
    Response.send("Status Updated");
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const sqlQuery = `
        delete from todo where id = ${todoId};
    `;
  await db.run(sqlQuery);
  response.send("Todo Deleted");
});

module.exports = app;
