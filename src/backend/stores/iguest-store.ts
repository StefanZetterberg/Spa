import {Common} from '../common/guest';

export module Store {
    export interface IGuestStore {
        getAll() : Promise<Common.Guest[]>;
        getGuest(id:number):Promise<Common.Guest>;
        addGuest(newGuest: Common.Guest):Promise<Common.Guest>;
        updateGuest(updatedGuest:Common.Guest):Promise<Common.Guest>;
        deleteGuest(id:number):Promise<{}>;
    }
}