"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedshiftConnection = void 0;
var Redshift = require('node-redshift');
var AWS = require("aws-sdk");
AWS.config.region = "us-east-1";
class RedshiftConnection {
    constructor() {
        this.params = {
            host: String(process.env.host),
            port: String(process.env.port),
            user: String(process.env.user),
            password: String(process.env.password),
            database: String(process.env.dataBaseRS)
        };
        try {
            console.log("Init conexion");
            this.init();
            this.redshiftClient = new Redshift(this.params, { rawConnection: false });
        }
        catch (error) {
            console.log("Error conexíon:\n", error);
            throw new Error(error);
        }
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.redshiftConnection = yield this.getConnectionData();
        });
    }
    getConnectionData() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res, rej) => {
                var ssm = new AWS.SSM({ region: process.env.region });
                var options = {
                    Name: process.env.NAME_PARAMETER_RED,
                    WithDecryption: true,
                };
                ssm.getParameter(options, function (err, data) {
                    if (err) {
                        console.log("Error get Parameter", err, err.stack); // an error occurred
                    }
                    else {
                        const value = data.Parameter.Value;
                        let resp = JSON.parse(value);
                        res(resp);
                    }
                });
            });
        });
    }
}
exports.RedshiftConnection = RedshiftConnection;
