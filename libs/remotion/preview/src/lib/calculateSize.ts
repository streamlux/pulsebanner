import { Size } from "./useElementSize";

export const calculateScale = ({ compositionWidth, compositionHeight, canvasSize }: { compositionWidth: number; compositionHeight: number; canvasSize: Size }) => {
    const heightRatio = canvasSize.height / compositionHeight;
    const widthRatio = canvasSize.width / compositionWidth;

    const ratio = Math.min(heightRatio, widthRatio);

    const scale = ratio;
    const correction = 0 - (1 - scale) / 2;
    const xCorrection = correction * compositionWidth;
    const yCorrection = correction * compositionHeight;
    const width = compositionWidth * scale;
    const height = compositionHeight * scale;
    const centerX = canvasSize.width / 2 - width / 2;
    const centerY = canvasSize.height / 2 - height / 2;
    return {
        centerX,
        centerY,
        xCorrection,
        yCorrection,
        scale,
    };
};
