# qiniuGo

往七牛传静态文件

## run

```bash
node index.js \
--source=dist \
--source=dist/images \
--bucket=hugo-assets \
--prefix=test/ \
--ak=${ACCESS_KEY} \
--sk=${SECRET_KEY}
```

## options

* source 目标文件夹，文件夹下所有文件会被上传到cdn，现在只能传一级文件夹，但可以设置多个source值
* bucket 目标bucket名称
* prefix 链接前缀
* ak 七牛access key，也可以设置全局变量`QINIU_DTCJ_AK`
* sk 七牛secret key，也可以设置全局变量`QINIU_DTCJ_SK`
