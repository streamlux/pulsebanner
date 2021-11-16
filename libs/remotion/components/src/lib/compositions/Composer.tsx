import React from 'react';
import * as Backgrounds from '../backgrounds';
import * as Foregrounds from '../foregrounds';
import { Watermark } from '../Watermark';

export const Composer: React.FC<{
    foregroundId: keyof typeof Foregrounds;
    backgroundId: keyof typeof Backgrounds;
    backgroundProps: any;
    foregroundProps: any;
    watermark: boolean;
}> = ({ foregroundId, backgroundId, foregroundProps, backgroundProps, watermark }) => {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            {Backgrounds[backgroundId]({ ...backgroundProps, children: Foregrounds[foregroundId](foregroundProps) })}
            <Watermark />
        </div>
    );
};
