// 导入 express 模块 
var express = require('express');
// 创建 express 的服务器实例 
var app = express();

// 导入 cors 中间件 
const cors = require('cors')
// 将 cors 注册为全局中间件 
app.use(cors())

//配置解析 application/x-www-form-urlencoded 格式的表单数据的中间件
app.use(express.urlencoded({ extended: false }))




const modelRouter = require('./router/model')
app.use('/', modelRouter)



// 部署使用
// 开启服务
const host = '0.0.0.0';
const port = process.env.PORT || 3002;


app.listen(port, host, function () {
    console.log('api server running at http://' + host + ':' + port)
})