const bcrypt = require('bcryptjs');

const hash = '$2b$10$WiqJkhNPAGwj.MS88Mzsce5zzsVUbAVsiQCuveYHmcYOZ0QQhaCEi';
const plain = '1234';

bcrypt.compare(plain, hash)
  .then(console.log)
  .catch(console.error);
