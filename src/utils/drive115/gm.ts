import { GMRequest } from "../request/gmRequst";
import { Drive115Core } from "./core";

export class Drive115GM extends Drive115Core {
    constructor() {
        super(new GMRequest());
    }
}