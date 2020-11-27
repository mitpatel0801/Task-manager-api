const express = require("express");
require("./db/mongoose");
const userRouter = require("./routers/user");
const tasksRouter = require("./routers/tasks");

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(userRouter);
app.use(tasksRouter);


app.listen(port, () => {
    console.log("listening on port:" + port)
})