import { emggBannerBackground, swayBannerBackground } from "@app/util/constants";
import { BackgroundTemplates, ForegroundTemplates } from "@pulsebanner/remotion/templates";

const defaultForeground: keyof typeof BannerForegrounds = 'ImLive';
const defaultBackground: keyof typeof BackgroundTemplates = 'GradientBackground';

const BannerForegrounds = ForegroundTemplates;

// these types are ids of foregrounds or backgrounds
type Foreground = keyof typeof BannerForegrounds;
type Background = keyof typeof BackgroundTemplates;

function createBannerProps<F extends Foreground, B extends Background>(
    foregroundId: F,
    foregroundProps: typeof ForegroundTemplates[F]['defaultProps'],
    backgroundId: B,
    backgroundProps: typeof BackgroundTemplates[B]['defaultProps']
): BannerProps {
    return {
        foregroundId,
        foregroundProps,
        backgroundId,
        backgroundProps,
    };
}

type BannerPreset = BannerPresetMetadata & BannerPresetProps;

interface BannerPresetMetadata {
    name?: string;
    displayName: string;
    category: string;
    free: boolean;
    locked?: boolean;
}

interface BannerPresetProps {
    foreground: {
        id: Foreground;
        props: typeof ForegroundTemplates[Foreground]['defaultProps'];
    };
    background: {
        id: Background;
        props: typeof BackgroundTemplates[Background]['defaultProps'];
    };
}

interface BannerProps {
    foregroundId: Foreground;
    backgroundId: Background;
    foregroundProps: typeof ForegroundTemplates[Foreground]['defaultProps'];
    backgroundProps: typeof BackgroundTemplates[Background]['defaultProps'];
}

const defaultBanner: BannerPresetProps = {
    foreground: {
        id: defaultForeground,
        props: ForegroundTemplates[defaultForeground].defaultProps,
    },
    background: {
        id: defaultBackground,
        props: BackgroundTemplates[defaultBackground].defaultProps,
    },
};

const defaultBanner2: BannerPresetProps = {
    foreground: {
        id: defaultForeground,
        props: {
            ...ForegroundTemplates[defaultForeground].defaultProps,
            arrow: true,
            text: 'Come join my stream!'
        },
    },
    background: {
        id: defaultBackground,
        props:
        {
            ...BackgroundTemplates[defaultBackground].defaultProps,
            leftColor: '#eb7734',
        },
    },
};
const defaultBanner3: BannerPresetProps = {
    foreground: {
        id: defaultForeground,
        props: {
            ...ForegroundTemplates[defaultForeground].defaultProps,
            arrow: false,
            showText: false,
            showUsername: false,
        },
    },
    background: {
        id: defaultBackground,
        props:
        {
            ...BackgroundTemplates[defaultBackground].defaultProps,
            leftColor: '#b149ff',
            rightColor: '#cf44aa'
        },
    },
};


const camo: BannerPresetProps = {
    foreground: {
        id: 'ImLive',
        props: {
            ...ForegroundTemplates['ImLive'].defaultProps,
            thumbnailBorderColor: 'green'
        },
    },
    background: {
        id: 'ImageBackground',
        props: {
            src: 'https://pb-static.sfo3.cdn.digitaloceanspaces.com/banner-backgrounds/camo.png'
        },
    },
};

function imgPreset(src: string, font?: string): BannerPresetProps {
    return {
        foreground: {
            id: 'ImLive',
            props: {
                ...defaultBanner.foreground.props,
                fontStyle: font,
            }
        },
        background: {
            id: 'ImageBackground',
            props: {
                src
            }
        }
    }
}

const emggBanner: BannerPresetProps = {
    foreground: {
        id: 'Emgg',
        props: ForegroundTemplates['Emgg'].defaultProps,
    },
    background: {
        id: 'ImageBackground',
        props: {
            src: emggBannerBackground
        },
    },
};

const swayBanner: BannerPresetProps = {
    foreground: {
        id: 'Sway',
        props: ForegroundTemplates['Sway'].defaultProps,
    },
    background: {
        id: 'ImageBackground',
        props: {
            src: swayBannerBackground
        },
    },
};


function convertToProps(preset: BannerPresetProps): BannerProps {
    return {
        foregroundId: preset.foreground.id,
        foregroundProps: preset.foreground.props,
        backgroundId: preset.background.id,
        backgroundProps: preset.background.props,
    };
}

export const bannerPresets: Record<string, BannerPreset> = {
    default: {
        name: 'classic',
        displayName: 'Classic',
        category: 'Default',
        free: true,
        ...defaultBanner
    },
    emgg: {
        name: 'emgg',
        displayName: 'EMGG Special Edition',
        category: 'Special Edition',
        free: true,
        locked: true,
        ...emggBanner
    },
    sway: {
        name: 'sway',
        displayName: 'Sway Special Edition',
        category: 'Special Edition',
        free: true,
        locked: true,
        ...swayBanner
    },
    noArrow: {
        name: 'customtext',
        displayName: 'Custom text',
        category: 'Default',
        free: true,
        ...defaultBanner2
    },
    customGradient: {
        name: 'noarrow',
        displayName: 'Minimal',
        category: 'Default',
        free: true,
        ...defaultBanner3
    },
    image2: {
        name: 'image2',
        displayName: 'Space',
        category: 'Default',
        free: false,
        ...imgPreset('https://pb-static.sfo3.cdn.digitaloceanspaces.com/banner-backgrounds/space.jpeg', 'Lacquer')
    },
    camo: {
        name: 'camo',
        displayName: 'Camo',
        category: 'Default',
        free: false,
        ...camo
    },
    setup: {
        name: 'setup',
        displayName: 'Vaporwave',
        category: 'Default',
        free: false,
        ...imgPreset('https://pb-static.sfo3.cdn.digitaloceanspaces.com/banner-backgrounds/vaporwave.jpeg', 'Iceland')
    },
    cool: {
        name: 'setup',
        displayName: 'Abstract',
        category: 'Default',
        free: false,
        ...imgPreset('https://pb-static.sfo3.cdn.digitaloceanspaces.com/banner-backgrounds/purple.jpeg')
    },
}
