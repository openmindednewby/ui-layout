import React from 'react';

import Svg, { Circle, Path } from 'react-native-svg';

import { BannerIconShape } from './BannerIconShape';

const SIZE = 20;
const VIEW_BOX = '0 0 20 20';
const CENTER = 10;
const RING_RADIUS = 8;
const DISK_RADIUS = 9;
const RING_STROKE = 1.75;
const CHECK_STROKE = 2;
const INFO_PATH = 'M10 9v5M10 6.2v.1';
const CHECK_PATH = 'M6.3 10.2l2.5 2.5 4.9-5.3';

export interface BannerIconProps {
  shape: BannerIconShape;
  color: string;
  cutout: string;
  testID?: string;
}

/** The default banner glyph: an outlined circle-i or a filled check disk with the check cut out in the fill colour. */
export const BannerIcon = ({ shape, color, cutout, testID }: BannerIconProps): React.ReactElement => (
  <Svg aria-hidden height={SIZE} testID={testID} viewBox={VIEW_BOX} width={SIZE}>
    {shape === BannerIconShape.CheckDisk ? (
      <>
        <Circle cx={CENTER} cy={CENTER} fill={color} r={DISK_RADIUS} />
        <Path d={CHECK_PATH} fill="none" stroke={cutout} strokeLinecap="round" strokeLinejoin="round" strokeWidth={CHECK_STROKE} />
      </>
    ) : (
      <>
        <Circle cx={CENTER} cy={CENTER} fill="none" r={RING_RADIUS} stroke={color} strokeWidth={RING_STROKE} />
        <Path d={INFO_PATH} stroke={color} strokeLinecap="round" strokeWidth={RING_STROKE} />
      </>
    )}
  </Svg>
);
