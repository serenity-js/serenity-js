import { stage } from '../support/stage';
import {
    AddACustomerRecord,
    CheckIfFoundCustomerEmailAddressIs,
    LooksForCustomerByName,
    StartTheCustomerDatabaseUp,
    StopTheCustomerDatabase,
} from '../support/tasks';

import { TableDefinition } from 'cucumber';

export = function() {

    this.Before((...args: any[]) => stage.theActorCalled('Adam').attemptsTo(
        StartTheCustomerDatabaseUp(),
    ));

    this.Given(/^(.*?) has added the following customer records to the database:$/,
        (actor_name: string, records: TableDefinition) => stage.theActorCalled(actor_name).attemptsTo(
            ...records.hashes().map(record => AddACustomerRecord(record.name, record.email_address)),
        ));

    this.When(/^(.*?) looks for a customer called (.*?)$/, (actor_name: string, customer_name: string) =>
        stage.theActorCalled(actor_name).attemptsTo(
            LooksForCustomerByName(customer_name),
        ));

    this.Then(/^she should see that the customer's email address is (.*?)$/, (expected_email_address: string) =>
        stage.theActorInTheSpotlight().attemptsTo(
            CheckIfFoundCustomerEmailAddressIs(expected_email_address),
        ));

    this.After((...args: any[]) => stage.theActorCalled('Adam').attemptsTo(
        StopTheCustomerDatabase(),
    ));
};
