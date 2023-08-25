import React, { useState, useEffect , useRef} from 'react';
//import colors from './colors.jpg';
//import { saveAs } from 'file-saver';

function Editor(props) {

    const canvasRef = useRef(null);
    const canvasCtxRef = useRef(null);
    const [imageSrc, setImageSrc] = useState(null);
    //const [imageSelected, setImageSelected] = useState(false);

    const handleInputChange = (event) => {
      //setImageSelected(true);
      const reader = new FileReader();
      reader.onloadend = (event) => {
        const src_image = new Image();
  
        src_image.onload = () => {
          if (canvasRef.current && canvasCtxRef.current) {

            var hRatio = canvasRef.current.width / src_image.width    ;
            var vRatio = canvasRef.current.height / src_image.height  ;
            var ratio  = Math.min ( hRatio, vRatio );

            canvasCtxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            canvasCtxRef.current.drawImage(src_image, 0, 0, src_image.width, src_image.height, 0,0,src_image.width*ratio, src_image.height*ratio);
            var imageData = canvasRef.current.toDataURL("image/jpg");
            setImageSrc(imageData);
            console.log(imageData);
          }
        };
        src_image.src = event.target.result;
      };
      reader.readAsDataURL(event.target.files[0]);
    };

    useEffect(() => {
        if (canvasRef.current) {
          // resize image to canvas
          canvasRef.current.height = "500";
          canvasRef.current.width = "500";

          canvasCtxRef.current = canvasRef.current.getContext("2d");
          canvasCtxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          if(imageSrc !== null){
            const image = new Image();
            image.src = imageSrc;
            image.onload = () => {
              canvasCtxRef.current.drawImage(image, 0, 0, 500, 500);
            }
          }
      };
        
        /*const hoveredColor = document.getElementById('hovered-color');
        const selectedColor = document.getElementById('selected-color');


        function pick(event, destination) {
        const bounding = canvasRef.current.getBoundingClientRect();
        const x = event.clientX - bounding.left;
        const y = event.clientY - bounding.top;
        const pixel = canvasCtxRef.current.getImageData(x, y, 1, 1);
        const data = pixel.data;

        const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
        destination.style.background = rgba;
        destination.textContent = rgba;

        return rgba;
        }*/

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