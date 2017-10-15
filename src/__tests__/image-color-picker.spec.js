import React from 'react';
import renderer from 'react-test-renderer';

import ImageColorPicker from '../image-color-picker';

function props() {
  return {
    imageUrl: 'https://dummyimage.com/600x400',
    pickerCallback: jest.fn(),
    paletteType: 'average',
    colorType: 'hex',
    imageType: 'jpeg',
    paletteCount: 3,
    defaultPalette: [0, 0, 0, 1],
    pickerStyle: {
      width: 100,
      height: 100
    }
  };
}

describe('ImageColorPicker', () => {
  it('should render without issues', () => {
    const component = renderer.create(<ImageColorPicker {...props()} />);
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
