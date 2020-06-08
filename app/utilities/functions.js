const path = require('path');

const createHash = (name, data) => crypto.createHash(`${name}`).update(`${data}`).digest('hex');

const checkFileType = (file, callback) => {
  // allowed ext
  const filetypes = /jpeg|jpg|png|gif|doc|docx|pdf/;
  // check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  // check mime
  const mimetype = filetypes.test(file.mimetype);

  // console.log('Mimetype ', mimetype);
  // console.log('ExtName ', extname);

  if (mimetype && extname) return callback(null, true);

  return callback('Error: Invalid file type');
};

module.exports = createHash;
module.exports = checkFileType;
