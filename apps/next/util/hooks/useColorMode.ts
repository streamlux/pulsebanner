import { ColorMode, useColorMode } from "@chakra-ui/react";

export function useColorTheme(): [ColorMode, <T>(light: T, dark: T) => T] {
    const { colorMode: theme } = useColorMode();

    const themeValue = <T>(light:T, dark: T): T => {
        if (theme === 'light') {
            return light;
        }
        return dark;
    }

    return [theme, themeValue];
}
