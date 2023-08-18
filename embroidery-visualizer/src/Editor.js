import React, { useState, useEffect , useRef} from 'react';
//import colors from './colors.jpg';
//import { saveAs } from 'file-saver';

function Editor(props) {

    const canvasRef = useRef(null);
    const canvasCtxRef = useRef(null);
    const [imageSrc, setImageSrc] = useState("");
    const [imageSelected, setImageSelected] = useState(false);

    const handleInputChange = (event) => {
      const reader = new FileReader();
      reader.onloadend = (event) => {
        const src_image = new Image();
  
        src_image.onload = () => {
          if (canvasRef.current && canvasCtxRef.current) {
            canvasRef.current.height = "500";
            canvasRef.current.width = "500";
            canvasCtxRef.current.drawImage(src_image, 0, 0);
            var imageData = canvasRef.current.toDataURL("image/jpg");
            setImageSrc(imageData);
          }
        };
        src_image.src = event.target.result;
      };
      reader.readAsDataURL(event.target.files[0]);
      setImageSelected(true);
    };

    useEffect(() => {
        if (canvasRef.current) {
          canvasCtxRef.current = canvasRef.current.getContext("2d");
        }
        const hoveredColor = document.getElementById('hovered-color');
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
        }

        canvasRef.current.addEventListener('mousemove', event => pick(event, hoveredColor));
        canvasRef.current.addEventListener('click', event => pick(event, selectedColor));
    }, []);

    return (
      <>
      <h1>Pattern Editor </h1>
        <input type="file" id="input" onChange={handleInputChange} />
          <table>
          <thead>
            <tr>
              <th>Source</th>
              <th>Hovered color</th>
              <th>Selected color</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <img id="output" src={imageSrc} />
                <canvas
                    id="canvas"
                    ref={canvasRef}
                    style={{ display: "none" }}
                  ></canvas>
              </td>
              <td class="color-cell" id="hovered-color"></td>
              <td class="color-cell" id="selected-color"></td>
            </tr>
          </tbody>
        </table>
      </>
    );
}

/*
<div>
          <img id="output" src={imageSrc} />
          <canvas
              id="canvas"
              ref={canvasRef}
              style={{ display: "none" }}
            ></canvas>
        </div>
        */
export default Editor;