## Description
Study of the [NestJS](https://github.com/nestjs/nest) framework TypeScript.
This application has two modules: Auth module and Task module. An user can sign up and manage yours tasks. Jwt token is used to identify the logged in user allowing to perform operations with their tasks.

## Database
To run the application you must initialize the Postgres database. I created a docker-compose to startup the Postgres and the PgAdmin, case you prefer or need access the visual manage database. On the root project run the command below:

```bash
$ sudo docker-compose up -d
```

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

```
