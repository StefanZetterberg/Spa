/// <reference path='../../../../typings/mocha/mocha.d.ts' />
/// <reference path='../../../../typings/chai/chai.d.ts' />
/// <reference path="../../../../node_modules/pg/pg.d.ts" />

import * as SQL from 'sqlcmd-pg';

import {Store} from '../guest-store-pg';
import {Common} from '../../common/guest';
import chai = require('chai');
import * as PgTestSupport from './pg-test-support';
var expect = chai.expect;

describe('testing guest-store-pg', () => {
    let connectionOptions = {
        'host':'localhost',
        'database':'test',
        'user':'spa',
        'password':'spapassword'
    };
    var uut:Store.GuestStorePg;
    var testSupport:PgTestSupport.Store.PgTestSupport;

    beforeEach(() => {
        uut = new Store.GuestStorePg(connectionOptions.host, connectionOptions.database, connectionOptions.user, connectionOptions.password);
        testSupport = new PgTestSupport.Store.PgTestSupport(connectionOptions.host, connectionOptions.database, connectionOptions.user, connectionOptions.password);
    });

    afterEach(() => {
        uut.close();
        testSupport.close();
    });

    describe('test init creates database if not present', () => {
        it('should create empty database if not present', (done) => {
            testSupport.removeTestDatabase()
            .then(() => {
                return uut.init();
            })
            .then(() => {
                return testSupport.verifyDatabase();
            })
            .then(() => {
                done();
            })
            .catch((err) => {
                done(err);
            });
        });
    });

    describe('testing getAllGuests', () => {
        it('should return all guest upon request', (done) => {
            testSupport.removeTestDatabase()
            .then(() => {
                return uut.init();
            })
            .then(() => {
                return testSupport.createTestGuests();
            })
            .then(() => {
                return uut.getAll();
            })
           .then((guests:Common.Guest[]) => {
                expect(guests.map((guest:Common.Guest) => {return guest.name})).to.have.members(['kalle','olle','nisse']);
                expect(guests.map((guest:Common.Guest) => {return guest.id})).to.have.members([1,2,3]);
                done();
            })
            .catch((err:string) => {
                done(err);
            });
        });
    });

    describe('testing addGuest', () => {
        it('should return the added guest', (done) => {
            testSupport.removeTestDatabase()
            .then(() => {
                return uut.init();
            })
            .then(() => {
                return uut.addGuest({id:0,name:'gunnar'});
            })
            .then((guest:Common.Guest) => {
                expect(guest).to.deep.equal({id:1,name:'gunnar'});
                return uut.addGuest({id:0,name:'stina'});
            })
            .then((guest:Common.Guest) => {
                expect(guest).to.deep.equal({id:2,name:'stina'});
                return uut.getAll();
            })
            .then((guests:Common.Guest[]) => {
                expect(guests).to.deep.equal([{id:1,name:'gunnar'},{id:2,name:'stina'}]);
                done();
            })
            .catch((err) => {
                done(err);
            });
        });

        it('should report failure if guest already have id', (done) => {
            testSupport.removeTestDatabase()
            .then(() => {
                return uut.init();
            })
            .then(() => {
                return uut.addGuest({id:1,name:'gunnar'});
            })
            .then(() => {
                done('The guest should not have been inserted');
            })
            .catch((err) => {
                expect(err).to.equal('Guest already have an id');
                done();
            })
        })
    });

    describe('testing getGuest', () => {
        it('should return given guest', (done) => {
            testSupport.removeTestDatabase()
            .then(() => {
                return uut.init();
            })
            .then(() => {
                return uut.addGuest({id:0,name:'gunnar'})
            })
            .then(() => {
                return uut.addGuest({id:0,name:'stina'});
            })
            .then(() => {
                return uut.addGuest({id:0,name:'nisse'});
            })
            .then(() => {
                return uut.getGuest(2);
            })
            .then((guest:Common.Guest) => {
                expect(guest).to.deep.equal({id:2,name:'stina'});
                return uut.getGuest(3);
            })
            .then((guest:Common.Guest) => {
                expect(guest).to.deep.equal({id:3,name:'nisse'});
                return uut.getGuest(1);
            })
            .then((guest:Common.Guest) => {
                expect(guest).to.deep.equal({id:1,name:'gunnar'});
                done();
            })
            .catch((err) => {
                done(err);
            });
        });

        it('should fail if given guest is missing', (done) => {
            testSupport.removeTestDatabase()
            .then(() => {
                return uut.init();
            })
            .then(() => {
                return uut.addGuest({id:0,name:'gunnar'})
            })
            .then(() => {
                return uut.addGuest({id:0,name:'stina'});
            })
            .then(() => {
                return uut.getGuest(1);
            })
            .then((guest:Common.Guest) => {
                expect(guest).to.deep.equal({id:1,name:'gunnar'});
                return uut.getGuest(3);
            })
            .then((guest:Common.Guest) => {
                if (guest) {
                    done('Guest 3 should not exist');
                } else {
                    done();
                }
            })
            .catch((err) => {
                done();
            })
        });
    });

    describe('testing updateGuest', () => {
        it('should update given guest', (done) => {
            testSupport.removeTestDatabase()
            .then(() => {
                return uut.init();
            })
            .then(() => {
                return uut.addGuest({id:0,name:'gunnar'})
            })
            .then(() => {
                return uut.addGuest({id:0,name:'stina'});
            })
            .then(() => {
                return uut.addGuest({id:0,name:'nisse'});
            })
            .then(() => {
                return uut.updateGuest({'id':2,'name':'kalle'});
            })
            .then((guest:Common.Guest) => {
                expect(guest).to.deep.equal({'id':2,'name':'kalle'});
                return uut.getAll();
            })
            .then((guests:Common.Guest[]) => {
                expect(guests).to.deep.equal([{'id':1,'name':'gunnar'},{'id':2,'name':'kalle'},{'id':3,'name':'nisse'}]);
                done();
            })
            .catch((err) => {
                done(err);
            });
        });

        it('should fail if given guest have id 0', (done) => {
            testSupport.removeTestDatabase()
            .then(() => {
                return uut.init();
            })
            .then(() => {
                return uut.addGuest({id:0,name:'gunnar'})
            })
            .then(() => {
                return uut.addGuest({id:0,name:'stina'});
            })
            .then(() => {
                return uut.addGuest({id:0,name:'nisse'});
            })
            .then(() => {
                return uut.updateGuest({'id':0,'name':'kalle'});
            })
            .then((guest:Common.Guest) => {
                if (guest) {
                    done('Guest should not be updated');
                } else {
                    done();
                }
            })
            .catch((err:string) => {
                expect(err).to.be.equal("Guest doesn't exist");
                done();
            })
            .catch((err) => {
                done(err);
            });
        });

        it('should fail if given guest have non existing id', (done) => {
            testSupport.removeTestDatabase()
            .then(() => {
                return uut.init();
            })
            .then(() => {
                return uut.addGuest({id:0,name:'gunnar'})
            })
            .then(() => {
                return uut.addGuest({id:0,name:'stina'});
            })
            .then(() => {
                return uut.addGuest({id:0,name:'nisse'});
            })
            .then(() => {
                return uut.updateGuest({'id':4,'name':'kalle'});
            })
            .then((guest:Common.Guest) => {
                if (guest) {
                    done('Guest should not be updated');
                } else {
                    done();
                }
            })
            .catch((err:string) => {
                expect(err).to.be.equal("Guest doesn't exist");
                done();
            })
            .catch((err) => {
                done(err);
            });
        });
    });

    describe('testing deleteGuest', () => {
        it('should delete given guest', (done) => {
            testSupport.removeTestDatabase()
            .then(() => {
                return uut.init();
            })
            .then(() => {
                return uut.addGuest({id:0,name:'gunnar'})
            })
            .then(() => {
                return uut.addGuest({id:0,name:'stina'});
            })
            .then(() => {
                return uut.addGuest({id:0,name:'nisse'});
            })
            .then(() => {
                return uut.deleteGuest(2);
            })
            .then(() => {
                return uut.getAll();
            })
            .then((guests:Common.Guest[]) => {
                expect(guests).to.deep.equal([{'id':1,'name':'gunnar'},{'id':3,'name':'nisse'}]);
                done();
            })
            .catch((err) => {
                done(err);
            });
        });

        it('should fail if given guest have id 0', (done) => {
            testSupport.removeTestDatabase()
            .then(() => {
                return uut.init();
            })
            .then(() => {
                return uut.addGuest({id:0,name:'gunnar'})
            })
            .then(() => {
                return uut.addGuest({id:0,name:'stina'});
            })
            .then(() => {
                return uut.addGuest({id:0,name:'nisse'});
            })
            .then(() => {
                return uut.deleteGuest(0);
            })
            .then(() => {
                done('Guest should not be deleted');
            })
            .catch((err:string) => {
                expect(err).to.be.equal("Guest doesn't exist");
                done();
            })
            .catch((err) => {
                done(err);
            });
        });

        it('should fail if given guest have non existing id', (done) => {
            testSupport.removeTestDatabase()
            .then(() => {
                return uut.init();
            })
            .then(() => {
                return uut.addGuest({id:0,name:'gunnar'})
            })
            .then(() => {
                return uut.addGuest({id:0,name:'stina'});
            })
            .then(() => {
                return uut.addGuest({id:0,name:'nisse'});
            })
            .then(() => {
                return uut.deleteGuest(4);
            })
            .then(() => {
                done('Guest should not be deleted');
            })
            .catch((err:string) => {
                expect(err).to.be.equal("Guest doesn't exist");
                done();
            })
            .catch((err) => {
                done(err);
            });
        });
    });
});
