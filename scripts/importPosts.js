const path = require('path');
const chalk = require('chalk');
const axios = require('axios');
const sqlite = require('sqlite');
const SQL = require('sql-template-strings');

const dbPath = path.resolve(__dirname, '../db.sqlite');

const fetchPosts = async () => {
  try {
    const { data: posts } = await axios.get('https://jsonplaceholder.typicode.com/posts');
    console.log(chalk.blue(`Fetched ${posts.length} posts from API...`));
    return posts;
  } catch (err) {
    console.log(chalk.red(`Can\'t load posts: ${err}`));
  };
};

const savePostsToDb = async posts => {
  try {
    const db = await sqlite.open(dbPath);
    await createPostsTable(db);
    await insertPosts(posts, db);
    console.log(chalk.green('Saved all posts to DB!'));
  } catch (err) {
    console.log(chalk.red(`Can\'t save posts: ${err}`));
  }
};

const createPostsTable = async db => {
  await db.run(`DROP TABLE IF EXISTS Posts`);
  await db.run(`
    CREATE TABLE Posts (
      id INT PRIMARY KEY NOT NULL,
      userId INT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL
    )
  `);
};

const insertPosts = async (posts, db) => {
  const inserts = posts.map(p => 
    db.run(SQL`INSERT INTO Posts VALUES (${p.id}, ${p.userId}, ${p.title}, ${p.body})`));
  return Promise.all(inserts);
};

async function main() {
  const posts = await fetchPosts();
  await savePostsToDb(posts);
}

main();