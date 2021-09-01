import * as express from "express";
import * as bodyParser from "body-parser";
import * as mongodb from 'mongodb';
import routes from '../routes/index';
import DbClient from "../services/db-client";
import * as fileUpload from 'express-fileupload'
var cors = require('cors')
class App {
  public app: express.Application;

  constructor() {
    // Creating express and adding config to the express app
    this.app = express();
    this.config();
    // General routes
    this.app.use(cors());
    this.app.use("/api",routes);
  }

  private config(): void {
    // support application/json type post data
    this.app.use(bodyParser.json());
    //support application/x-www-form-urlencoded post data
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(
      fileUpload({
        createParentPath: true
      })
    )
  }
}
export default new App().app;