/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../typings/es6-promise/es6-promise.d.ts" />
/// <reference path="../node_modules/pg/pg.d.ts" />

import {Common} from '../common/guest';
import {Promise}  from 'es6-promise';
import FS = require('fs');
import _ = require('lodash');
import * as SQL from 'sqlcmd-pg';
import * as iStore from './iguest-store'

export module Store {
    export class GuestStoreJSON implements iStore.Store.IGuestStore {
        constructor(private storePath: string) {}
        
        private save(guests:Common.Guest[]):Promise<{}> {
            let db:SQL.Connection = new SQL.Connection({"host":"localhost","user":"szg","database":"test"});
            let self:GuestStoreJSON = this;
            return new Promise(function(resolve, reject) {
                FS.writeFile(self.storePath, JSON.stringify(guests), function write(err:NodeJS.ErrnoException) {
                   err ? reject(err) : resolve();
                });
            });
        }
        
        private isGuestIdZero(guest:Common.Guest) : boolean {
            return guest.id == 0 ? true : false;
        }

        private read():Promise<string> {
            let self:GuestStoreJSON = this;
            return new Promise(function(resolve, reject) {
                FS.readFile(self.storePath, 'utf-8', function read(err:NodeJS.ErrnoException, data:string) {
                    err ? err.code === 'ENOENT' ? resolve('') : reject(err) : resolve(data);
                });
            });
        }

        getAll() : Promise<Common.Guest[]> {
            let path:string = this.storePath;
            let self:GuestStoreJSON = this;
            function createEmptyFile():Promise<{}> {
                return new Promise(function(resolve, reject) {
                    FS.stat(path, function(err:NodeJS.ErrnoException, stats:FS.Stats) {
                        err ? FS.open(path, 'a', function open(err:NodeJS.ErrnoException, fd:number) {
                                err ? reject(err) : FS.close(fd, function close(err:NodeJS.ErrnoException) {
                                    err ? reject(err) : resolve();
                                })
                            }) : resolve();
                    });
                });
            }
            return new Promise(function(resolve, reject) {
                createEmptyFile()
                .then(() => {
                    return self.read();
                })
                .then((data:string) => {
                    if (data.length == 0) {
                        resolve([]);
                    }
                    let result:Common.Guest[] = JSON.parse(data);
                    // result can contain any valid json.
                    // This must be handled to reject if not Common.Guest type.
                    // Take care of this !!!!!!
                    resolve(result);
                })
                .catch (function (err) {
                    reject(err);
                });
            });
        }
        
        getGuest(id:number):Promise<Common.Guest> {
            let path:string = this.storePath;
            let self:GuestStoreJSON = this;
            let requestedId:number = id;
            function isIdMatching(guest:Common.Guest):boolean {
                return guest.id == requestedId ? true : false;
            }
            return new Promise(function(resolve, reject) {
                self.getAll()
                .then((guests:Common.Guest[]) => {
                    let guest:Common.Guest = _.find(guests, isIdMatching);
                    guest ? resolve(guest) : reject('Guest not found'); 
                })
                .catch((err) => {
                    reject(err);
                });
            });
        }
        
        addGuest(newGuest: Common.Guest):Promise<Common.Guest> {
            let path:string = this.storePath;
            let self:GuestStoreJSON = this;
            let newGuestName:string = newGuest.name;
            function isGuestNameAlreadyUsed(element:Common.Guest) : boolean {
                return element.name === newGuestName ? true : false;
            }
            return new Promise(function(resolve, reject) {
                if (!self.isGuestIdZero(newGuest)) {
                    reject('Guest is not new');
                } else {
                    self.getAll()
                    .then((guests:Common.Guest[]) => {
                        if (_.find(guests, isGuestNameAlreadyUsed)) {
                            reject('Guest name is not unique');
                        } else {
                            guests = _.sortBy(guests, ['id']);
                            newGuest.id = guests.length == 0 ? 1 : _.last(guests).id + 1;
                            guests = _.concat(guests, [newGuest]);
                            self.save(guests)
                            .then(() => {
                                resolve(newGuest);
                            });
                        }
                    })
                    .catch((err) => {
                        reject(err);
                    });
                }
            });
        }
        
        updateGuest(updatedGuest:Common.Guest):Promise<Common.Guest> {
            let path:string = this.storePath;
            let self:GuestStoreJSON = this;
            let guestToUpdate:Common.Guest = updatedGuest;
            function isCorrectGuest(guest:Common.Guest) : boolean {
                return guest.id == guestToUpdate.id ? true : false;
            }
            function isGuestNameAlreadyUsed(element:Common.Guest) : boolean {
                return element.name === guestToUpdate.name ? true : false;
            }
            return new Promise(function(resolve, reject) {
                if (self.isGuestIdZero(updatedGuest)) {
                    reject('Guest is not added yet');
                } else {
                    self.getAll()
                    .then((guests:Common.Guest[]) => {
                        if (!_.isUndefined(_.find(guests, isGuestNameAlreadyUsed))) {
                            reject('Guest name already used');
                        } else {
                            let toBeRemoved:Common.Guest = _.find(guests, isCorrectGuest);
                            if (!_.isUndefined(toBeRemoved)) {
                                _.pull(guests, toBeRemoved);
                                guests = _.concat(guests, [guestToUpdate]);
                                guests = _.sortBy(guests, ['id']);
                                self.save(guests)
                                .then(() => {
                                    resolve(guestToUpdate);
                                });
                            } else {
                                reject("Can't find the guest");
                            }
                        }
                    })
                    .catch((err) => {
                        reject(err);
                    });
                }
            });
        }
        
        deleteGuest(id:number):Promise<{}> {
            let path:string = this.storePath;
            let self:GuestStoreJSON = this;
            let guestIdToDelete:number = id;
            function isCorrectGuest(guest:Common.Guest):boolean {
                return guest.id == guestIdToDelete ? true : false;
            }
            return new Promise(function(resolve, reject) {
                if (self.isGuestIdZero({"id":guestIdToDelete,"name":""})) {
                    reject('Guest is not added yet');
                } else {
                    self.getAll()
                    .then((guests:Common.Guest[]) => {
                        let toBeRemoved:Common.Guest = _.find(guests, isCorrectGuest);
                        if (!_.isUndefined(toBeRemoved)) {
                            _.pull(guests, toBeRemoved);
                            guests = _.sortBy(guests, ['id']);
                            self.save(guests)
                            .then(() => {
                                resolve();
                            });
                        } else {
                            reject("Can't find the guest");
                        }
                    })
                    .catch((err) => {
                        reject(err);
                    });
                }
            });
        }
    }
}