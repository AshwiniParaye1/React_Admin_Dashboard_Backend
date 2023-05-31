const express = require("express");

const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());

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

let refreshTokens = [];

// refresh and regenerate access token
app.post("/api/refresh", (req, res) => {
  //take the refresh token from user
  const refreshToken = req.body.token;

  //send error ig token is not valid
  if (!refreshToken) return res.status(401).json("You are not authenticated!");

  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json("Refresh token is not valid!");
  }
  jwt.verify(refreshToken, "refreshSecretKey", (err, user) => {
    err && console.log(err);
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateAccessToken(user);

    refreshTokens.push(newRefreshToken);
    res
      .status(200)
      .json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  });

  //if evereything ok, create new access token, refresh token and send to user
});

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, isAdmin: user.isAdmin },
    "secretKey",
    //token expiration time
    { expiresIn: "30s" }
  );
};
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, "refreshSecretKey");
};

//login api
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => {
    return u.username === username && u.password === password;
  });
  if (user) {
    //generate access token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.push(refreshToken);

    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
      accessToken,
      refreshToken,
    });
  } else {
    res.status(400).json("Username or Password incorrect!");
  }
});

//delete user
const verify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, "secretKey", (err, user) => {
      if (err) {
        return res.status(403).json("Token is not valid!");
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json("You are not authenticated!");
  }
};

app.delete("/api/users/:userId", verify, (req, res) => {
  if (req.user.id === req.params.userId || req.user.isAdmin) {
    res.status(200).json("User has been deleted!");
  } else {
    res.status(403).json("You are not allowed to delete this user");
  }
});

app.listen(5000, () => {
  console.log("server is running on port 5000");
});
