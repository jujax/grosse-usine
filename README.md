# node-template

```
npm i -g yarn

yarn init

yarn add eslint prettier eslint-config-prettier eslint-plugin-prettier husky lint-staged --save-dev

npx husky install

npx husky add .husky/pre-commit "npx lint-staged"
```

# Using Prisma for PostgreSQL

This project now uses Prisma as the ORM for PostgreSQL. Follow the steps below to set up and use Prisma in your project.

## Setup

1. Install dependencies:

```sh
yarn install
```

2. Set up the PostgreSQL database using Docker:

```sh
docker-compose up -d
```

3. Apply Prisma migrations:

```sh
npx prisma migrate dev
```

4. Generate Prisma client:

```sh
npx prisma generate
```

## Usage

### Database Connection

The database connection is managed using Prisma. The Prisma client is instantiated and exported from `src/db.js`.

### Running the Application

To start the application, use the following command:

```sh
yarn start
```

This will build the project and start the server.

### Development

For development, you can use the following command to start the development server:

```sh
yarn start-dev
```

This will start the development server with hot-reloading enabled.

### Linting and Formatting

To lint the code, use the following command:

```sh
yarn lint
```

To automatically fix linting issues, use:

```sh
yarn lint:fix
```

To format the code, use:

```sh
yarn format
```
