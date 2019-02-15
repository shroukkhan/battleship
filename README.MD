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

## Project Structure

The code quite simple and still heavily commented to explain the logic behind each function . If curious, take a look at the source code.

Here is an explanation of the project structure and files: 

1. **serverless.yml** is the entry file for serverless project. REST Api routes are defined here. 
2. **lib** folder contains the source code
  - **controllers/api.ts**  /api/ related route functions are defined here. This is the entry and exit point of the code  based on the api.
  - **models** folder folder contains the data structure.
  - **models/dataModels** folder contains the user defined data structure / interfaces such as rest api command structure, response structure etc.
  - **models/entities** folder contains database entity models
  - **models/migrations** folder is used by TypeOrm to generate migrations
  - **models/subscribers** folder contains [TypeOrm event listeners](https://github.com/typeorm/typeorm/blob/master/docs/listeners-and-subscribers.md#what-is-a-subscriber) 
  - **services/gameService.ts** is the main game logic file.
  - **db.ts** file is used to open / close / sync connection with database by TypeOrm
  - **errorCodes.ts** contains the custom error codes used by the app
  - **logger.ts** simple console logger. We dont use bunyan or winston logger as of now, they dont  seem work well with aws cloud watch logging
  - **utilities.ts** various utilities functions used through out the app
3. **types** folder contains some custom type definition that was not readily available as `@types/` repository.
4. **.circleci** contains [circleci](https://circleci.com/) configuration.



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
