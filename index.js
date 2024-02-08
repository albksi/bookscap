import express from "express";
import pg from "pg";
import ejs from "ejs";
import bodyParser from "body-parser";
import axios from "axios";
import date from "date-and-time";

const db = new pg.Client({
  host: "localhost",
  port: 15432,
  database: "world",
  user: "postgres",
  password: "postgres",
});

db.connect();

// const express = require('express')
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

async function setupDB() {
  const result = await db.query("select * from book");
  //  console.log(result.rows);
  return result.rows;
}

app.use(express.static("public"));

app.get("/", async (req, res) => {
  const resultRows = await setupDB();
  res.render("index.ejs", { data: resultRows });
});

app.post("/edit", async (req, res) => {
  // console.log(req.body);
  res.render("edit.ejs", {
    data: {
      id: req.body.id,
      title: req.body.title,
      author: req.body.author,
      salient: req.body.salient,
      description: req.body.description,
      isbn: req.body.isbn,
      rating: req.body.rating,
    },
  });
});

app.post("/delete/:id", async (req, res) => {
  // console.log(req.body);
  const id = req.params.id;
  try {
    const res = await db.query(
      "DELETE FROM book where id=$1", [id]
    );
  } catch (error) {
    console.log(error);
  }

  res.redirect('/');

});

app.post("/sort", async (req, res) => {
  var resdata ;
  try {
      resdata = await db.query(
      "SELECT * FROM book ORDER BY rating DESC"
    );
  } catch (error) {
    console.log(error);
  }
  // console.log(resdata);
  res.render("index.ejs", { data: resdata.rows });
});


app.post("/recency", async (req, res) => {
  var resdata;
  try {
     resdata = await db.query(
      "SELECT * FROM book ORDER BY dateread DESC"
    );
  } catch (error) {
    console.log(error);
  }
  res.render("index.ejs", { data: resdata.rows });
});


app.post("/update", async (req, res) => {
  const id = req.body.bookId;
  const title = req.body.bookTitle;
  const author = req.body.bookAuthor;
  const salient = req.body.bookSalient;
  const description = req.body.bookDescription;
  const isbn = req.body.bookISBN;
  const rating = req.body.bookRating;

  // console.log(id, title, author, salient, description, isbn, rating);

  try {
    const res = await db.query(
      "UPDATE book SET title =$1, author=$2, salient=$3, description=$4, isbn=$5, rating=$6 WHERE id=$7",
      [title, author, salient, description, isbn, rating, id]
    );
  } catch (err) {
    console.log(err);
  }
  res.redirect("/");
});

app.get("/new", async (req, res) => {
  res.render("new.ejs");
});

app.post("/new", async (req, res) => {
  const title = req.body.bookTitle;
  const author = req.body.bookAuthor;
  const salient = req.body.bookSalient;
  const description = req.body.bookDescription;
  const isbn = req.body.bookISBN;
  const rating = req.body.bookRating;

  console.log(title, author, salient, description, isbn, rating);

  try {
    const res = await db.query(
      "INSERT INTO book(title, author, salient, description, isbn, rating) VALUES ($1, $2, $3, $4, $5, $6)",
      [title, author, salient, description, isbn, rating]
    );
  } catch (err) {
    console.log(err);
  }
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
