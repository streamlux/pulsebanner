import React, { useMemo, useRef } from 'react';
import { calculateScale } from './calculateSize';
import { calculatePlayerSize } from './getPlayerSize';
import { useElementSize } from './useElementSize';

/* eslint-disable-next-line */
export interface RemotionPreviewProps {
    compositionHeight: number;
    compositionWidth: number;
}

export const RemotionPreview: React.FC<RemotionPreviewProps> = ({ children, compositionHeight, compositionWidth }) => {
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
    }, [canvasSize]);

    const layout = useMemo(() => {
        if (!canvasSize) {
            return null;
        }

        return calculateScale({
            canvasSize,
            compositionHeight: compositionHeight,
            compositionWidth: compositionWidth,
        });
    }, [canvasSize]);

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
    }, [layout]);

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
    }, [canvasSize]);
    return (
        <div ref={container} style={{ ...outerStyle, ...{ width: '80vw', maxWidth: '100%', maxHeight: '100%' } }}>
            <div style={outer}>
                <div style={containerStyle} className="__remotion-player">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default RemotionPreview;