import {useEffect, useRef, useState} from 'react';

import {Sketch} from '@uiw/react-color';

const DrawRectangle = () => {
    const canvasRef = useRef(null);
    const canvasCtxRef = useRef(null);
    
    // isDrawing is true when the rectangle is being drawn
    const [isDrawing, setIsDrawing] = useState(false);

    // hex is the hex color picked on the color picker
    const [hex, setHex] = useState("#fff");

    // rgb is the rgb color picked on the color picker and used to color the rectangle
    const [rgb, setRgb] = useState([255, 255, 255]);

    // rect contains the coord of the rectangle drawn
    const [rect, setRect] = useState(null);

    // image refers to the image data contained in the canvas
    const [imageSrc, setImageSrc] = useState(null);

    // prevImage refers to the previous image state
    const [prevImage, setPrevImage] = useState(null);

    // data used for the rectangle
    const canvasOffSetX = useRef(null);
    const canvasOffSetY = useRef(null);
    const startX = useRef(null);
    const startY = useRef(null);

    useEffect(() => {

        // init canvas infos
        const canvas = canvasRef.current;
        canvas.width = 500;
        canvas.height = 500;

        // init context infos
        const context = canvas.getContext("2d");
        
        // upload the image to draw it in the canvas
        const imageTest = new Image();
        imageTest.src = "https://upload.wikimedia.org/wikipedia/commons/c/c5/Colorwheel.svg";
        imageTest.crossOrigin = "Anonymous";
        imageTest.onload = function() {
            context.drawImage(imageTest,0,0);
            setImageSrc(imageTest);
        }

        // set the properties for the drawing of the rectangle
        context.lineCap = "round";
        context.strokeStyle = "black";
        context.setLineDash([4, 2]);
        context.lineWidth = 1;
        canvasCtxRef.current = context;

        // draw the rectangle around the canvas
        canvasCtxRef.current.strokeRect(0, 0, canvas.width, canvas.height);

        // init canvasOffSet X and Y
        const canvasOffSet = canvas.getBoundingClientRect();
        canvasOffSetX.current = canvasOffSet.top;
        canvasOffSetY.current = canvasOffSet.left;
    }, []);

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

    return (
        <div>
            <canvas className="canvas-container-rect"
                ref={canvasRef}
                onMouseDown={startDrawingRectangle}
                onMouseMove={drawRectangle}
                onMouseUp={stopDrawingRectangle}
                onMouseLeave={stopDrawingRectangle}>
            </canvas>
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
    )
}


export default DrawRectangle;