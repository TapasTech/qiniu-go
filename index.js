const argv = require('argv');
const co = require('co');
const fs = require('fs');
const path = require('path');
const qiniu = require('qiniu');

const {options} = argv.option([
  {
    name: 'source',
    short: 's',
    type: 'path',
    description: 'File directory ready to upload',
  },
  {
    name: 'bucket',
    short: 'b',
    type: 'string',
    description: 'Qiniu bucket',
  },
  {
    name: 'prefix',
    short: 'p',
    type: 'string',
    description: 'Link prefix',
  },
  {
    name: 'ak',
    type: 'string',
    description: 'Qiniu access key',
  },
  {
    name: 'sk',
    type: 'string',
    description: 'Qiniu secret key',
  },
]).run();

const {
  prefix: PREFIX,
  bucket: BUCKET,
  source: SOURCE_DIR,
  ak: AK = process.env.QINIU_DTCJ_AK,
  sk: SK = process.env.QINIU_DTCJ_SK,
} = options;

qiniu.conf.ACCESS_KEY = AK;
qiniu.conf.SECRET_KEY = SK;

co(function *() {
  const files = yield readdir(SOURCE_DIR);
  const promises = [];
  files.forEach(file => {
    const filePath = path.join(SOURCE_DIR, file);
    const stats = fs.statSync(filePath);
    if (!stats.isFile())
      return;
    promises.push(uploadFile(`${PREFIX}${file}`, filePath));
  });
  return yield promises;
})
.then(ret => {
  console.log(JSON.stringify(ret, null, 2));
  console.log('upload done!');
})
.catch(err => {
  console.error(err);
});

/**
 * @desc upload file...
 * @param {String} key file path on CDN
 * @param {String} filePath local file path
 * @return {Promise}
 */
function uploadFile(key, filePath) {
  const uptoken = getUptoken(key);
  const extra = new qiniu.io.PutExtra();
  return new Promise((resolve, reject) => {
    qiniu.io.putFile(uptoken, key, filePath, extra, (err, ret) => {
      if (err)
        return reject(err);
      resolve(ret);
    });
  });
}

function getUptoken(key) {
  const putPolicy = new qiniu.rs.PutPolicy(`${BUCKET}:${key}`);
  return putPolicy.token();
}

function readdir(dir) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(files);
    });
  });
}
