/// <reference path='../../typings/mocha/mocha.d.ts' />
/// <reference path='../../typings/chai/chai.d.ts' />

import FS = require('fs');
import {Store} from '../guest-store-json';
import {Common} from '../../common/guest';
import chai = require('chai');
var expect = chai.expect;

describe('testing guest-store-json', () => {
    function fileExists(path:string):boolean {
        try {
            let stat:FS.Stats = FS.statSync(path);
            return stat.isFile();
        }
        catch(err) {
            return false;
        }
    }
    function removeFile(path:string):void {
        try {
            try {
                FS.unlink(path);
            }
            catch(err) {
            }
        }
        catch(err) {
        }
    }

    describe('testing getAllGuests', () => {
        let resourcePath:string = '';
        let expectedGuestsResult:string = '';

        before(() => {
            resourcePath = './test-resources/test.json';
            try {
                let data:string = FS.readFileSync(resourcePath, 'utf-8');
                expectedGuestsResult = JSON.parse(data);
            }
            catch(err) {
                throw new Error(err.message);
            }
        });

        it('should return all guest upon request', (done) => {
            let uut = new Store.GuestStoreJSON(resourcePath);
            uut.getAll().then((data : Common.Guest[]) => {
                expect(data).to.deep.equal(expectedGuestsResult);
                done();
            })
            .catch((err : string) => {
                done(err);
            });
        });
    
        it('should return failure if invalid json', (done) => {
            let uut = new Store.GuestStoreJSON('./test-resources/invalid_test.json');
            uut.getAll().then((data : Common.Guest[]) => {
                done(new Error('This should never happen'));
            })
            .catch((err : string) => {
                done();
            });
        });
    
        it('should return empty if file is missing and creates the file', (done) => {
            let path:string = './test-resources/non_existing.json';
            if (fileExists(path)) {
                removeFile(path);
            }
            let uut:Store.GuestStoreJSON = new Store.GuestStoreJSON(path);
            uut.getAll().then((data : Common.Guest[]) => {
                expect(data.length).to.be.equal(0);
                if (fileExists(path)) {
                    removeFile(path);
                    done();
                } else {
                    done(new Error('File ' + path + ' should have been created'));
                }
            })
            .catch((err : string) => {
                done(err);
            });
        });
    
        it('should return failure if file contains non guest json', (done) => {
            let uut = new Store.GuestStoreJSON('./test-resources/non_guest.json');
            uut.getAll().then((data : Common.Guest[]) => {
                done(new Error('Coding for typechecking JSON is not done!!!!'));
            })
            .catch((err : string) => {
                done();
            });
        });
    });

    describe('testing guest-store addGuest', () => {
    
        let resourcePath : string = './test-resources/guestTestStore.json';
        let uut = new Store.GuestStoreJSON(resourcePath);
   
        before(() => {
            if (fileExists(resourcePath)) {
                removeFile(resourcePath);
            }
        });
   
        afterEach(() => {
            if (fileExists(resourcePath)) {
                removeFile(resourcePath);
            }
        });

        it('should not add guest if id not zero', (done) => {
            let newGuest: Common.Guest = { id: 1, name: 'nisse'};
            uut.addGuest(newGuest).then((data : Common.Guest) => {
                done(new Error('This should not happen since guest id is not zero'));
            })
            .catch((err : string) => {
                expect(err).to.be.equal('Guest is not new');
                done();
            })
            .catch((err:string) => {
               done(err); 
            });
        });

        it('should add very first guest and give it id 1', (done) => {
            let newGuest: Common.Guest = { id: 0, name: 'nisse'};
            uut.addGuest(newGuest).then((data : Common.Guest) => {
                expect(data.id).to.be.equal(1);
                done();
            })
            .catch((err : string) => {
                done(err);
            });
        });

        it('should add several guests with unique ids', (done) => {
            let newGuest1: Common.Guest = { id: 0, name: 'nisse'};
            let newGuest2: Common.Guest = { id: 0, name: 'olle'};
            let newGuest3: Common.Guest = { id: 0, name: 'kalle'};
            uut.addGuest(newGuest1)
            .then((data:Common.Guest) => {
                expect(data.id).to.be.equal(1);
            })
            .then(() => {
                return uut.addGuest(newGuest2);
            })
            .then((data:Common.Guest) => {
                expect(data.id).to.be.equal(2);
            })
            .then(() => {
                return uut.addGuest(newGuest3);
            })
            .then((data:Common.Guest) => {
                expect(data.id).to.be.equal(3);
            })
            .then(() => {
                return uut.getAll();
            })
            .then((data:Common.Guest[]) => {
                let expectedResult:Common.Guest[] = [{id:1,name:'nisse'},{id:2,name:'olle'},{id:3,name:'kalle'}];
                expect(data).to.deep.equal(expectedResult);
                done();
            })
            .catch((err:string) => {
                done(err);
            });
        });
    });

    describe('testing guest-store getGuest', () => {
    
        let resourcePath : string = './test-resources/guestTestStore.json';
        let uut = new Store.GuestStoreJSON(resourcePath);
   
        before(() => {
            if (fileExists(resourcePath)) {
                removeFile(resourcePath);
            }
        });
        
        afterEach(() => {
            if (fileExists(resourcePath)) {
                removeFile(resourcePath);
            }
        });

        function createGuests():Promise<{}> {
            return new Promise(function (resolve, reject) {
                uut.addGuest({"id": 0,"name":"kalle"})
                .then(() => {
                    return uut.addGuest({"id":0,"name":"olle"});
                })
                .then(() => {
                    return uut.addGuest({"id":0,"name":"nisse"});
                })
                .then(() => {
                    resolve();
                });
            });          
        };
   
        it('should get very first added guest', (done) => {
            createGuests()
            .then(() => {
                return uut.getGuest(1);
            })
            .then((guest:Common.Guest) => {
                expect(guest).to.deep.equal({"id":1,"name":"kalle"});
                done();
            })
            .catch((err) => {
                done(err);
            });
        });

        it('should get very last added guest', (done) => {
            createGuests()
            .then(() => {
                return uut.getGuest(3);
            })
            .then((guest:Common.Guest) => {
                expect(guest).to.deep.equal({"id":3,"name":"nisse"});
                done();
            })
            .catch((err) => {
                done(err);
            });
        });
        
        it('should get a guest in the middle of the list', (done) => {
            createGuests()
            .then(() => {
                return uut.getGuest(2);
            })
            .then((guest:Common.Guest) => {
                expect(guest).to.deep.equal({"id":2,"name":"olle"});
                done();
            })
            .catch((err) => {
                done(err);
            });
        });
        
        it('should get fail if guest is missing', (done) => {
            createGuests()
            .then(() => {
                return uut.getGuest(0);
            })
            .then((guest:Common.Guest) => {
                console.log()
                done(new Error('Should not return any guest for id 0'));
            })
            .catch((err:string) => {
                uut.getGuest(10)
                .then((guest:Common.Guest) => {
                    done(new Error('Should not return any guest for id 10'));
                })
                .catch((err:string) => {
                    uut.getGuest(-3)
                    .then((guest:Common.Guest) => {
                        done(new Error('Should not return any guest for id -3'));
                    })
                    .catch((err:string) => {
                        done();
                    });
                });
            });
        });
    });
    
    describe('testing guest-store updateGuest', () => {
    
        let resourcePath : string = './test-resources/guestTestStore.json';
        let uut = new Store.GuestStoreJSON(resourcePath);
   
        before(() => {
            if (fileExists(resourcePath)) {
                removeFile(resourcePath);
            }
        });
        
        afterEach(() => {
            if (fileExists(resourcePath)) {
                removeFile(resourcePath);
            }
        });

        function createGuests():Promise<{}> {
            return new Promise(function (resolve, reject) {
                uut.addGuest({"id": 0,"name":"kalle"})
                .then(() => {
                    return uut.addGuest({"id":0,"name":"olle"});
                })
                .then(() => {
                    return uut.addGuest({"id":0,"name":"nisse"});
                })
                .then(() => {
                    resolve();
                });
            });          
        };
   
        it('should update the guest with the first id', (done) => {
            createGuests()
            .then(() => {
                return uut.getAll();
            })
            .then((guests:Common.Guest[]) => {
                expect(guests).to.deep.equal([{"id":1,"name":"kalle"},{"id":2,"name":"olle"},{"id":3,"name":"nisse"}]);                
            })
            .then(() => {
                return uut.updateGuest({"id":1,"name":"gunnar"});
            })
            .then((guest:Common.Guest) => {
                expect(guest).to.deep.equal({"id":1,"name":"gunnar"});
                return uut.getAll();
            })
            .then((guests:Common.Guest[]) => {
                expect(guests).to.deep.equal([{"id":1,"name":"gunnar"},{"id":2,"name":"olle"},{"id":3,"name":"nisse"}]);
                done();
            })
            .catch((err:string) => {
                done(err);
            });
        });
   
        it('should update the guest with given id', (done) => {
            createGuests()
            .then(() => {
                return uut.getAll();
            })
            .then((guests:Common.Guest[]) => {
                expect(guests).to.deep.equal([{"id":1,"name":"kalle"},{"id":2,"name":"olle"},{"id":3,"name":"nisse"}]);                
            })
            .then(() => {
                return uut.updateGuest({"id":2,"name":"gunnar"});
            })
            .then((guest:Common.Guest) => {
                expect(guest).to.deep.equal({"id":2,"name":"gunnar"});
                return uut.getAll();
            })
            .then((guests:Common.Guest[]) => {
                expect(guests).to.deep.equal([{"id":1,"name":"kalle"},{"id":2,"name":"gunnar"},{"id":3,"name":"nisse"}]);
                done();
            })
            .catch((err:string) => {
                done(err);
            });
        });
   
        it('should fail updating guest that would duplicate name', (done) => {
            createGuests()
            .then(() => {
                return uut.getAll();
            })
            .then((guests:Common.Guest[]) => {
                expect(guests).to.deep.equal([{"id":1,"name":"kalle"},{"id":2,"name":"olle"},{"id":3,"name":"nisse"}]);                
            })
            .then(() => {
                return uut.updateGuest({"id":2,"name":"kalle"});
            })
            .then(() => {
                done(new Error('This should not happen since name is duplicated'));
            })
            .catch((err:string) => {
                expect(err).to.be.equal('Guest name already used');
                done();
            })
            .catch((err) => {
                done(err);
            });
        });
   
        it('should update the guest with last id', (done) => {
            createGuests()
            .then(() => {
                return uut.getAll();
            })
            .then((guests:Common.Guest[]) => {
                expect(guests).to.deep.equal([{"id":1,"name":"kalle"},{"id":2,"name":"olle"},{"id":3,"name":"nisse"}]);                
            })
            .then(() => {
                return uut.updateGuest({"id":3,"name":"gunnar"});
            })
            .then((guest:Common.Guest) => {
                expect(guest).to.deep.equal({"id":3,"name":"gunnar"});
                return uut.getAll();
            })
            .then((guests:Common.Guest[]) => {
                expect(guests).to.deep.equal([{"id":1,"name":"kalle"},{"id":2,"name":"olle"},{"id":3,"name":"gunnar"}]);
                done();
            })
            .catch((err:string) => {
                done(err);
            });
        });
    });
    
    describe('testing guest-store deleteGuest', () => {
    
        let resourcePath : string = './test-resources/guestTestStore.json';
        let uut = new Store.GuestStoreJSON(resourcePath);
   
        before(() => {
            if (fileExists(resourcePath)) {
                removeFile(resourcePath);
            }
        });
        
        afterEach(() => {
            if (fileExists(resourcePath)) {
                removeFile(resourcePath);
            }
        });

        function createGuests():Promise<{}> {
            return new Promise(function (resolve, reject) {
                uut.addGuest({"id": 0,"name":"kalle"})
                .then(() => {
                    return uut.addGuest({"id":0,"name":"olle"});
                })
                .then(() => {
                    return uut.addGuest({"id":0,"name":"nisse"});
                })
                .then(() => {
                    resolve();
                });
            });          
        };
   
        it('should delete the guest with the first id', (done) => {
            createGuests()
            .then(() => {
                return uut.getAll();
            })
            .then((guests:Common.Guest[]) => {
                expect(guests).to.deep.equal([{"id":1,"name":"kalle"},{"id":2,"name":"olle"},{"id":3,"name":"nisse"}]);                
            })
            .then(() => {
                return uut.deleteGuest(1);
            })
            .then(() => {
                return uut.getAll();
            })
            .then((guests:Common.Guest[]) => {
                expect(guests).to.deep.equal([{"id":2,"name":"olle"},{"id":3,"name":"nisse"}]);
                done();
            })
            .catch((err:string) => {
                done(err);
            });
        });
   
        it('should delete the guest with the given id', (done) => {
            createGuests()
            .then(() => {
                return uut.getAll();
            })
            .then((guests:Common.Guest[]) => {
                expect(guests).to.deep.equal([{"id":1,"name":"kalle"},{"id":2,"name":"olle"},{"id":3,"name":"nisse"}]);                
            })
            .then(() => {
                return uut.deleteGuest(2);
            })
            .then(() => {
                return uut.getAll();
            })
            .then((guests:Common.Guest[]) => {
                expect(guests).to.deep.equal([{"id":1,"name":"kalle"},{"id":3,"name":"nisse"}]);
                done();
            })
            .catch((err:string) => {
                done(err);
            });
        });
   
        it('should delete the guest with the last id', (done) => {
            createGuests()
            .then(() => {
                return uut.getAll();
            })
            .then((guests:Common.Guest[]) => {
                expect(guests).to.deep.equal([{"id":1,"name":"kalle"},{"id":2,"name":"olle"},{"id":3,"name":"nisse"}]);                
            })
            .then(() => {
                return uut.deleteGuest(3);
            })
            .then(() => {
                return uut.getAll();
            })
            .then((guests:Common.Guest[]) => {
                expect(guests).to.deep.equal([{"id":1,"name":"kalle"},{"id":2,"name":"olle"}]);
                done();
            })
            .catch((err:string) => {
                done(err);
            });
        });
   
        it('should report failure when deleting non existing guest', (done) => {
            createGuests()
            .then(() => {
                return uut.getAll();
            })
            .then((guests:Common.Guest[]) => {
                expect(guests).to.deep.equal([{"id":1,"name":"kalle"},{"id":2,"name":"olle"},{"id":3,"name":"nisse"}]);                
            })
            .then(() => {
                return uut.deleteGuest(8);
            })
            .then(() => {
                done('This guest did not exist and this should not happen');
            })
            .catch((err:string) => {
                expect(err).to.equal("Can't find the guest");
                done();
            })
            .catch((err:string) => {
                done(err);
            });
        });
    });

    describe('testing guest-store misc tests', () => {
    
        let resourcePath : string = './test-resources/guestTestStore.json';
        let uut = new Store.GuestStoreJSON(resourcePath);
   
        before(() => {
            if (fileExists(resourcePath)) {
                removeFile(resourcePath);
            }
        });
        
        afterEach(() => {
            if (fileExists(resourcePath)) {
                removeFile(resourcePath);
            }
        });

        function createGuests():Promise<{}> {
            return new Promise(function (resolve, reject) {
                uut.addGuest({"id": 0,"name":"kalle"})
                .then(() => {
                    return uut.addGuest({"id":0,"name":"olle"});
                })
                .then(() => {
                    return uut.addGuest({"id":0,"name":"nisse"});
                })
                .then(() => {
                    resolve();
                });
            });          
        };
   
        it('should delete the guest with the first id', (done) => {
            uut.addGuest({"id": 0,"name":"kalle"})
            .then(() => {
                return uut.addGuest({"id":0,"name":"olle"});
            })
            .then(() => {
                return uut.addGuest({"id":0,"name":"nisse"});
            })
            .then(() => {
                return uut.getAll();
            })
            .then((guests:Common.Guest[]) => {
                expect(guests).to.deep.equal([{"id":1,"name":"kalle"},{"id":2,"name":"olle"},{"id":3,"name":"nisse"}]);
                return uut.updateGuest({"id":2,"name":"stina"});
            })
            .then((guest:Common.Guest) => {
                expect(guest).to.deep.equal({"id":2,"name":"stina"});
                return uut.deleteGuest(3);
            })
            .then(() => {
                return uut.getAll();
            })
            .then((guests:Common.Guest[]) => {
                expect(guests).to.deep.equal([{"id":1,"name":"kalle"},{"id":2,"name":"stina"}]);
                return uut.addGuest({"id":0,"name":"gunnar"});
            })
            .then((guest:Common.Guest) => {
                expect(guest).to.deep.equal({"id":3,"name":"gunnar"});
                done();
            })
            .catch((err) => {
                done(err);
            });
        });
    });
});