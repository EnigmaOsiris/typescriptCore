var Redshift = require('node-redshift');
var AWS = require("aws-sdk");
AWS.config.region = "us-east-1";
export class RedshiftConnection{
  redshiftClient:any;
  redshiftConnection:any;
    params = {
        host: String(process.env.host),
        port: String(process.env.port),
        user: String(process.env.user),
        password: String(process.env.password),
        database: String(process.env.dataBaseRS)
      };
 
      constructor(){
        try {
          console.log("Init conexion");
          this.init()
          this.redshiftClient = new Redshift(this.params,{rawConnection:false});
          
        } catch (error) {
          console.log("Error conexíon:\n",error);
          throw new Error(error); 
        }
      }

      public async init(){
        this.redshiftConnection= await this.getConnectionData();
      } 

      private async getConnectionData(): Promise<any | null> {
        return new Promise((res, rej) => {
          var ssm = new AWS.SSM({ region: process.env.region });
          var options = {
            Name: process.env.NAME_PARAMETER_RED,
            WithDecryption: true,
          };
          ssm.getParameter(options, function (err: any, data: any) {
            if (err) {
              console.log("Error get Parameter",err, err.stack); // an error occurred
            } else {
              const value = data.Parameter.Value;
              let resp = JSON.parse(value);
              res(resp);
            }
          });
        });
      }
}