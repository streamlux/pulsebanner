import { ComponentSingleStyleConfig, ThemeOverride } from "@chakra-ui/react";

const Link: ComponentSingleStyleConfig = {
    variants: {
        blue: {
            border: '2px solid',
            borderColor: 'purple.500',
            color: 'purple.500',
        }
    }
}

type GlobalComponents = Pick<ThemeOverride, 'components'>;
export default {
    components: {
        Link,
    },
} as GlobalComponents;;
