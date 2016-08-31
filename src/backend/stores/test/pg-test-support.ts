/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="../../typings/es6-promise/es6-promise.d.ts" />
/// <reference path="../../node_modules/pg/pg.d.ts" />

import _ = require('lodash');
import {Promise}  from 'es6-promise';
import * as SQL from 'sqlcmd-pg';
import {Common} from '../../common/guest';

export module Store {
    export class PgTestSupport {
        private connection:SQL.Connection;
        private guestsToInsert:Common.Guest[] = [{id:0,name:'kalle'},{id:0,name:'nisse'},{id:0,name:'olle'}];
        public testGuests:Common.Guest[] = [{id:1,name:'kalle'},{id:2,name:'nisse'},{id:3,name:'olle'}];

        constructor(host:string, database:string, user:string, password:string) {
            this.connection = new SQL.Connection({'host':host,'database':database,'user':user,'password':password});
        }

        close():void {
            this.connection.close();
        }
        dropTestDatabase():Promise<{}> {
            let self:PgTestSupport = this;
            return new Promise((resolve, reject) => {
                self.connection.dropDatabase((error:Error) => {
                    error ? reject(error.message) : resolve();
                });
            });
        }

        removeTestDatabase():Promise<{}> {
            let self:PgTestSupport = this;
            return new Promise((resolve, reject) => {
                self.connection.databaseExists((error:Error, exists:boolean) => {
                    if (exists) {
                        self.dropTestDatabase()
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            reject(err);
                        })
                    } else {
                        resolve();
                    }
                });
            });
        }

        verifyGuestTable():Promise<{}> {
            let self:PgTestSupport = this;
            return new Promise((resolve, reject) => {
                self.connection.Select('guests').add('COUNT(id)', 'COUNT(name)').execute((error:Error, result:any[]) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
        }

        verifyDatabase():Promise<{}> {
            let self:PgTestSupport = this;
            return new Promise((resolve, reject) => {
                self.connection.databaseExists((error:Error, exists:boolean) => {
                    if (exists) {
                        self.verifyGuestTable()
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            reject(err);
                        });
                    } else {
                        reject(error);
                    }
                });
            });
        }

        createTestGuests():Promise<{}> {
            let self:PgTestSupport = this;
            function create(guest):Promise<{}> {
                return new Promise((resolve, reject) => {
                    let insertCommand = self.connection.Insert('guests').add('name', guest.name);
                    insertCommand.execute((error?:Error, result?:any[]) => {
                        if (error) {
                            reject("Couldn't add guest " + guest.name);
                        } else {
                            resolve();
                        }
                    });
                });
            }
            return new Promise((resolve, reject) => {
                Promise.all(self.guestsToInsert.map(create))
                .then(() => {resolve()}, (reason) => {reject(reason)});
            });
        }
    }
}