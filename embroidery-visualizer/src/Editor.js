import React, { useState, useEffect , useRef} from 'react';
//import colors from './colors.jpg';
//import { saveAs } from 'file-saver';

function Editor(props) {

    // initialize canvas and context
    const canvasRef = useRef(null);
    const canvasCtxRef = useRef(null);

    // imageSrc refers to the image data contained in the canvas
    const [imageSrc, setImageSrc] = useState(null);

    useEffect(() => {
      if (canvasRef.current) {
        // set the canvas size
        canvasRef.current.height = "500";
        canvasRef.current.width = "500";

        // set the canvas' context
        canvasCtxRef.current = canvasRef.current.getContext("2d");

        // print the image in the canvas when it's loaded
        if(imageSrc !== null){
          const image = new Image();
          image.src = imageSrc;
          image.onload = () => {
            canvasCtxRef.current.drawImage(image, 0, 0,);
          }
        }
      };

        /*const moveHandler = () =>{
          console.log("Mouse moved on canvas");
        };

        const clickHandler = () =>{
          console.log("Mouse clicked canvas");
        };

        canvasRef.current.addEventListener('mousemove', moveHandler);
        canvasRef.current.addEventListener('click', clickHandler);
        /*return () => {
          canvasRef.current.removeEventListener('click', clickHandler);
          canvasRef.current.removeEventListener('mousemove', moveHandler);
        }*/
      }, [imageSrc]);

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

    return (
      <>
      <h1>Pattern Editor </h1>
        <input type="file" id="uploadFile" accept="image/png, image/jpeg" onChange={handleInputChange} />
          <canvas
              className="canvas-container-image"
              ref={canvasRef}
            ></canvas>
      </>
    );
}

export default Editor;