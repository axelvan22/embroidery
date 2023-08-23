import { useRef, useEffect } from 'react';

export function Canvas(props) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    context.fillStyle = 'red';
    context.fillRect(0, 0, props.width, props.height);

    const clickHandler = () => {
      context.fillStyle = 'blue';
      context.fillRect(0, 0, props.width, props.height);
    };

    const pick = (event) => {
        event.stopImmediatePropagation();
        const bounding = canvas.getBoundingClientRect();
        const x = event.clientX - bounding.left;
        const y = event.clientY - bounding.top;
        const pixel = context.getImageData(x, y, 1, 1);
        const data = pixel.data;

        console.log([x,y]);
    };
    canvas.addEventListener('click', (event) => pick(event));
  }, []);

  return <canvas ref={canvasRef} width={props.width} height={props.height} />;
}