import * as mongodb from "mongodb";

export default class DbClient {
    public static db: mongodb.Db;
    public static async connect() {
      const mongoUrl = process.env.DB_CONNECTION_STRING;
      console.log(mongoUrl)
      let connection = await mongodb.MongoClient.connect(mongoUrl,{ useUnifiedTopology: true, useNewUrlParser: true })
      this.db = connection.db("TABLE-TENNIS");
      console.log("Connected to db");
      return this.db;
    }
}