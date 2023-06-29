# News API

News API that serves data from a PostgreSQL database consisting of articles, comments, topics and users.  
  
A hosted version of this project can be found [here](https://news-api-qn5t.onrender.com/).  
(Please allow 30 seconds for it to spin up before viewing)  
  
## Tech:  
* Node.js
* Express
* PostgreSQL
* Jest  
  
## Available Endpoints  
  
A list of available endpoints can also be requested through the API by calling `GET /api`  
```
GET /api
GET /api/topics
GET /api/articles
POST /api/articles
GET /api/articles/:article_id
PATCH /api/articles/:article_id
GET /api/articles/:article_id/comments
POST /api/articles/:article_id/comments
GET /api/users
GET /api/users/:username
PATCH /api/comments/:comment_id
DELETE /api/comments/comment_id
```  
  
## Setup  
  
1. Create two .env files for this project: `.env.test` and `.env.development`.  
  
Into `.env.test` add this line:  
```
PGDATABASE=PGDATABASE=nc_news_test
```
  
Into `.env.development` add this line:  
```
PGDATABASE=nc_news
```
  
  
2. Install dependencies:  
```
npm install
```
  
  
3. Setup the databases:  
```
npm run setup-dbs
```
  
  
4. Tests can be run using a separate test database:  
```
npm test
```
  
  
5. Seed the data:  
```
npm run seed
```
  
  
6. Start the server:  
```
npm start
```
  
The server will now be listening for requests on port 9090.

## Prerequisites  
  
This project was built using Node.js v20.2.0 and PostgreSQL v15.3.  
  
## Dependencies  
  
```
"dotenv": "^16.0.0",
"express": "^4.18.2",
"pg": "^8.7.3",
"pg-format": "^1.0.4"
```