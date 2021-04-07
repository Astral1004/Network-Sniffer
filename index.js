"use strict";
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
const csrf = require("csurf");
//const fs = require('fs');
const toastr = require("express-toastr");
const cookieParser = require("cookie-parser");
const networkRoutes = require("./routes/network");
const statisticsRoutes = require("./routes/statistics");
const usersRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const accesscontrolRoutes = require("./routes/accessControl");
const errorRoutes = require("./routes/error");
const varMiddleware = require("./middleware/variable");
const keys = require("./keys/keys");
const {
  MONGODB_URI
} = require("./keys/keys");
const PORT = process.env.PORT || 3030;
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3030",
    credentials: true,
  },
});

// setInterval(() => {
//   console.log('memory: ', process.memoryUsage());
// }, 100);
require("./bin/io")(io);

const spawn = require("child_process").spawn;
let ls = spawn("WinDump.exe", ["-q", "-n"]);
let mongoNetworkCollection = require("./models/networkCollection");
let countDocuments = 1050;

setInterval(function () {
  sortedDB();
}, 5000);

function sortedDB() {
  mongoNetworkCollection.aggregate(
    [{
        $limit: countDocuments
      },
      {
        $group: {
          _id: {
            IpTO: "$IpTo",
            IpFROM: "$IpFrom",
            protocol: "$Protocol"
          },
          dups: {
            $addToSet: "$_id"
          },
          count: {
            $sum: 1
          },
          total: {
            $sum: "$Size"
          },
        },
      },
      {
        $project: {
          array: "$_id",
          _id: {
            $arrayElemAt: ["$dups", 0]
          },
          count: "$count",
          size: "$total",
          date: {
            $add: [(new Date().getTime() / 1000) | 0]
          },
        },
      },
    ],
    (err, results) => {
      if (err) console.log("Ошибка!!");
      try {
        if (results.length == 0) {} else {
          try {
            mongoose.connection
              .collection("SortedNetwork_collection")
              .insertMany(results)
              .catch(function (err) {
                console.log(err);
              });
            deleteDocuments();
          } catch (err) {
            console.log(err);
          }
        }
      } catch (err) {
        console.log("Ошибка при сортировки коллекции!");
      }
    }
  );
}

function deleteDocuments() {
  try {
    mongoNetworkCollection
      .find({})
      .sort({
        _id: 1
      })
      .limit(countDocuments)
      .exec((err, docs) => {
        if (docs.length > 0) {
          if (err) console.log("Ошибка в получение записей");
          const ids = docs.map((doc) => doc._id);
          mongoNetworkCollection.deleteMany({
            _id: {
              $in: ids
            }
          }, () => {});
        } else {}
      });
  } catch (err) {
    console.log(
      "Ошибка при  удалении " + countDocuments + "документов из коллекции"
    );
  }
}

let icmp6 = /ICMP6/i;
let icmp = /ICMP/i;
let udp = /UDP/i;
let tcp = /TCP/i;
let fs = require("fs");
const moment = require("moment");
let Lines = [];

function ss(data) {
  var Lines = data.toString("utf-8").trim().split("\n");
  console.log(Lines);
  for (var i = 0; i < Lines.length; i++) {
    if (icmp.test(Lines[i])) {
      new mongoNetworkCollection(JSONLineICMP(Lines[i].split(" "))).save();
      Lines.splice(i, 1);
    }
    if (tcp.test(Lines[i])) {
      new mongoNetworkCollection(JSONLineTCP(Lines[i].split(" "))).save();
      Lines.splice(i, 1);
    }
    if (udp.test(Lines[i])) {
      new mongoNetworkCollection(JSONLineIp(Lines[i].split(" "))).save();
      Lines.splice(i, 1);
    }
    Lines.splice(i, 1);
  }
}
ls.stdout.on("data", (data) => {
  ss(data);
});

ls.stderr.on("data", (data) => {
  console.log(`stderr: ${data}`);
});

ls.on("close", (code) => {
  console.log(`child process exited with code ${code}`);
});

function JSONLineIp(qlogData) {
  return {
    Time: qlogData[0] || "",
    Interface: qlogData[1] || "",
    IpTo: qlogData[2] || "",
    IpFrom: qlogData[4] || "",
    Protocol: qlogData[5] || "",
    Size: qlogData[7] || "",
  };
}

function JSONLineTCP(qlogData) {
  return {
    Time: qlogData[0] || "",
    Interface: qlogData[1] || "",
    IpTo: qlogData[2] || "",
    IpFrom: qlogData[4] || "",
    Protocol: qlogData[5] || "",
    Size: qlogData[6] || "",
  };
}

function JSONLineICMP(qlogData) {
  return {
    Time: qlogData[0] || "",
    Interface: qlogData[1] || "",
    IpTo: qlogData[2] || "",
    IpFrom: qlogData[4] || "",
    Protocol: qlogData[5] || "",
    Size: qlogData[13] || "",
  };
}

function JSONLineICMP6(qlogData) {
  return {
    Time: qlogData[0] || "",
    Interface: qlogData[1] || "",
    IpTo: qlogData[2] || "",
    IpFrom: qlogData[4] || "",
    Protocol: qlogData[5] || "",
    Size: qlogData[15] || "",
  };
}

process.on("SIGINT", async function () {
  console.log(" Завершение работы.....");
  process.exit(0);
});

const hbs = exphbs.create({
  defaultLayout: "main",
  extname: "hbs",
  helpers: require("./utils/hbs-healpers"),
});

const store = new MongoStore({
  collection: "sessions",
  uri: MONGODB_URI,
});
app.use(express.static(__dirname + "/public"));
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "views");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({
  extended: true
}));

app.use(cookieParser("secret code dude"));

app.use(
  session({
    secret: "secret code dude",
    key: "user_sid",
    resave: true,
    saveUninitialized: false,
    unset: "destroy",
    rolling: true,
    cookie: {
      maxAge: 600000,
    },
    store,
  }),
  function (req, res, next) {
    let num = req.session.cookie.maxAge;
    next();
  }
);

app.use(csrf());
app.use(flash());
app.use(varMiddleware);

app.use("/network", networkRoutes);
app.use("/statistics", statisticsRoutes);
app.use("/users", usersRoutes);
app.use("/", authRoutes);
app.use("/logout", authRoutes);
app.use("/accesscontrol", accesscontrolRoutes);
app.use("/error", errorRoutes);
async function start() {
  try {
    await mongoose.connect(keys.MONGODB_URI, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (e) {
    console.log(e);
  }
}

start();

async function del() {
  await Pacets.deleteMany({});
}

setInterval(async () => {
  del();
}, 6000000);