import { ChildProcessReporter } from '@integration/testing-tools';
import { serenity } from '@serenity-js/core';
import { DebugReporter } from '@serenity-js/core/lib/stage';
import { setDefaultTimeout } from 'cucumber';

setDefaultTimeout(5000);

serenity.stageManager.register(
    new ChildProcessReporter(),
    new DebugReporter(),
);
