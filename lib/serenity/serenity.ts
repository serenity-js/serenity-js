export class Serenity {

    private static _instance: Serenity;

    public static get instance() {
        return Serenity._instance||(Serenity._instance = new Serenity());
    }

    constructor() {
        console.log(">>>>>>>>>>>>>> INITIALISED Serenity Library using a constructor");
    }

    public name() {
        return "Serenity";
    }
}