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
            `I am deeply impressed with the Serenity/JS ecosystem. I am blown away by the feature set, the numerous deep integrations with other runners and tools, and the consistent level of quality throughout the whole project.`,
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
            `Serenity/JS has a genuinely inspiring mission: to make test automation collaborative, enjoyable, and accessible for everyone, from business to technical audiences.`,
            `The project's dedication to quality, user experience, and innovation shines through in every aspect of the framework, helping you create maintainable and scalable tst suites while adhering to open standards and leveraging reliable open-source tools.`,
            `WebdriverIO is proud to be a part of the Serenity/JS ecosystem, and I'm excited to see what the future holds for this fantastic project!`,
        ],
        learnMore: {
            path: '/handbook/test-runners/webdriverio/',
            text: 'Learn about using WebdriverIO with Serenity/JS'
        }
    },
]
