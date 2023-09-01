import React, { useState, useEffect , useRef} from 'react';
//import colors from './colors.jpg';
import { saveAs } from 'file-saver';
import {Sketch} from '@uiw/react-color';

function Editor(props) {

    // initialize canvas and context
    const canvasRef = useRef(null);
    const canvasCtxRef = useRef(null);

    // imageSrc refers to the image data contained in the canvas
    const [imageSrc, setImageSrc] = useState(null);

    // prevImage refers to the previous image state
    const [prevImage, setPrevImage] = useState(null);

    // isDrawing is true when the rectangle is being drawn
    const [isDrawing, setIsDrawing] = useState(false);

    // hex is the hex color picked on the color picker
    const [hex, setHex] = useState("#fff");

    // rgb is the rgb color picked on the color picker and used to color the rectangle
    const [rgb, setRgb] = useState([255, 255, 255]);

    // rect contains the coord of the rectangle drawn
    const [rect, setRect] = useState(null);

    // data used for the rectangle
    const canvasOffSetX = useRef(null);
    const canvasOffSetY = useRef(null);
    const startX = useRef(null);
    const startY = useRef(null);

    // sliderVal refers to the limit value choose to extract the model
    const [sliderVal, setSliderVal] = useState("100");

    useEffect(() => {
      if (canvasRef.current) {
        
        // set the canvas size
        canvasRef.current.height = "500";
        canvasRef.current.width = "500";

        // set the canvas' context
        canvasCtxRef.current = canvasRef.current.getContext("2d");

        if(imageSrc !== null){

          // init context infos
          const context = canvasRef.current.getContext("2d");

          // print the image in the canvas when it's loaded
          const image = new Image();
          image.src = imageSrc;
          image.onload = () => {
            context.drawImage(image, 0, 0);
            setImageSrc(image);
          }
          
          // set the properties for the drawing of the rectangle
          context.lineCap = "round";
          context.strokeStyle = "black";
          context.setLineDash([4, 2]);
          context.lineWidth = 1;
          canvasCtxRef.current = context;
        }
        // init canvasOffSet X and Y
        const canvasOffSet = canvasRef.current.getBoundingClientRect();
        canvasOffSetX.current = canvasOffSet.top;
        canvasOffSetY.current = canvasOffSet.left;
      };
    }, []);

    // this function is called to load the image file
    const handleInputChange = (event) => {
      const reader = new FileReader();
      reader.onloadend = (event) => {
        const src_image = new Image();
  
        src_image.onload = () => {
          if (canvasRef.current && canvasCtxRef.current) {
            // calculate the size of the image for it to fit in the canvas
            var hRatio = canvasRef.current.width / src_image.width    ;
            var vRatio = canvasRef.current.height / src_image.height  ;
            var ratio  = Math.min ( hRatio, vRatio );

            // clear the canvas before drawing the loaded image 
            canvasCtxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            canvasCtxRef.current.drawImage(src_image, 0, 0, src_image.width, src_image.height, 0,0,src_image.width*ratio, src_image.height*ratio);
            var imageData = canvasRef.current.toDataURL("image/jpg");

            // set the new imageSrc value
            setImageSrc(imageData);
          }
        };
        src_image.src = event.target.result;
      };
      reader.readAsDataURL(event.target.files[0]);
    };


    const startDrawingRectangle = ({nativeEvent}) => {
      // prevent the event to be called more than once
      nativeEvent.preventDefault();
      nativeEvent.stopPropagation();

      // update the starting point of the rectangle
      startX.current = nativeEvent.clientX - canvasOffSetX.current;
      startY.current = nativeEvent.clientY - canvasOffSetY.current;

      setIsDrawing(true);
    };


    const drawRectangle = ({nativeEvent}) => {
      if (!isDrawing) {
          return;
      }

      // prevent the event to be called more than once
      nativeEvent.preventDefault();
      nativeEvent.stopPropagation();

      // update the coord of the rectangle
      const newMouseX = nativeEvent.clientX - canvasOffSetX.current;
      const newMouseY = nativeEvent.clientY - canvasOffSetY.current;

      const rectWidht = newMouseX - startX.current;
      const rectHeight = newMouseY - startY.current;

      // clear the canvas to get rid of the rectangle
      canvasCtxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // redraw image
      canvasCtxRef.current.drawImage(imageSrc,0,0);

      // draw the rectangle around the canvas
      canvasCtxRef.current.strokeRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // create the new rectangle
      canvasCtxRef.current.strokeRect(startX.current, startY.current, rectWidht, rectHeight);
      setRect([startX.current, startY.current, rectWidht, rectHeight]);
    };


    const stopDrawingRectangle = () => {
        setIsDrawing(false);
    };


    const reinitializeRectangle = () => {

      setRect(null);
      // clear the canvas to get rid of the rectangle
      canvasCtxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // draw the rectangle around the canvas
      canvasCtxRef.current.strokeRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // redraw image
      canvasCtxRef.current.drawImage(imageSrc,0,0);
    };

    const colorizeSelectedRectangle = (color) => {
      if (!isDrawing && rect[2] != 0 && rect[3] != 0){

          console.log(color);

          // update the previous stage of the image
          setPrevImage(imageSrc); 

          // clear rect and redraw image
          canvasCtxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          canvasCtxRef.current.drawImage(imageSrc,0,0);

          // get the image data in the rectangle
          const rectangleData = canvasCtxRef.current.getImageData(rect[0], rect[1], rect[2], rect[3]);
          var pix = rectangleData.data;

          // loop over each pixel and sets the new color.
          for (var i = 0, n = pix.length; i < n; i += 4) {
              pix[i  ] = color[0]; // red
              pix[i+1] = color[1]; // green
              pix[i+2] = color[2]; // blue
              // i+3 is alpha (the fourth element)
          }

          // get x and y from the rectangle
          var x = rect[2] < 0 ? rect[0] + rect[2] : rect[0];
          var y = rect[3] < 0 ? rect[1] + rect[3] : rect[1];

          // draw the ImageData at the given (x,y) coordinates.
          canvasCtxRef.current.putImageData(rectangleData, x, y);

          // the rectangle has been used
          setRect(null);

          // set the new Image data
          var newImage = new Image();
          newImage.src = canvasRef.current.toDataURL();
          setImageSrc(newImage);

          // draw the rectangle around the canvas
          canvasCtxRef.current.strokeRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    };

    const retrievePreviousImageState = () => {
      // clear rect and redraw image
      canvasCtxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      canvasCtxRef.current.drawImage(prevImage,0,0);

      // draw the rectangle around the canvas
      canvasCtxRef.current.strokeRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // update image and prevImage
      setImageSrc(prevImage);
      setPrevImage(null);
    };

    const hexToRGB = (hex) => {
      hex = "0x" + hex.substring(1,7);
      let r = (hex >> 16) & 0xFF;
      let g = (hex >> 8) & 0xFF;
      let b = hex & 0xFF;
      //console.log([[r, g, b]]);
      return [r, g, b];
    };  

    const extractPNG = (limit) => {

      // get current image data
      const imageData = canvasCtxRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      var pix = imageData.data;

      // loop over each pixel and change the transparency of the pixel when needed
      for (var i = 0, n = pix.length; i < n; i +=4) {
        if ((pix[i] + pix[i+1] + pix[i+2]) / 3 > limit){
          pix[i+3] = 1; // make the pixel transparent
        }
      }

      // draw the transformed imageData in canvas
      canvasCtxRef.current.putImageData(imageData, 0, 0);      
    };

    const saveImage = () => {
      canvasRef.current.toBlob(function(blob) {
        saveAs(blob, "emboidery_model");
        }, "image/png");
    };

    return (
      <>
      <h1>Pattern Editor </h1>
        <input type="file" id="uploadFile" accept="image/png, image/jpeg" onChange={handleInputChange} />
          <canvas
              className="canvas-container-image"
              ref={canvasRef}
              onMouseDown={startDrawingRectangle}
              onMouseMove={drawRectangle}
              onMouseUp={stopDrawingRectangle}
              onMouseLeave={stopDrawingRectangle}
            ></canvas>
            <div>
          {imageSrc != null && 
          <button onClick={() => extractPNG(sliderVal)}>extract PNG</button>
          }
          {imageSrc != null && 
          <input type="range" min="0" max="255" value={sliderVal} onChange={(e) => setSliderVal(e.target.value)} className="slider" id="greyRange" />
          }
          {imageSrc != null && 
          <button onClick={() => saveImage()}>save model</button>
          }
          {rect != null && (
                <button onClick={() => colorizeSelectedRectangle(rgb)}>colorize rectangle</button>
                )
            }
            {rect != null && (
                <button onClick={() => reinitializeRectangle()}>stop selection</button>
                )
            }
            {prevImage != null &&
            (<button onClick={() => retrievePreviousImageState()}>Undo</button>)}
            <div style={{ background: hex, marginTop: 30, padding: 10 }}>
              This is the color picked.
            </div>
            <Sketch
                style={{ marginLeft: 20 }}
                color={hex}
                disableAlpha="true"
                onChange={(color) => {
                    setHex(color.hex);
                    setRgb(hexToRGB(color.hex));
                }}
            />
          </div>
      </>
    );
}

/*
onMouseDown={startDrawingRectangle}
              onMouseMove={drawRectangle}
              onMouseUp={stopDrawingRectangle}
              onMouseLeave={stopDrawingRectangle}
              */

export default Editor;