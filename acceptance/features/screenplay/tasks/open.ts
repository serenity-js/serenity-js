import {Actor} from "../../../serenity_screenplay/actor";
import {Performable} from "../../../serenity_screenplay/performable";

export class Open implements Performable {

    static browserOn(website: String) : Open {
        return new Open();
    }

    performAs(actor: Actor):Promise<void> {


//         // browser.get('https://amazon.com').then(() => Promise.resolve());

        console.log('open');

        return Promise.resolve();
    }
}