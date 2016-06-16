// const
//     chai = require('chai').use(require('chai-as-promised')),
//     expect = chai.expect;

import {binding, given, when, then} from "cucumber-tsflow";

// import {promise} from "selenium-webdriver";

// import {Actor} from "./../../../serenity_screenplay/actor";

// import {Open} from "../screenplay/tasks/open"

// import {LoginPageObject} from './login.page';
// import {AuthenticationPageObject} from '../authentication.page';

@binding()
class TodoUserSteps {

    // private james: Actor = new Actor();

    // private authenticationModule: AuthenticationPageObject = new AuthenticationPageObject();
    // private loginPageObject: LoginPageObject = new LoginPageObject();

    @given(/^.*has an empty todo list$/)
    private has_an_empty_todo_list (): Promise<void> {

        // return this.james.attemptsTo(
        //     Open.browserOn("http://todomvc.com/examples/angular2/")
        // );


        // return browser.get('https://amazon.com');
        return Promise.resolve();
    };

    @when(/^he adds '(.*?)' to (?:his|her) list$/)
    public adds (item: string) : Promise<void> {
        return Promise.resolve();
    }

    @then(/^'(.*?)' should be recorded in (?:his|her) list$/)
    public should_see_recorded (item: string) : Promise<void> {
        return Promise.resolve();
    }
}

export = TodoUserSteps;