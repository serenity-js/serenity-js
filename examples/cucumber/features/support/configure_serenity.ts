import { serenity } from '@serenity-js/core';
import { FileSystem, Path } from '@serenity-js/core/lib/io';
import { ArtifactArchiver, DebugReporter, SerenityBDDReporter } from '@serenity-js/core/lib/stage';

module.exports = function() {

    this.setDefaultTimeout(5000);

    // todo: implement serenity.configure(...)
    const crewMembers = [
        new ArtifactArchiver(new FileSystem(new Path('./target/site/serenity'))),
        new SerenityBDDReporter(),
        new DebugReporter(),
    ];

    crewMembers.forEach(crewMember => {
        crewMember.assignTo(serenity.stageManager);
        serenity.stageManager.register(crewMember);
    });
};
