#!/usr/bin/env node

const argv = require('argv');
const co = require('co');
const fs = require('fs');
const path = require('path');
const qiniu = require('qiniu');

const {options} = argv.option([
  {
    name: 'source',
    short: 's',
    type: 'list,path',
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
  const dirs = Array.isArray(SOURCE_DIR) ? SOURCE_DIR : [SOURCE_DIR];
  const promises = [];
  dirs.reduce((previous, dir) => {
    readdir(dir).forEach(file => {
      previous.push(file);
    });
    return previous;
  }, []).forEach(file => {
    const filename = path.basename(file);
    promises.push(uploadFile(`${PREFIX}${filename}`, file));
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
  const ret = [];
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    if (!stats.isFile())
      return;
    ret.push(filePath);
  });
  return ret;
}
