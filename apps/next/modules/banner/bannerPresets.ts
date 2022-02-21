import { PageTheme } from "@app/components/layout";
import { emggBannerBackground, emggLogoSrc } from "@app/util/constants";
import { BackgroundTemplates, ForegroundTemplates } from "@pulsebanner/remotion/templates";
import { m } from "framer-motion";

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
    pageTheme?: PageTheme;
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
            arrow: false
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

const image1: BannerPresetProps = {
    foreground: {
        id: 'ImLive',
        props: ForegroundTemplates['ImLive'].defaultProps,
    },
    background: {
        id: 'ImageBackground',
        props: {
            src: 'https://64.media.tumblr.com/bd4b20d179a99faa0d1432c90d59a6fe/b883350067f1853e-75/s1280x1920/da72631c44e5f30b7ccf2f4313d7f885b1f12843.jpg'
        },
    },
};
const imageWithFont: BannerPresetProps = {
    foreground: {
        id: 'ImLive',
        props: {
            ...ForegroundTemplates['ImLive'].defaultProps,
            fontStyle: 'Bangers'
        },
    },
    background: {
        id: 'ImageBackground',
        props: {
            src: 'https://64.media.tumblr.com/bd4b20d179a99faa0d1432c90d59a6fe/b883350067f1853e-75/s1280x1920/da72631c44e5f30b7ccf2f4313d7f885b1f12843.jpg'
        },
    },
};
const image2: BannerPresetProps = {
    foreground: {
        id: 'ImLive',
        props: ForegroundTemplates['ImLive'].defaultProps,
    },
    background: {
        id: 'ImageBackground',
        props: {
            src: 'https://cutewallpaper.org/23/all-anime-wallpaper-twitter-header/16027386.jpg'
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
        ...emggBanner,
        pageTheme: {
            bg: 'black',
            imageSrc: emggLogoSrc,
            fg: 'gray.800'
        }
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
        displayName: 'No arrow',
        category: 'Default',
        free: true,
        ...defaultBanner3
    },
    image2: {
        name: 'image2',
        displayName: 'Image Background 2',
        category: 'Default',
        free: false,
        ...imgPreset('https://cutewallpaper.org/23/all-anime-wallpaper-twitter-header/16027386.jpg', 'Lacquer')
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
        ...imgPreset('https://f8n-production.s3.amazonaws.com/creators/profile/hv54p9fys-1500x500-jpeg-o80i8o.jpeg', 'Iceland')
    },
    cool: {
        name: 'setup',
        displayName: 'Abstract',
        category: 'Default',
        free: false,
        ...imgPreset('https://cdn.hashnode.com/res/hashnode/image/upload/v1641819327229/QyiRUMMwX.jpeg')
    }
}
