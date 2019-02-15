## Introduction
Fun little off-hour project battleship game. Works as a back-end   
battleship game engine. This project provides a set of `REST API` endpoints  
which can generate a battleship game, keep track of progress and notify when the game   
is over.  
  
Can be easily combined with a mobile app to provide real user experience of two person co-op gaming

## Tech Stack

 1. **AWS Lambda Function / Api Gateway :** The project is using AWS microservice framework , through use of [Serverless](https://serverless.com/framework/docs/providers/aws/guide/quick-start/) 
. As a result, every function is written as a self contained container ( Lambda Function ) and Can be accessed through a REST Api endpoint exposed by AWS Api gateway.  It is possible to update individual functions without affecting the others . Only thing the endpoints share is database. However, it is possible to run the app locally through the use of Serverless offline
2. **TypeScript**:  The sourcecode is written using typescript `^2.2.2` through use of [Serverless TypeScript Plugin](https://github.com/prisma/serverless-plugin-typescript) 
3. **MySQL + TypeORM :** Using MySQL / MariaDB as database Provider. On AWS , it uses RDS Service. TypeORM is used for entity modelling and can also be used to switch to other supported databases, such as MongoDB or Postgresql
4. **Jest + Lambda Tester : ** [Jest](https://jestjs.io/)  is used for unit testing  and [Lambda Tester](https://www.npmjs.com/package/lambda-tester) is used for e2e api testing.  A working postman script is also provided here [![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/cce9ddc8504fc6afbc27)


It uses formatted console logging, because it works well with AWS CloudWatch Logging.

## Getting Started ( Offline Mode) 
You can run the app in offline mode ( as in , not through aws ) by using serverless offline plugin ( already included )

 - Run [yarn](https://yarnpkg.com/en/docs/install#) to install dependencies : 

> yarn
 - Make necessary credential changes to `config.sls_offline.json` file.
 - Make sure the database mentioned in `config.sls_offline.json` file is created already
 - Deploy database by running:
> yarn db:deploy
- Do test by running: 
> yarn test
- Build app by running:
> yarn build
- Run offline server:
> yarn sls:offline

## Deploying to amazon ( Online Mode ) 

 1. Setup [serverless](https://serverless.com/framework/docs/providers/aws/guide/quick-start/) 
2. Run : 
> yarn sls:deploy
