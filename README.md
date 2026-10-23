# Chatting website (Node.js + Socket.IO)

Sign up, log in, view a profile and chat in rooms in real time with Socket.IO. Users are stored in MongoDB via Mongoose.

> Status: minimal runnable version. MongoDB is mocked by default; incomplete parts are marked `TODO`.

## Quick start (Docker)

```sh
make docker-run      # in-memory users, http://localhost:3000
make compose-up      # same app with a real MongoDB container
```

## Quick start (local, Node 10)

```sh
make setup           # npm install
make run             # in-memory users, http://localhost:3000
make run-mongo       # needs MongoDB on localhost:27017 (or set MONGO_URL)
```

Pages: `/` (login), `/Signupindex.html`, `/profile`, `/joinchat.html`, then the chat room.

## Mocks

- `USE_MOCKS=1` (default) swaps the Mongoose `User` model for `databaseoperations/mockUser.js`, an in-memory store. Users are lost on restart.
- `USE_MOCKS=0` uses MongoDB at `MONGO_URL` (default `mongodb://localhost:27017/User`).

## TODO

- TODO: passwords are stored and compared in plain text; hash them with bcrypt (already a dependency).
- TODO: the session secret in `server/server.js` is hard-coded; read it from the environment.
- TODO: `package.json` lists `node` and `nodemon` as runtime dependencies; move them out (`nodemon` to devDependencies).
- TODO: the tests in `server/utils/*.test.js` need `mocha` and `expect`, which are not in `package.json`.
