/// <reference path="../typings/tsd.d.ts" />

import * as React from "react";
import * as ReactDOM from "react-dom";

import {Location} from "./components/Location";
import {ILocationProps} from "./components/Location";
import {ILocation} from "./components/Location";
import {Entre} from "./components/entre/Entre";

interface ISpaAppState {
    display:number,
};

export class SpaApp extends React.Component<{}, ISpaAppState> {
    private locationNames:string[] =  ['entré', 'disk', 'kassa'];
    private locations:ILocation[];

    constructor() {
        super();
        let counter:number = 1;
        this.locations = this.locationNames.map((name) => {
            return {
                name:name,
                key:counter++
            };
        });
        this.state = {
            display: -1
        };
    }

    locationSelected(display:string) {
        this.setState({display: this.locationNames.indexOf(display)});
    }

    render() {
        switch (this.state.display) {
            case -1:
                return <Location locations={this.locations} locationSelected={this.locationSelected.bind(this)} />;
            case 0:
                return <Entre />
        }
    }
}    
