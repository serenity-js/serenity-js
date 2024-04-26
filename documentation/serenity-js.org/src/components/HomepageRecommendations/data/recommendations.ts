import { SrcImage } from '@theme/IdealImage';

export interface RecommendationItem {
    author: {
        name: string;
        title: string;
        avatar: { default: string } | { src: SrcImage; preSrc: string } | string
    },
    lines: string[];
    learnMore: {
        path: string;
        text: string;
    }
}

export const LeaderRecommendations: RecommendationItem[] = [
    {
        author: {
            name: 'Julien Biezemans',
            title: 'Creator of Cucumber.js',
            avatar: require('@site/static/avatars/jbpros.png'),
        },
        lines: [
            `I am thoroughly impressed with the Serenity/JS ecosystem. I am blown away by the feature set, the numerous deep integrations with other runners and tools, and the consistent level of quality throughout the whole project.`,
            `The thorough user-centric documentation is exceptional. It goes from the foundational concept of the Screenplay Pattern to advanced techniques and practices in a very gentle and clear way. The support is also remarkable.`,
            `Kudos to Jan and the contributors for all this fantastic work! The world needs more devs and entrepreneurs like you 😄`,
        ],
        learnMore: {
            path: '/handbook/test-runners/cucumber/',
            text: 'Learn about using Cucumber.js with Serenity/JS'
        }
    },
    {
        author: {
            name: 'Christian Bromann',
            title: 'Creator of WebdriverIO, Microsoft MVP',
            avatar: require('@site/static/avatars/christian-bromann.png'),
        },
        lines: [
            `One of the key benefits of using Serenity/JS with WebdriverIO is its strong emphasis on readability and maintainability.`,
            `Serenity/JS allows you to write tests in a highly expressive, business-readable language, making it easier for both technical and non-technical stakeholders to understand the test scenarios.`,
            `This readability not only simplifies collaboration within your team but also enhances the overall quality of your tests.`,
        ],
        learnMore: {
            path: '/handbook/test-runners/webdriverio/',
            text: 'Learn about using WebdriverIO with Serenity/JS'
        }
    },
]
