//导入express
const express = require('express')
// 创建路由对象
const router = express.Router()

//导入处理函数
const tracksHandler = require('../router_handler/tracks_handler')

router.get('/queryMetadata', tracksHandler.queryMetadata)
router.get('/queryNetEase', tracksHandler.queryNetEase)
router.get('/queryLyric', tracksHandler.queryLyric)
router.get('/queryCover', tracksHandler.queryCover)
router.get('/getTracks', tracksHandler.getTracks)
//共享
module.exports = router