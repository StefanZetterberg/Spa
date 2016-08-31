/// <reference path="../typings/tsd.d.ts" />

import * as express from 'express';
import * as iroutes from './irouter';
import {Store} from '../stores/guest-store-json';
import {Common} from '../common/guest';

export module Routes {
    export class Router implements iroutes.Routes.IRoutes {
        static guestStore: Store.GuestStoreJSON;
        
        constructor(guest_store:Store.GuestStoreJSON) {
            Router.guestStore = guest_store;
        }

        setup(app: express.Express):void {
            app.get('/', this.index);
            app.get('/guest/list', this.getAllGuests);
            app.get('/guest/:id', this.getGuest);
            app.post('/guest/add', this.addGuest);
            app.put('/guest', this.updateGuest);
            app.delete('/guest/:id', this.deleteGuest);
        }
        index(req:express.Request, res:express.Response):void {
            console.log('in Index');
        }
        getGuest(req:express.Request, res:express.Response):void {
            console.log('in getGuest');
            Router.guestStore.getGuest(req.params.id)
            .then((guest:Common.Guest) => {
                res.send(guest);
            })
            .catch((err) => {
                res.sendStatus(500).send(err);
            });
        }
        getAllGuests(req:express.Request, res:express.Response):void {
            console.log('in getAllGuests');
            Router.guestStore.getAll().then((guests:Common.Guest[]) => {
                res.send(guests);
            })
            .catch((err:string) => {
                res.sendStatus(500).send(err);
            });
        }
        addGuest(req:express.Request, res:express.Response):void {
            console.log('in /guest/add');
            console.log(req.body);
            Router.guestStore.addGuest(req.body).then((guest:Common.Guest) => {
                res.send(guest);
            })
            .catch((err:string) => {
                res.sendStatus(500).send(err);
            });
        }
        updateGuest(req:express.Request, res:express.Response):void {
            console.log('in updateGuest ');
            Router.guestStore.updateGuest(req.body).then((guest:Common.Guest) => {
                res.send(guest);
            })
            .catch((err:string) => {
                res.sendStatus(500).send(err);
            });
        }
        deleteGuest(req:express.Request, res:express.Response):void {
            console.log('in deleteGuest ' + req.params.id);
            Router.guestStore.deleteGuest(req.params.id).then(() => {
                res.sendStatus(200);
            })
            .catch((err:string) => {
                res.sendStatus(500).send(err);
            });
        }
    }
}
