/// <reference path="../../typings/tsd.d.ts" />

import * as React from "react";
import * as ReactDom from "react-dom";
import {LocationItem} from './LocationItem';

export interface ILocation {
    name:string,
    key:number
};
export interface ILocationProps {
    locations:
        ILocation[],
    locationSelected:(name:string) => void
 };

export class Location extends React.Component<ILocationProps, {}> {

    constructor(props:ILocationProps) {
        super(props);
    }

    public locationSelected(location:ILocation) {
        this.props.locationSelected(location.name);
    } 

    render() {
        var locations = this.props.locations.map((location) => {
            return (
                <LocationItem 
                    key={location.key}
                    name={location.name}
                    onClicked={this.locationSelected.bind(this, location)}
                />
            )
        });
        return <div><div>Vart vill då gå?</div>{locations}</div>;
    }
}
