/// <reference path="../../typings/tsd.d.ts" />

import * as http from 'http';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as config from 'config';
import * as _ from 'lodash';
import {Routes} from './routes/routes';
import * as IRoutes from './routes/irouter';
import {Store} from './stores/guest-store-json';

class App {
    private app : express.Express;
    
    constructor() {
        this.app = express();
    }
    
    configure() : void {
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());
    }
    
    setupRoutes(router: IRoutes.Routes.IRoutes) : void {
        router.setup(this.app);
    }
    
    start(port: number, host: string) : void {
        this.app.listen(port, host, function() {
            console.log('Spa server listening on port %s:%d', host, port)
        })
    }
}

let app: App = new App();
app.configure();
let guestStorePath: string = './stores/store_data/guestStore.json';
let guestStore = new Store.GuestStoreJSON(guestStorePath);
let router = new Routes.Router(guestStore);
app.setupRoutes(router);
app.start(config.get<number>('port'), config.get<string>('host'));