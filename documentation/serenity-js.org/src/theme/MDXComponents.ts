// Import the original mapper
import MDXComponents from '@theme-original/MDXComponents'
import TabItem from '@theme-original/TabItem';
import Tabs from '@theme-original/Tabs';

// custom components
import Figure from '@site/src/components/Figure'

export default {
    // Re-use the default mapping
    ...MDXComponents,
    // LiteYouTubeEmbed,
    Tabs,
    TabItem,
    Figure
}
