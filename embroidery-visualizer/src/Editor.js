import React, { useState, useEffect , useRef} from 'react';
//import colors from './colors.jpg';
import { saveAs } from 'file-saver';
import {Sketch} from '@uiw/react-color';
import './Editor.css';

function Editor(props) {

    // initialize canvas and context
    const canvasRef = useRef(null);
    const canvasCtxRef = useRef(null);

    // isFirstLoaded is true only when the image has been loaded, before any change to the image
    const [isFirstLoaded, setIsFirstLoaded] = useState(false);

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
          // print the image in the canvas when it's loaded
          const image = new Image();
          image.src = imageSrc;
          image.onload = () => {
            canvasCtxRef.current.drawImage(image, 0, 0);
          }
        }

        // set the properties for the drawing of the rectangle
        canvasCtxRef.current.lineCap = "round";
        canvasCtxRef.current.strokeStyle = "black";
        canvasCtxRef.current.setLineDash([4, 2]);
        canvasCtxRef.current.lineWidth = 1;

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

            // set the isFirstLoaded value
            setIsFirstLoaded(true);
          }
        };
        src_image.src = event.target.result;
      };
      reader.readAsDataURL(event.target.files[0]);
    };

    const storeImage = () => {
      var newImage = new Image();
      newImage.src = canvasRef.current.toDataURL();
      setImageSrc(newImage);
    };


    const startDrawingRectangle = ({nativeEvent}) => {
      // prevent the event to be called more than once
      nativeEvent.preventDefault();
      nativeEvent.stopPropagation();

      // store the image before drawing the rectangle
      if (isFirstLoaded) {
        storeImage();
        setIsFirstLoaded(false);
      }

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

      // redraw image
      canvasCtxRef.current.drawImage(imageSrc,0,0);
    };

    const colorizeSelectedRectangle = (color) => {
      if (!isDrawing && rect[2] != 0 && rect[3] != 0){

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
      }
    };

    const retrievePreviousImageState = () => {

      // clear rect and redraw image
      canvasCtxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      canvasCtxRef.current.drawImage(prevImage,0,0);

      // update image and prevImage
      setImageSrc(prevImage);
      setPrevImage(null);
    };

    const hexToRGB = (hex) => {

      hex = "0x" + hex.substring(1,7);
      let r = (hex >> 16) & 0xFF;
      let g = (hex >> 8) & 0xFF;
      let b = hex & 0xFF;

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

      // store the new image value
      storeImage();
    };

    const saveImage = () => {
      canvasRef.current.toBlob(function(blob) {
        saveAs(blob, "emboidery_model");
        }, "image/png");
    };

    return (
      <>
      <div className='left-side-bar'>
        <input type="file" id="uploadFile" accept="image/png, image/jpeg" onChange={handleInputChange} />
        <button onClick={() => saveImage()} disabled={(imageSrc != null)? false : true} >save model</button>
      </div>
      <div className='center-area'>
        <div className='canvas-area'>
          <canvas
              className="canvas-container-image"
              ref={canvasRef}
              onMouseDown={startDrawingRectangle}
              onMouseMove={drawRectangle}
              onMouseUp={stopDrawingRectangle}
              onMouseLeave={stopDrawingRectangle}
            ></canvas>
        </div>
          <button onClick={() => colorizeSelectedRectangle(rgb)} disabled={(rect != null)? false : true} >colorize rectangle</button>
          <button onClick={() => reinitializeRectangle()} disabled={(rect != null)? false : true} >stop selection</button>
          <button onClick={() => retrievePreviousImageState()} disabled={(prevImage != null)? false : true} >Undo</button>
      </div>
          
            <div className='right-side-bar'>
              <div style={{ background: hex }}>
                This is the color picked.
              </div>
              <Sketch
                  style={{ paddingLeft: 50, background: hex }}
                  color={hex}
                  disableAlpha="true"
                  onChange={(color) => {
                      setHex(color.hex);
                      setRgb(hexToRGB(color.hex));
                  }}
              />
              <button onClick={() => extractPNG(sliderVal)} disabled={(imageSrc != null)? false : true} >extract PNG</button>
              <input type="range" min="0" max="255" disabled={(imageSrc != null)? false : true} value={sliderVal} onChange={(e) => setSliderVal(e.target.value)} className="slider" id="greyRange" />
          </div>
      </>
    );
}


export default Editor;