import React from 'react';
import * as Backgrounds from '../backgrounds';
import * as Foregrounds from '../foregrounds';

export const Composer: React.FC<{
    foregroundId: keyof typeof Foregrounds;
    backgroundId: keyof typeof Backgrounds;
    backgroundProps: any;
    foregroundProps: any;
}> = ({ foregroundId, backgroundId, foregroundProps, backgroundProps }) => {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            {Backgrounds[backgroundId].default.component({ ...backgroundProps, children: Foregrounds[foregroundId].default.component(foregroundProps) })}
        </div>
    );
};
