const express = require("express");
const app = express();
const port = 3000;
const rateLimit = require("express-rate-limit");

app.use(express.json());

const users = [
  {
    username: "khachuong",
    password: "12345678",
    phoneNumber: "0823059750",
    permission: "admin",
  },
  {
    username: "duongcuong",
    password: "12345678",
    phoneNumber: "0987363522",
    permission: "user",
  },
];

const Joi = require("joi");

const schemaLogin = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    "string.base": `"username" should be a type of 'text'`,
    "string.empty": `"username" cannot be an empty field`,
    "string.min": `"username" should have a minimum length of {#limit}`,
    "string.max": `"username" should have a maximum length of {#limit}`,
    "any.required": `"username" is a required field`,
  }),
  password: Joi.string().required().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
});

const login = (req, res, next) => {
  var countVariable = 0;
  const { error } = schemaLogin.validate(req.body);
  if (error) {
    return res.send(error.details[0].message);
  }
  for (let i = 0; i <= users.length - 1; i++) {
    if (
      req.body.username == users[i].username &&
      req.body.password == users[i].password
    ) {
      req.user = users[i];
      next();
    } else {
      countVariable++;
    }
  }
  if (countVariable == users.length) {
    return res.send({
      isSuccess: false,
      message: "Đăng nhập không thành công",
    });
  }
};

const checkPermission = (req, res, next) => {
  const currentPermission = req.user.permission;
  if (currentPermission == "admin") {
    return res.redirect("/admin");
  } else {
    return (
      res.send({ isSuccess: true, message: "Bạn không phải admin" }), apiLimiter
    );
  }
};

const apiLimiter = rateLimit({
  windowMs: 0.05 * 60 * 1000,
  max: 2,
  message: "Bạn truy cập quá nhiều lần",
  standardHeaders: true,
});

app.post("/login", apiLimiter, login, checkPermission, (req, res) => {
});

app.get("/admin", (req, res) => {
  res.send("Xin chao admin");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
