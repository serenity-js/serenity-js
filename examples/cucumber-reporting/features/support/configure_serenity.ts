import { serenity } from '@serenity-js/core';
import { FileSystem, Path } from '@serenity-js/core/lib/io';
import { ArtifactArchiver, SerenityBDDReporter } from '@serenity-js/core/lib/stage';

import { setDefaultTimeout } from 'cucumber';

setDefaultTimeout(5000);

serenity.setTheStage(
    new ArtifactArchiver(new FileSystem(new Path('./target/site/serenity'))),
    new SerenityBDDReporter(),
);
