// MOCK: in-memory stand-in for the mongoose User model (databaseoperations/mongoop.js).
// Used when USE_MOCKS=1 so the app runs without MongoDB. Data is lost on restart.
// TODO: passwords are stored and compared in plain text here and in mongoop.js; hash them with bcrypt.
const users = [];
let nextId = 1;

module.exports = {
  create(data, callback) {
    const taken = users.some(u => u.username === data.username || u.email === data.email);
    if (taken) return callback(new Error('duplicate username or email'));
    const user = Object.assign({ _id: String(nextId++), friends: { names: [] }, online: false }, data);
    users.push(user);
    callback(null, user);
  },
  find(query, callback) {
    const found = users.filter(u => Object.keys(query).every(k => String(u[k]) === String(query[k])));
    callback(null, found.length ? found : null);
  },
  authenticate(username, password, callback) {
    const user = users.find(u => u.username === username);
    if (!user) {
      const err = new Error('User not found.');
      err.status = 401;
      return callback(err);
    }
    return user.password === password ? callback(null, user) : callback();
  }
};
