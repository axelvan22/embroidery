import {useEffect, useRef, useState} from 'react';
//import "colors.jpg";

const DrawRectangle = () => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const rectRef = useRef(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [rect, setRect] = useState(null);
    const [image, setImage] = useState(null);

    const canvasOffSetX = useRef(null);
    const canvasOffSetY = useRef(null);
    const startX = useRef(null);
    const startY = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = 500;
        canvas.height = 500;

        const context = canvas.getContext("2d");
        const imageTest = new Image();
        imageTest.src = "https://upload.wikimedia.org/wikipedia/commons/c/c5/Colorwheel.svg";
        imageTest.onload = function() {
            context.drawImage(imageTest,0,0);
            setImage(imageTest);
        }
        context.lineCap = "round";
        context.strokeStyle = "black";
        context.setLineDash([4, 2]);
        context.lineWidth = 1;
        contextRef.current = context;

        const canvasOffSet = canvas.getBoundingClientRect();
        canvasOffSetX.current = canvasOffSet.top;
        canvasOffSetY.current = canvasOffSet.left;
    }, []);

    const startDrawingRectangle = ({nativeEvent}) => {
        nativeEvent.preventDefault();
        nativeEvent.stopPropagation();

        startX.current = nativeEvent.clientX - canvasOffSetX.current;
        startY.current = nativeEvent.clientY - canvasOffSetY.current;

        setIsDrawing(true);
    };

    const drawRectangle = ({nativeEvent}) => {
        if (!isDrawing) {
            return;
        }

        nativeEvent.preventDefault();
        nativeEvent.stopPropagation();

        const newMouseX = nativeEvent.clientX - canvasOffSetX.current;
        const newMouseY = nativeEvent.clientY - canvasOffSetY.current;

        const rectWidht = newMouseX - startX.current;
        const rectHeight = newMouseY - startY.current;

        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        //redraw image
        contextRef.current.drawImage(image,0,0);

        contextRef.current.strokeRect(startX.current, startY.current, rectWidht, rectHeight);
        setRect([startX.current, startY.current, rectWidht, rectHeight]);
    };

    const stopDrawingRectangle = () => {
        setIsDrawing(false);
        console.log(rect);
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
        </div>
    )
}

export default DrawRectangle;