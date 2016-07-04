import {Action, PerformsTasks} from '../../screenplay/pattern';
import {step} from '../../screenplay/recording/annotations'

export class Enter implements Action {
    
    public static theValue(value: string) : Enter {
        return new Enter(value);
    }

    public into(field: webdriver.Locator) : Enter {
        this.locator = field;

        return this;
    }

    public thenHit(key: string) {
        this.key = key;

        return this;
    }

    @step("{0} enters '#value' into #locator")
    performAs(actor: PerformsTasks) {
        element(this.locator).sendKeys(this.value, this.key);
    }

    constructor(private value: string) { }

    private locator: webdriver.Locator;
    private key:string;
}