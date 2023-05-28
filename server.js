const express = require("express");

const app = express();

const users = [
  {
    id: "1",
    username: "ashwini",
    password: "ashwini008",
    isAdmin: true,
  },
  {
    id: "2",
    username: "mayuri",
    password: "mayuri008",
    isAdmin: false,
  },
];

app.post("/api/login", (req, res) => {
  //   const { username, password } = req.body;
  res.json("hey it works!");
});

app.listen(5000, () => {
  console.log("server is running on port 5000");
});
