/// <reference path="../../typings/tsd.d.ts" />

import * as React from "react";
import * as ReactDom from "react-dom";

export interface ILocationItemProps {
    name:string,
    key:number,
    onClicked: (name:string) => void
 };

export const LocationItem = (props:ILocationItemProps) => <button onClick={e => props.onClicked(props.name)}>{props.name}</button>
