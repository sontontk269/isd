const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const port = 4000;
const sqlite3 = require("sqlite3").verbose();
const auth = require("./middleware");
const DBSOURCE = "usersdb3.sqlite";

let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    // Cannot open database
    console.error(err.message);
    throw err;
  } else {
    db.serialize(() => {
      let salt = bcrypt.genSaltSync(10);
      db.run(
        `CREATE TABLE Users (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        Username text,
        Email text,
        Password text,
        Salt text,
        Token text,
        DateLoggedIn DATE,
        DateCreated DATE
        )`,
        (err) => {
          if (err) {
            // Table already created
            console.log(err);
          } else {
            // Table just created, creating some rows
            let insert =
              "INSERT INTO Users (Username, Email, Password, Salt, DateCreated) VALUES (?,?,?,?,?)";
            db.run(insert, [
              "user1",
              "user1@example.com",
              bcrypt.hashSync("user1", salt),
              salt,
              Date("now"),
            ]);
            db.run(insert, [
              "user2",
              "user2@example.com",
              bcrypt.hashSync("user2", salt),
              salt,
              Date("now"),
            ]);
            db.run(insert, [
              "user3",
              "user3@example.com",
              bcrypt.hashSync("user3", salt),
              salt,
              Date("now"),
            ]);
            db.run(insert, [
              "user4",
              "user4@example.com",
              bcrypt.hashSync("user4", salt),
              salt,
              Date("now"),
            ]);
          }
        }
      );
      db.run(
        `CREATE TABLE Infor_User (
    inforID INTEGER PRIMARY KEY AUTOINCREMENT,
    name text not null,
    des text,
    dob  date not null,
    address text not null,
    phone text not null
    )`,
        (err) => console.log(err)
      );

      db.run(
        `CREATE TABLE Blog(
      BlogID INTEGER PRIMARY KEY AUTOINCREMENT,
      title text not null,
      content text not null,
      type text,
      date date ,
      img text

    )`
      );

      db.run(
        `CREATE TABLE Food(
      postID INTEGER PRIMARY KEY AUTOINCREMENT,
      title text not null,
      content text not null,
      type text,
      date date ,
      img text,
      BlogID INTEGER,
      FOREIGN KEY (BlogID) REFERENCES Blog(BlogId)

    )`
      );

      db.run(
        `CREATE TABLE Shopping(
      postID INTEGER PRIMARY KEY AUTOINCREMENT,
      title text not null,
      content text not null,
      type text,
      date date ,
      img text,
      BlogID INTEGER,
      FOREIGN KEY (BlogID) REFERENCES Blog(BlogId)

    )`
      );

      db.run(
        `CREATE TABLE Travelling(
      postID INTEGER PRIMARY KEY AUTOINCREMENT,
      title text not null,
      content text not null,
      type text ,
      date date ,
      img text,
      BlogID INTEGER,
      FOREIGN KEY (BlogID) REFERENCES Blog(BlogId)

    )`
      );

      db.run(
        `CREATE TABLE pinPost(
      pinID INTEGER PRIMARY KEY AUTOINCREMENT,
      title text not null,
      content text not null,
      type text,
      date date ,
      img text,
      BlogID INTEGER,
      FOREIGN KEY (BlogID) REFERENCES Blog(BlogId)

    )`
      );
      //rating table
      db.run(
        `CREATE TABLE ratings (
  id INTEGER PRIMARY KEY,
  postID INTERGER ,
  userID INTEGER,
  rating INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(Id),
  FOREIGN KEY (postID) REFERENCES Blog(BlogId)
  );`
      );

      //LIKE TABLE
      db.run(`
  CREATE TABLE likes (
  id INTEGER PRIMARY KEY,
  userID INTEGER,
  postID INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(Id),
  FOREIGN KEY (postID) REFERENCES Blog(BlogId)
);

  `);
    });

  }
});

//cors config
app.use(
  express.urlencoded(),
  cors({
    origin: "http://localhost:3000",
  })
);

//handle api

app.get("/user", (req, res) => {
  let sqlPost = "SELECT * FROM Users";
  db.all(sqlPost, [], (err, rows) => {
    if (err) return console.log(err);
    res.send(rows);
  });
});

// Get user by ID
app.get("/user/:userID", async (req, res) => {
  const userID = req.params.userID;
  let getUser = "SELECT * FROM Users WHERE Id = ?"
  await db.all(getUser, [userID], (err, row) => {
    if (err) return console.log(err)
    
    res.send(row)
  })
})



app.get("/", (req, res) => {
  res.send("Hello World");
});

