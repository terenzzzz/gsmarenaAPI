// 导入数据库操作模块
const db = require('../db/index')
const logger = require('../utils/logger');
// 导入加密模块
const bcrypt = require('bcryptjs')
const joi = require('joi')

// 导入生成 Token 字符串的包
const jwt = require('jsonwebtoken')
// 导入配置文件 
const config = require('../config')

// 注册用户的处理函数
exports.register = (req, res) => {
    // 密码规则: 8-16个字符，至少1个大写字母，1个小写字母和1个数字
    const userinfo = req.body
    // 检测是否被占用
    const sqlQuery = `select * from User where Email = ?`
    db.query(sqlQuery, userinfo.email, function (err, result) {
        if (err) {
            return res.send({ status: 1, message: err.message })
        }
        // 邮箱被占用
        if (result.length > 0) {
            logger.log("邮箱被占用，请更换其他用户名！",req.body)
            return res.cc('邮箱被占用，请更换其他用户名！')
        }
        // 邮箱可以使用
        if (userinfo.password != userinfo.confirmPassword) {
            logger.log("输入的两次密码不一致！",req.body)
            return res.cc('输入的两次密码不一致！')
        }
        // 加密密码
        userinfo.password = bcrypt.hashSync(userinfo.password, 10)
        // 添加到数据库
        const sqlInsert = `insert into User set ?`
        db.query(sqlInsert, { Email: userinfo.email, Password: userinfo.password }, function (err, result) {
            if (err) res.send({ status: 1, message: err.message })
            if (result.affectedRows !== 1) {
                logger.log("注册用户失败!",req.body)
                return res.cc('注册用户失败，请稍后再试')
            }
            logger.log("注册成功!",req.body)
            return res.send({ status: 200, message: '注册成功' })
        })
    })
}

// 登录的处理函数
exports.login = (req, res) => {
    const userinfo = req.body
    const sqlQuery = `select * from User where Email=?`
    db.query(sqlQuery, userinfo.email, function (err, results) {
        if (err) return res.cc(err)
        // 查询不到数据
        if (results.length !== 1) {
            logger.log("登录失败！查询不到数据",req.body)
            return res.cc('登录失败！')
        } 
        //判断密码是否正确
        const compareResult = bcrypt.compareSync(userinfo.password, results[0].Password)
        if (!compareResult) {
            logger.log("密码错误,登录失败！",req.body)
            return res.cc('密码错误,登录失败！')
        }
        // 密码正确
        // 剔除密码照片等信息
        const user = { ...results[0], password: '' }
        //生成Token
        const tokenStr = jwt.sign(user, config.jwtSecretKey, {})
        logger.log("登录成功！",req.body)
        return res.send({
            status: 200,
            message: '登录成功！',
            idUser: results[0].idUser,
            // 为了方便客户端使用 Token，在服务器端直接拼接上 Bearer 的前缀 
            token: 'Bearer ' + tokenStr,
        })
    })
}

exports.user = (req, res) => {
    const sqlQuery = `select idUser,email from User where idUser=?`
    db.query(sqlQuery, req.query.idUser, (err, results) => {
        if (err) return res.cc(err)
        if (results.length !== 1) {
            logger.log("获取用户基本信息失败！！",req.query)
            return res.cc('获取用户基本信息失败！')
        } 
        logger.log("获取用户基本信息成功！！",req.query)
        return res.send({ status: 200, message: '获取用户基本信息成功！', data: results[0] })
    })
}
