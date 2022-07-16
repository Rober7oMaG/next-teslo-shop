# Next.js Teslo Shop
To run locally, you need the database
```
docker-compose up -d
```

## Configure environment variables
Rename file __.env.template__ to __.env__

* Local MongoDB URL:
```
mongodb://localhost:27017/teslodb
```

* Rebuild node_modules and start Next
```
yarn install
yarn dev
```

## Fill database with test information
Call: 
```
http://localhost:3000/api/seed
```