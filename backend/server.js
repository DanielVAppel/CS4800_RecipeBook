const express = require("express");
const path = require("path");
const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Router is in users.js
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const userRouter = require("./routes/users");

app.use("/users", userRouter);

app.listen(3000, () => {
	console.log("Server listening to port 3000");
});
