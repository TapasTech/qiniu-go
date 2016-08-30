# qiniu-go

往七牛传静态文件

## how to use

install

```bash
npm i -D TapasTech/qiniu-go
```

run

```bash
node_modules/.bin/qiniu-go \
--source=dist \
--source=dist/images \
--bucket=hugo-assets \
--prefix=test/ \
--ak=${ACCESS_KEY} \
--sk=${SECRET_KEY}
```

## options

* source 目标文件夹，文件夹下所有文件会被上传到cdn，现在只能传一级文件夹，但可以设置多个source值
* extension 只上传选定拓展名的文件，可以设置多个extension
* bucket 目标bucket名称
* prefix 链接前缀
* ak 七牛access key，也可以设置全局变量`QINIU_DTCJ_AK`
* sk 七牛secret key，也可以设置全局变量`QINIU_DTCJ_SK`
