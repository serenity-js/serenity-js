import {step} from '../../screenplay/recording/annotations';
import {PerformsTasks} from '../../serenity/screenplay/actor';
import {Action} from '../../serenity/screenplay/performables';

export class Open implements Action {

    static browserOn(website: string): Open {
        return new Open(website);
    }

    @step('{0} opens the #targetWebsite')
    performAs(actor: PerformsTasks) {
        browser.get(this.targetWebsite);
    }

    constructor(private targetWebsite: string) { }
}
