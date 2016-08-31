/// <reference path="../typings/tsd.d.ts" />

import * as React from "react";
import * as ReactDOM from "react-dom";

import {Location} from "./components/Location";
import {ILocationProps} from "./components/Location";
import {ILocation} from "./components/Location";
import {SpaApp} from './SpaApp';

var App:SpaApp = new SpaApp();

function render() {
    ReactDOM.render(
        <SpaApp />, document.getElementById('spa-app')
    );
}
render();