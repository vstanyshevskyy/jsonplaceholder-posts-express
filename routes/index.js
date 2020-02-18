const path = require('path');
const express = require('express');
const axios = require('axios');
const sqlite = require('sqlite');
const dbPath = path.resolve(__dirname, '../db.sqlite');

const router = express.Router();

const getPosts = async () => {
  const db = await sqlite.open(dbPath);
  return db.all('SELECT * FROM Posts ORDER BY id');
}

const getUsers = async () => {
  const { data: users } = await axios.get('https://jsonplaceholder.typicode.com/users');
  return users;
}

const usersToMap = (users) => {
  const map = new Map();
  users.forEach(user => {
    map.set(user.id, user)
  });
  return map;
}

const mapUsersToPosts = (users, posts) => {
  return posts.map(({ userId, ...post }) =>
    ({ ...post, author: users.get(userId)}));
}

router.get('/', async function(req, res, next) {
  try {
    const posts = await getPosts();
    const users = await getUsers();
    const usersMap = usersToMap(users);
    const postsWithAuthors = mapUsersToPosts(usersMap, posts);
    res.render('index', { posts: postsWithAuthors });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
