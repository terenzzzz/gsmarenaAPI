//导入express
const express = require('express')
// 创建路由对象
const router = express.Router()

//导入处理函数
const modelHandlerer = require('../router_handler/model_handler')


router.get('/getFromSQLite', modelHandlerer.getFromSQLite)
router.get('/deviceDetail', modelHandlerer.deviceDetail)
router.get('/moveMysqlToMongo', modelHandlerer.moveMysqlToMongo)

router.get('/mongoQuery', modelHandlerer.mongoQuery)

//共享
module.exports = router