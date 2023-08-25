import { useState } from 'react';
import {Sketch} from '@uiw/react-color';
/*import { Alpha, Hue, ShadeSlider, Saturation, Interactive, hsvaToHslaString } from '@uiw/react-color';
import { EditableInput, EditableInputRGBA, EditableInputHSLA } from '@uiw/react-color';*/

const ColorPicker = () => {
  const [hex, setHex] = useState("#fff");
  return (
    <Sketch
      style={{ marginLeft: 20 }}
      color={hex}
      disableAlpha="true"
      onChange={(color) => {
        setHex(color.hex);
      }}
    />
  );
}

export default ColorPicker;