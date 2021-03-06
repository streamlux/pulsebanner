import { useMemo, useRef } from 'react';
import { calculateScale } from './calculateSize';
import { calculatePlayerSize } from './getPlayerSize';
import { RemotionPreviewProps } from './RemotionPreview';
import { useElementSize } from './useElementSize';

if (typeof window === 'undefined') {
    console.log('Server side rendering!');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // (window as any).remotion_isPlayer = true;
    global.remotion_isPlayer = true;
}

export const RemotionProfilePreview: React.FC<RemotionPreviewProps> = ({ children, compositionHeight, compositionWidth }) => {
    const container = useRef(null);
    const canvasSize = useElementSize(container, { triggerOnWindowResize: false });

    const outerStyle: React.CSSProperties = useMemo(() => {
        return {
            position: 'relative',
            overflow: 'hidden',
            ...calculatePlayerSize({
                currentSize: canvasSize,
                compositionWidth: compositionWidth,
                compositionHeight: compositionHeight,
                width: '100%',
                height: undefined,
            }),
        };
    }, [canvasSize, compositionHeight, compositionWidth]);

    const layout = useMemo(() => {
        if (!canvasSize) {
            return null;
        }
        return calculateScale({
            canvasSize,
            compositionHeight: compositionHeight,
            compositionWidth: compositionWidth,
        });
    }, [canvasSize, compositionHeight, compositionWidth]);

    const outer: React.CSSProperties = useMemo(() => {
        if (!layout) {
            return {};
        }

        const { centerX, centerY, scale } = layout;

        return {
            width: compositionWidth * scale,
            height: compositionHeight * scale,
            display: 'flex',
            flexDirection: 'column',
            position: 'absolute',
            left: centerX,
            top: centerY,
            overflow: 'hidden',
        };
    }, [layout, compositionHeight, compositionWidth]);

    const containerStyle: React.CSSProperties = useMemo(() => {
        if (!canvasSize) {
            return {};
        }

        const { scale, xCorrection, yCorrection } = calculateScale({
            canvasSize,
            compositionHeight: compositionHeight,
            compositionWidth: compositionWidth,
        });

        return {
            position: 'absolute',
            width: compositionWidth,
            height: compositionHeight,
            display: 'flex',
            transform: `scale(${scale})`,
            marginLeft: xCorrection,
            marginTop: yCorrection,
            overflow: 'hidden',
        };
    }, [canvasSize, compositionHeight, compositionWidth]);

    return (
        <div ref={container} style={{ ...outerStyle, ...{ width: '100%', maxWidth: '100%', maxHeight: '100%', margin: '0 1vw 0 1vw', borderRadius: '100%' } }}>
            <div style={outer}>
                <div style={containerStyle} className="__remotion-player">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default RemotionProfilePreview;
