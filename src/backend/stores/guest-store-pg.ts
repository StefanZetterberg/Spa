/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../../../typings/es6-promise/es6-promise.d.ts" />
/// <reference path="../../../node_modules/pg/pg.d.ts" />

import {Common} from '../common/guest';
import {Promise}  from 'es6-promise';
import _ = require('lodash');
import * as SQL from 'sqlcmd-pg';
import * as iStore from './iguest-store'

export module Store {
    export class GuestStorePg implements iStore.Store.IGuestStore {
        private connection:SQL.Connection;
        constructor(private host:string, private database:string, private user:string, private password:string) {
        }

        private createTables(db:SQL.Connection):Promise<{}> {
            return new Promise((resolve, reject) => {
                let command = db.CreateTable('guests').add('id SERIAL PRIMARY KEY', 'name VARCHAR(256)').execute((error:Error) => {
                    error ? reject(error) : resolve();
                });
            });
        }

        private createDatabase(db:SQL.Connection):Promise<{}> {
            let self:GuestStorePg = this;
            return new Promise((resolve, reject) => {
                db.createDatabase((error:Error) => {
                    if (error) {
                        reject(error);
                    } else {
                        return self.createTables(db)
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            reject(err);
                        });
                    }
                });
            });
        }

        init():Promise<{}> {
            this.connection = new SQL.Connection({"host":this.host,"database":this.database,"user":this.user,"password":this.password});
            let self:GuestStorePg = this;
            return new Promise((resolve, reject) => {
                self.connection.databaseExists((error:Error, exists:boolean) => {
                    if (exists) {
                        self.connection.close();
                        resolve();
                    } else {
                        return self.createDatabase(self.connection)
                        .then(() => {
                            self.connection.close();
                            resolve();
                        })
                        .catch((err) => {
                            self.connection.close();
                            reject(err);
                        });
                    }
                });
            });
        }
        close():void {
            this.connection.close()
        }
        getAll():Promise<Common.Guest[]> {
            let self:GuestStorePg = this;
            return new Promise((resolve, reject) => {
                let command = self.connection.Select('guests').orderBy('id');
                command.execute((error:Error, result?:any[]) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
            });
        }
        getGuest(id:number):Promise<Common.Guest> {
            let self:GuestStorePg = this;
            return new Promise((resolve, reject) => {
                let command = self.connection.Select('guests').where('id = ?', id);
                command.execute((error:Error, result?:any[]) => {
                    if (error) {
                        reject(error);
                    } else {
                        result.length == 1 ? resolve(result[0]) : reject("Guest doesn't exist");
                    }
                });
            });
        }
        addGuest(newGuest: Common.Guest):Promise<Common.Guest> {
            let self:GuestStorePg = this;
            return new Promise((resolve, reject) => {
                if (newGuest.id != 0) {
                    reject('Guest already have an id');
                } else {
                    let command = self.connection.Insert('guests').add('name', newGuest.name).returning('*');
                    command.execute((error:Error, result?:any[]) => {
                        if (error) {
                            reject(error);
                        } else {
                            result.length == 1 ? resolve(result[0]) : reject('something went wrong');
                        }
                    });
                }
            });
        }
        updateGuest(updatedGuest:Common.Guest):Promise<Common.Guest> {
            let self:GuestStorePg = this;
            return new Promise((resolve, reject) => {
                if (updatedGuest.id == 0) {
                    reject("Guest doesn't exist");
                } else {
                    let command = self.connection.Update('guests').setEqual({name:updatedGuest.name}).whereEqual({id:updatedGuest.id}).returning('*');
                    command.execute((error:Error, result?:any[]) => {
                        if (error) {
                            reject(error);
                        } else {
                            result.length == 1 ? resolve(result[0]) : reject("Guest doesn't exist");
                        }
                    });
                }
            });
        }
        deleteGuest(id:number):Promise<{}> {
            let self:GuestStorePg = this;
            return new Promise((resolve, reject) => {
                if (id == 0) {
                    reject("Guest doesn't exist");
                } else {
                    self.getGuest(id)
                    .then((guest:Common.Guest) => {
                        let command = self.connection.Delete('guests').whereEqual({id:id});
                        command.execute((error:Error, result?:any[]) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve();
                            }
                        });
                    })
                    .catch((err) => {
                        reject(err);
                    });
                }
            });
        }
    }
}
