const sqlite3 = require('sqlite3');
const { db, client_mongodb } = require('../db/index')
const logger = require('../utils/logger');
const axios = require('axios');

const gsmarena = require('gsmarena-api');


const modelDB = new sqlite3.Database('/Users/terenzzzz/Desktop/model.db');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 连接到 MongoDB 数据库
async function connectToMongoDB() {
  try {
    // 连接到 MongoDB 服务器
    await client_mongodb.connect();
    console.log('Connected to the MongoDB database');
  } catch (error) {
    console.error('Error occurred while connecting to MongoDB:', error);
  }
}
connectToMongoDB();



exports.moveMysqlToMongo = async (req, res) => {
  try {
    // brands devices types
    const sqlQuery = `select * from devices`;
    const result = await new Promise((resolve, reject) => {
      db.query(sqlQuery, (err, result) => {
        if (err) {
          console.error('Error executing query:', err);
          reject(err);
          return;
        }
        resolve(result);
      });
    });
    const mongodbCollection = client_mongodb.db('tsp').collection('models');
    
    for (const row of result) {
      // delete row.id;
      await mongodbCollection.insertOne(row);
    }
    console.log("DONE!!!!!!!!!");
    return
  }catch (error) {
    console.error('Error:', error);
  }
}




exports.searchDeviceSlug = async (req, res) => {
  try {
    const sqlQuery = `select * from phone`;
    const result = await new Promise((resolve, reject) => {
      db.query(sqlQuery, (err, result) => {
        if (err) {
          console.error('Error executing query:', err);
          reject(err);
          return;
        }
        resolve(result);
      });
    });

    var count = 0
    let totalCount = result.length
    
    for (const row of result) {
      if (row.slug == null) {
        try {
          const devices = await gsmarena.search.search(row.model);
          if (devices[0]){
            let slug = devices[0].id
            let description = devices[0].description

            await new Promise((resolve, reject) => {
              db.query(
                'UPDATE phone SET slug = ?, description = ? where id = ?', 
                [slug, description, row.id], 
                (err, result) => {
                  if (err) {
                    console.error('Error updating row: ' + err.stack);
                    reject(err);
                    return;
                  }
                  count++
                  console.log(`Updated phone with ID ${row.id}. (${count}/${totalCount})`);
                  resolve();
                }
              );
            });
          }
        } catch (error) {
          if (error.response) {
            console.error('Error making request:', error.response.data);
          } else {
            console.error('Error making request:', error);
          }
          
          console.log('Pausing for 5 minutes due to error...');
          await sleep(3000000); // 暂停五分钟
        }
        await sleep(5000); // 暂停 
      }else{
        count++
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// 根据model名获取detail
exports.deviceDetail = async (req, res) => {
  try {
    const sqlQuery = `select * from devices`;
    const result = await new Promise((resolve, reject) => {
      db.query(sqlQuery, (err, result) => {
        if (err) {
          console.error('Error executing query:', err);
          reject(err);
          return;
        }
        resolve(result);
      });
    });

    var count = 0
    let totalCount = result.length
    
    for (const row of result) {
      if (row.specifications == null) {
        try {
          const devices = await gsmarena.search.search(row.name);
          if (devices[0]){
            let slug = devices[0].id

            const devicesDetail = await axios.get(`https://phone-specs-clzpu7gyh-azharimm.vercel.app/${slug}`)
            if (devicesDetail.data){
              let img = devicesDetail.data.data.thumbnail
              let detailSpec = devicesDetail.data.data.specifications
              let released = devicesDetail.data.data.release_date

              await new Promise((resolve, reject) => {
                db.query(
                  'UPDATE devices SET picture = ?, released_at = ?, specifications = ? where id = ?', 
                  [img,released, JSON.stringify(detailSpec), row.id], 
                  (err, result) => {
                    if (err) {
                      console.error('Error updating row: ' + err.stack);
                      reject(err);
                      return;
                    }
                    count++
                    console.log(`Updated phone detail with ID ${row.id}. (${count}/${totalCount})`);
                    resolve();
                  }
                );
              });
            }
          }
        } catch (error) {
          if (error.response) {
            console.error('Error making request:', error.response.data);
          } else {
            console.error('Error making request:', error);
          }
          
          console.log('Pausing for 5 minutes due to error...');
          await sleep(3000000); // 暂停五分钟
        }
        await sleep(10000); // 暂停 
      }else{
        count++
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}


// 从SQlite文件添加数据到Mysql
exports.getFromSQLite = (req, res) => {
  // logger.log("queryMetadata")
  modelDB.all('SELECT * FROM watch', (err, rows) => {
      if (err) {
          console.error(err.message);
          return;
      }
      rows.forEach((row) => {
          db.query(
            'INSERT INTO watch (brand, model) VALUES (?, ?)', 
            [row.brand, row.model], 
            (err, result) => {
              if (err) {
                console.error('Error inserting row: ' + err.stack);
                return;
              }
              console.log('Inserted row with ID ' + result.insertId);
            }
          );
        } )
  }); 
}


