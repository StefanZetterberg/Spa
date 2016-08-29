/// <reference path="../../../typings/tsd.d.ts" />

import * as express from 'express';

export module Routes {
    export interface IRoutes {
        setup(app: express.Express);
    }
}