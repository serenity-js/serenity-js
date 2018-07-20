import { Category, Name, Photo, ScenarioDetails } from '../../../src/domain';
import { FileSystemLocation, Path } from '../../../src/io';

export const defaultCardScenario = new ScenarioDetails(
    new Name('Paying with a default card'),
    new Category('Online Checkout'),
    new FileSystemLocation(
        new Path(`payments/checkout.feature`),
    ),
);

export const voucherScenario = new ScenarioDetails(
    new Name('Paying with a voucher'),
    new Category('Online Checkout'),
    new FileSystemLocation(
        new Path(`payments/checkout.feature`),
    ),
);

export const photo = new Photo('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEW01FWbeM52AAAACklEQVR4nGNiAAAABgADNjd8qAAAAABJRU5ErkJggg==');
