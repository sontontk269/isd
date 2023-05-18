db.serialize(() => {
  var salt = bcrypt.genSaltSync(10);
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
        var insert =
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

})
