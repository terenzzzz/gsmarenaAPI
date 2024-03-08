//导入 mysql 模块
const mysql = require('mysql')
const { MongoClient } = require('mongodb');

// 创建一个 MySQL 连接池
const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '592592',
    database: 'device'
});

// 连接字符串
const uri = 'mongodb+srv://zhicong:x5pJMEE8POpoCQk8@tsp-1.biuiwqp.mongodb.net/'; // 默认端口27017

// 创建一个 MongoDB 客户端
const client_mongodb = new MongoClient(uri);

// 导出 MySQL 连接池和 MongoDB 客户端
module.exports = {
    db: db,
    client_mongodb: client_mongodb
};