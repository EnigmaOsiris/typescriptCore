const neo4j = require("neo4j-driver");
var AWS = require("aws-sdk");

export class NConnection {
  static instance: NConnection;
  private readDriver: any = null;
  private writeDriver: any = null;
  private connectionData: any = null;

  private constructor() {}

  private async getConnectionData(): Promise<any | null> {
    return new Promise((res, rej) => {
      var ssm = new AWS.SSM({ region: process.env.regionAWS });
      var options = {
        Name: process.env.NAME_PARAMETER,
        WithDecryption: true,
      };
      ssm.getParameter(options, function (err: any, data: any) {
        if (err) {
          console.log("Error get Parameter", err, err.stack); // an error occurred
        } else {
          const value = data.Parameter.Value;
          let resp = JSON.parse(value);
          res(resp);
        }
      });
    });
  }

  private async initializeWriterDriver(): Promise<void> {
    if (this.connectionData.uriWrite) {
      this.writeDriver = neo4j.driver(
        this.connectionData.uriWrite,
        neo4j.auth.basic(this.connectionData.user, this.connectionData.pass),
        {
          encrypted: "ENCRYPTION_OFF",
        }
      );
    }
  }

  

  public async closeDrivers(): Promise<any> {
    await this.readDriver.close();
    await this.writeDriver.close();
  }

  private initializeReaderDriver(): void {
    if (this.connectionData.uriRead) {
      this.readDriver = neo4j.driver(
        this.connectionData.uriRead,
        neo4j.auth.basic(this.connectionData.user, this.connectionData.pass),
        {
          encrypted: "ENCRYPTION_OFF",
        }
      );
    } 
  }

  private async verifyData() {
    if (!this.connectionData) {
      this.connectionData = await this.getConnectionData();
    }
  }

  public async getReader(): Promise<any> {
    if (!this.readDriver) {
      await this.verifyData();
      this.initializeReaderDriver();
    }
    return this.readDriver;
  }

  public async getWritter(): Promise<any> {
    if (!this.writeDriver) {
      await this.verifyData();
      this.initializeWriterDriver();
    }
    return this.writeDriver;
  }

  public async getParameter():Promise<any>{
    if (!this.writeDriver) {
      await this.verifyData();
      this.initializeWriterDriver();
    }
    return this.connectionData;
  }

  public static getInstance(): NConnection {
    if (!NConnection.instance) {
      NConnection.instance = new NConnection();
    }
    return NConnection.instance;
  }
}
