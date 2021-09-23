// import * as mongodb from "mongodb";
// import * as dotenv from 'dotenv';
// dotenv.config();

// export default class DbClient {
//     public static db: mongodb.Db;

//     public static async connect() {
//       const mongoUrl = process.env.DB_CONNECTION_STRING;
//       console.log(mongoUrl)
//       let connection = await mongodb.MongoClient.connect(mongoUrl,{ useUnifiedTopology: true, useNewUrlParser: true })
//       this.db = connection.db("momint");
//       console.log("Connected to db");
//       return this.db;
//     }
// }