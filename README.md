# Northcoders News API

Create two .env files for this project: .env.test and .env.development.  
  
Into .env.test add this line:  
```
PGDATABASE=PGDATABASE=nc_news_test
```

Into .env.development add this line:  
```
PGDATABASE=nc_news
```
  

Run the following command to setup the databases:
```
npm run setup-dbs
```