import { trimmed } from '@serenity-js/core/lib/io/index.js';

import { describe, expect,it } from '../src/mcp-api.js';

describe('Navigate to', () => {

    it('works', async ({ client }) => {
        const response = await client.callTool({
            name: 'serenity_hello',
            arguments: {
                name: 'Serenity/JS',
            },
        });

        console.log(JSON.stringify({ response }))
    });

    it('navigates', async ({ client }) => {
        const response = await client.callTool({
            name: 'serenity_web_navigate_to',
            arguments: {
                url: 'https://serenity-js.org',
            },
        });

        console.log(JSON.stringify({ response }))

        expect(response.content[0].text).toEqual(trimmed`
        | - Ran Serenity/JS activities:
        | \`\`\`ts
        | Navigate.to(https://serenity-js.org),
        | \`\`\`
        |
        | ### Required imports
        | \`\`\`ts
        | import { Navigate } from '@serenity-js/web';
        | \`\`\`
        |`)
    });
});
