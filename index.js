const path = require("path");
const express = require("express");
const ejs = require("ejs");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv").config();

// mongodb 관련 모듈
const MongoClient = require("mongodb").MongoClient;

let db = null;
MongoClient.connect(process.env.MONGO_URL, { useUnifiedTopology: true }, (err, client) => {
  console.log("db연결");
  if (err) {
    console.log(err);
  } else {
    console.log("voca-app연결");
  }
  db = client.db("voca-app");
}); // db연결 끝---------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// post방식으로 가져온값 body로 받아서 출력하려면 위 내용 !

app.set("port", process.env.PORT || 8099);
const PORT = app.get("port");

app.get("/", (req, res) => {
  res.send("Hello voca-app");
});

app.post("/day/add", (req, res) => {
  // 여기에 day로 들어오는 값을 받아서 db에 밀어넣기..
  // console.log(req.body.day);
  db.collection("counter").findOne({ name: "count" }, (err, result) => {
    // counert 에서name이 count인것을 찾아서------------------1
    const insertData = {
      day: req.body.day,
      id: result.daysTotal,
      // 들어오는값들 지정한 후
    };
    db.collection("days").insertOne(insertData, (err, result) => {
      // days db에 위에서 들어온값을 밀어넣고---------------2
      db.collection("counter").updateOne({ name: "count" }, { $inc: { daysTotal: 1 } }, (err, result) => {
        // days에 밀어넣으면 name이 count인것을 daysTotal +1로 업데이트해라---------------------------------3
        if (err) {
          console.log(err);
        }
        res.json({ insert: "ok" });
      });
    });
  });
});

app.post("/voca/add", (req, res) => {
  db.collection("counter").findOne({ name: "count" }, (err, result) => {
    // counert 에서name이 count인것을 찾아서------------------1
    const insertData = {
      day: parseInt(req.body.day),
      eng: req.body.eng,
      kor: req.body.kor,
      // isDone: Boolean(req.body.isDone),
      isDone: Boolean(req.body.isDone),
      id: result.vocasTotal,
      // 들어오는값들 지정한 후
    };
    db.collection("vocas").insertOne(insertData, (err, result) => {
      // days db에 위에서 들어온값을 밀어넣고---------------2
      db.collection("counter").updateOne({ name: "count" }, { $inc: { vocasTotal: 1 } }, (err, result) => {
        // days에 밀어넣으면 name이 count인것을 daysTotal +1로 업데이트해라---------------------------------3
        if (err) {
          console.log(err);
        }
        res.json({ insert: "ok" });
      });
    });
  });
});

app.get("/days", (req, res) => {
  db.collection("days")
    .find()
    .toArray((err, result) => {
      res.json(result); //   페이지 내가 만들어서 보내주기
    });
});

app.get("/voca/:day", (req, res) => {
  // console.log(req.params.day);
  const _day = parseInt(req.params.day);
  // db연결하고 해당되는것의 모든 데이터를 받아서 json으로 리턴하기...
  db.collection("vocas")
    .find({ day: _day })
    .toArray((err, result) => {
      console.log(result);
      res.json(result);
    });
});
app.delete("/voca/:id", (req, res) => {
  // console.log("=====", req.params.id);
  // res.send("delete");
  const _id = parseInt(req.params.id);
  db.collection("vocas").deleteOne({ id: _id }, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.json({ delete: "ok" });
    }
  });
});
app.put("/voca/:id", (req, res) => {
  const _id = parseInt(req.params.id);
  const _isDone = Boolean(req.body.isDone);
  console.log(_isDone);
  db.collection("vocas").updateOne({ id: _id }, { $set: { isDone: _isDone } }, (err, result) => {
    // if (err) {
    //   console.log(err);
    // } else {
    res.json({ update: "ok" });
    // }
  });
});

app.listen(PORT, () => {
  console.log(`${PORT}에서 서버 대기중`);
});
