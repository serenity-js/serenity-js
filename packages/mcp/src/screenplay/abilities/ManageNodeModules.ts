import { Ability } from '@serenity-js/core';

export class ManageNodeModules extends Ability {

}

/*
 const channel = context.config.browser?.launchOptions?.channel ?? context.config.browser?.browserName ?? 'chrome';
    const cliPath = path.join(require.resolve('playwright/package.json'), '../cli.js');
    const child = fork(cliPath, ['install', channel], {
      stdio: 'pipe',
    });
    const output: string[] = [];
    child.stdout?.on('data', data => output.push(data.toString()));
    child.stderr?.on('data', data => output.push(data.toString()));
    await new Promise<void>((resolve, reject) => {
      child.on('close', code => {
        if (code === 0)
          resolve();
        else
          reject(new Error(`Failed to install browser: ${output.join('')}`));
      });
    });
    response.setIncludeTabs();
 */
