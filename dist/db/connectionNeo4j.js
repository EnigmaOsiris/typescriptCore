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
exports.NConnection = void 0;
const neo4j = require("neo4j-driver");
var AWS = require("aws-sdk");
class NConnection {
    constructor() {
        this.readDriver = null;
        this.writeDriver = null;
        this.connectionData = null;
    }
    getConnectionData() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res, rej) => {
                var ssm = new AWS.SSM({ region: process.env.regionAWS });
                var options = {
                    Name: process.env.NAME_PARAMETER,
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
    initializeWriterDriver() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.connectionData.uriWrite) {
                this.writeDriver = neo4j.driver(this.connectionData.uriWrite, neo4j.auth.basic(this.connectionData.user, this.connectionData.pass), {
                    encrypted: "ENCRYPTION_OFF",
                });
            }
        });
    }
    closeDrivers() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.readDriver.close();
            yield this.writeDriver.close();
        });
    }
    initializeReaderDriver() {
        if (this.connectionData.uriRead) {
            this.readDriver = neo4j.driver(this.connectionData.uriRead, neo4j.auth.basic(this.connectionData.user, this.connectionData.pass), {
                encrypted: "ENCRYPTION_OFF",
            });
        }
    }
    verifyData() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.connectionData) {
                this.connectionData = yield this.getConnectionData();
            }
        });
    }
    getReader() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.readDriver) {
                yield this.verifyData();
                this.initializeReaderDriver();
            }
            return this.readDriver;
        });
    }
    getWritter() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.writeDriver) {
                yield this.verifyData();
                this.initializeWriterDriver();
            }
            return this.writeDriver;
        });
    }
    getParameter() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.writeDriver) {
                yield this.verifyData();
                this.initializeWriterDriver();
            }
            return this.connectionData;
        });
    }
    static getInstance() {
        if (!NConnection.instance) {
            NConnection.instance = new NConnection();
        }
        return NConnection.instance;
    }
}
exports.NConnection = NConnection;
