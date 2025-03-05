import * as React from "react";

const PngComponent = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img
    src="https://i.ibb.co/nPsZQvb/image.png" // Replace this with the actual path to your PNG file
    alt="Description of the image" // Provide an alt text for accessibility
    {...props}
  />
);

export default PngComponent;
