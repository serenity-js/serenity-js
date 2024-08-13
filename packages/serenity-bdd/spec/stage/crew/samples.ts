import { FileSystemLocation, Path } from '@serenity-js/core/lib/io';
import { Category, Name, Photo, ScenarioDetails } from '@serenity-js/core/lib/model';

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

export const authenticationScenario = new ScenarioDetails(
    new Name('Authenticating with social media'),
    new Category('Authentication'),
    new FileSystemLocation(
        new Path(`authentication/social_media.feature`),
    ),
);

export const photo = new Photo('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEW01FWbeM52AAAACklEQVR4nGNiAAAABgADNjd8qAAAAABJRU5ErkJggg==');
