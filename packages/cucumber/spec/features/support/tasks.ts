import { Task } from '@serenity-js/core/lib/screenplay';

export const StartTheCustomerDatabaseUp = () => Task.where(`#actor starts up the customer database`);
export const StopTheCustomerDatabase = () => Task.where(`#actor stops the customer database`);

export const AddACustomerRecord = (name: string, emailAddress: string) =>
    Task.where(`#actor adds a customer record for ${ name }`);

export const LooksForCustomerByName = (name: string) =>
    Task.where(`#actor looks for a customer called ${ name }`);

export const CheckIfFoundCustomerEmailAddressIs = (email_address: string) =>
    Task.where(`#actor checks if the found customer's email address is ${ email_address }`);