/* REGISTER */
app.post("/register", async (req, res) => {
  try {
    const { Email, Password, Username } = req.body;
    let userExists = false;
    let sqlCheck = "SELECT * FROM Users WHERE Email = ?";
    await db.all(sqlCheck, [Email], (err, result) => {
      if (err) {
        res.status(402).json({ error: err.message });
        return;
      }

      if (result.length === 0) {
        const salt = bcrypt.genSaltSync(10);

        const data = {
          Username: Username,
          Email: Email,
          Password: bcrypt.hashSync(Password, salt),
          Salt: salt,
          DateCreated: Date("now"),
        };

        let sql =
          "INSERT INTO Users (Username, Email, Password, Salt, DateCreated) VALUES (?,?,?,?,?)";
        const params = [
          data.Username,
          data.Email,
          data.Password,
          data.Salt,
          Date("now"),
        ];
        const user = db.run(sql, params, function (err, innerResult) {
          if (err) {
            res.status(400).json({ error: err.message });
            return;
          }
        });
      } else {
        userExists = true;
      }
    });
    setTimeout(() => {
      if (!userExists) {
        res.status(201).json("Success");
      } else {
        res.status(201).json("Record already exists. Please login");
      }
    }, 500);
  } catch (err) {
    console.log(err);
  }
});

/* LOGIN*/
app.post("/login", async (req, res) => {
  try {
    const { Email, Password } = req.body;
    console.log(req.body);
    // if (!(Email && Password)) {
    //   res.status(400).send("Missing Username and Password");
    // }
    let user = [];
    let login = "SELECT * FROM Users WHERE Email = ? ";
    await db.all(login, [Email], (err, rows) => {
      if (err) {
        res.status(400).json({ error: err.message });

        console.log(err);
        return;
      }
      console.log(rows);
      rows.forEach((row) => {
        user.push(row);
      });
      console.log(user);
      if (user.length === 0) {
        return res.status(400).send("User not found!");
      }

      const PHash = bcrypt.hashSync(Password, user[0].Salt);

      if (PHash === user[0].Password) {
        // Create JWT Token
        const token = jwt.sign(
          { user_id: user[0].Id, username: user[0].Username, Email },
          process.env.TOKEN_KEY,
          {
            expiresIn: "1h",
          }
        );
        user[0].Token = token;
      } else {
        return res.status(400).send("Wrong password");
      }

      return res.status(200).send(user);
    });
  } catch (err) {
    console.log(err);
  }
});

//test token
app.post("/api/test", auth, (req, res) => {
  res.status(200).send("Valid Token - Yay!");
});

// Information about User
app.post("/postinfor", async (req, res) => {
  const { Name, Des, DoB, Address, Phone } = req.body;

  let insertInfor =
    "UPDATE Infor_User SET name = ? , des = ?, dob = ?, address = ?, phone = ? WHERE inforID = 1 ";
  await db.run(insertInfor, [Name, Des, DoB, Address, Phone], (err) => {
    if (err) {
      console.log(err);
    } else {
      res.status(200).send("Update successfull!!");
    }
  });
});

app.get("/infor", (req, res) => {
  let sqlInfor = "SELECT * FROM Infor_User";
  db.all(sqlInfor, [], (err, infor) => {
    if (err) console.log(err);

    res.send(infor);
  });
});



//create post
app.post("/createpost", async (req, res) => {
  const { title, content, type, date, img } = req.body;

  let createPost =
    "INSERT INTO Blog(title, content, type, date, img) VALUES(?,?,?,?,?)";
  let classify = `INSERT INTO ${type}(BlogID,title, content, type, date, img) SELECT * FROM Blog WHERE Blog.type == "${type}" ORDER BY BlogID DESC LIMIT 1 `;
  await db.run(createPost, [title, content, type, date, img], (err) => {
    if (err) {
      console.log(err);
      return res.status(400).send("Create post failed!!");
    } else return res.status(200).send("Create post successfully!!");
  });

  await db.run(classify, [], (err) => {
    if (err) {
      console.log(err);
    } else console.log(`Create post in ${type} successfully!!`);
  });
});

app.get("/trending", (req, res) => {
  let sqlTrending = "SELECT * FROM Blog";
  db.all(sqlTrending, [], (err, post) => {
    if (err) console.log(err);

    res.send(post);
  });
});

app.get("/food", (req, res) => {
  let sqlTrending = "SELECT * FROM Food";
  db.all(sqlTrending, [], (err, post) => {
    if (err) console.log(err);

    res.send(post);
  });
});

// get post
app.get("/post/:id", async (req, res) => {
  const postID = req.params.id;
  let getpost = "SELECT * FROM Blog WHERE BlogID = ? ";
  await db.all(getpost, [postID], (err, post) => {
    if (err) console.log(err);

    res.send(post);
  });
});

