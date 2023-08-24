import {useEffect, useRef, useState} from 'react';

const DrawRectangle = () => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    
    // isDrawing is true when the rectangle is being drawn
    const [isDrawing, setIsDrawing] = useState(false);

    // rect contains the coord of the rectangle drawn
    const [rect, setRect] = useState(null);

    // image refers to the image data contained in the canvas
    const [image, setImage] = useState(null);

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
            setImage(imageTest);
        }

        // set the properties for the drawing of the rectangle
        context.lineCap = "round";
        context.strokeStyle = "black";
        context.setLineDash([4, 2]);
        context.lineWidth = 1;
        contextRef.current = context;

        // init canvasOffSet X and Y
        const canvasOffSet = canvas.getBoundingClientRect();
        canvasOffSetX.current = canvasOffSet.top;
        canvasOffSetY.current = canvasOffSet.left;
    }, []);

    const colorizeSelectedRectangle = (color) => {
        if (!isDrawing){

            // clear rect and redraw image
            contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            contextRef.current.drawImage(image,0,0);

            // get the image data in the rectangle
            const rectangleData = contextRef.current.getImageData(rect[0], rect[1], rect[2], rect[3]);
            var pix = rectangleData.data;

            // Loop over each pixel and sets the new color.
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
            contextRef.current.putImageData(rectangleData, x, y);

            // the rectangle has been used
            setRect(null);

            // set the new Image data
            var newImage = new Image();
            newImage.src = canvasRef.current.toDataURL();
            setImage(newImage);
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
        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // redraw image
        contextRef.current.drawImage(image,0,0);

        // create the new rectangle
        contextRef.current.strokeRect(startX.current, startY.current, rectWidht, rectHeight);
        setRect([startX.current, startY.current, rectWidht, rectHeight]);
    };

    const stopDrawingRectangle = () => {
        setIsDrawing(false);
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
            {rect != null &&
            (<button onClick={() => colorizeSelectedRectangle([155,155,155])}>colorize in grey</button>)}
        </div>
    )
}

export default DrawRectangle;