// pin post
app.get("/pinpost/:id", async (req, res) => {
  const postID = req.params.id;
  let checkPin = "SELECT * FROM pinPost WHERE pinID =?";
  await db.all(checkPin, [postID], (err, row) => {
    if (err) console.log(err);

    if (row.length > 0) {
      console.log(row);
      res.status(400).send("This post was pin!!");
    } else {
      let pinPost =
        "INSERT INTO pinPost( title, content, type, date, img, BlogID) SELECT title, content, type, date, img, BlogID FROM Blog WHERE BlogID = ?";
      db.run(pinPost, [postID], (err) => {
        if (err) console.log(err);
        res.status(200).send("Pin blog successfully!!");
      });
    }
  });
});
//unpin post
app.get("/unpinpost/:id", (req, res) => {
  const postID = req.params.id;
  let checkUnpin = "SELECT * FROM pinPost WHERE  BlogID =?";
  db.all(checkUnpin, [postID], (err, row) => {
    if (err) console.log(err);

    if (row.length < 1) {
      res.status(400).send("This post was not pin !!");
    } else {
      let unpinpost = "DELETE FROM pinPost WHERE BlogID = ?";
      db.run(unpinpost, [postID], (err) => {
        if (err) console.log(err);
        res.status(200).send("Unpin blog successfully!!");
      });
    }
  });
});

// delete post
//sua type trc
app.delete("/deletepost/:type/:id", async (req, res) => {
  const postID = req.params.id;
  const type = req.params.type;
  console.log(postID);
  let deletepost = "DELETE FROM  Blog  WHERE BlogID = ?";
  await db.run(deletepost, [postID], (err) => {
    if (err) console.log(err);

    let deletepost2 = `DELETE FROM  ${type}  WHERE ${type}.BlogID = ?`;
    db.run(deletepost2, [postID], (err) => {
      if (err) console.log(err);

      res.send("deleted");
    });
  });
});

//  rating
app.post("/rate", (req, res) => {
  const { userID, postID, rating } = req.body;

  let insertRate = "INSERT INTO ratings(userID, postID) VALUES(?,?,?)";
  db.run(insertRate, [userID, postID, rating], (err) => {
    if (err) {
      console.log(err);
      return res.status(400).send("Rating fail!!");
    } else {
      // Calculate the average rating
      const averageQuery = `SELECT AVG(rating) AS average_rating FROM ratings`;

      db.get(averageQuery, (err, row) => {
        if (err) {
          console.error(err);
          res
            .status(500)
            .json({ error: "Failed to calculate average rating." });
        } else {
          const averageRating = row.average_rating;
          res
            .status(200)
            .json({ message: "Rating successful.", averageRating });
        }
      });
    }
  });
});

//check Like

app.post('/checkLike', (req, res) => {
  const { userID, postID } = req.body;
  let hasLike = false
  let checkLikes = "SELECT * FROM likes WHERE userID = ? AND postID=?"

  db.all(checkLikes, [userID, postID], (err, row) => {
    if (err) return console.log(err)
    
    if (row.length == 0) {
      res.status(200).json({hasLike})
      
    } else {
      hasLike = true
      res.json({hasLike})
    }

  })
})



// check rate
app.post("/checkRate", (req, res) => {
  const { userID, postID } = req.body;
  let hasRate = false;
  let checkRating = "SELECT * FROM ratings WHERE userID = ? AND postID=?";

  db.all(checkRating, [userID, postID], (err, row) => {
    if (err) return console.log(err);

    if (row.length == 0) {
      res.status(200).json({ hasRate });
    } else {
      hasRate = true;
      res.json({ hasRate });
    }
  });
});

//like post
app.post("/like", (req, res) => {
  const { userID, postID } = req.body;

  const insertLike = "INSERT INTO likes(userID, postID) VALUES(? ,?)";
  db.run(insertLike, [userID, postID], (err) => {
    if (err) {
      console.log(err);
      return res.status(400).send("Like fail!!");
    } else {
      // Calculate the total number of likes
      const countQuery = `SELECT COUNT(*) AS total_likes FROM likes`;

      db.get(countQuery, (err, row) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: "Failed to calculate total likes." });
        } else {
          const totalLikes = row.total_likes;
          res.status(200).json({ message: "Like successful.", totalLikes });
        }
      });
    }
  });
});

//unlike
app.post("/unlike", (req, res) => {
  const { userID, postID } = req.body;
  let unlike = `DELETE FROM likes WHERE userID = ? AND postID = ?`;
  db.run(unlike, [userID, postID], (err) => {
    if (err) {
      console.log(err);
      return res.status(400).send("Like fail!!");
    } else {
      res.status(200).json({ message: "Unlike successful." });
    }
  });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
