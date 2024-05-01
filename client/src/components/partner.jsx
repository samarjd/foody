import { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Partner = () => {
  const [partImages, setPartImages] = useState([]);

  useEffect(() => {
    const importImages = () => {
      try {
        const partContext = require.context(
          "../assets/images/partner",
          false,
          /\.(jpg|jpeg|png|svg|gif|webp)$/
        );
        const images = partContext.keys().map(key => partContext(key));
        setPartImages(images);
      } catch (error) {
        console.error("Error loading images:", error);
      }
    };
  
    importImages();
  }, []);
  const settings = {
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    speed: 6000,
    pauseOnHover: false,
    cssEase: 'linear',
    arrows: false,
  };

  return (
    <div className="part-section">
      <Slider {...settings}>
      {partImages.map((base64String, index) => (
        <div key={index}>
          <img src={base64String} alt={`Partner ${index + 1}`} />
        </div>
      ))}
      </Slider>
    </div>
  );
};

export default Partner;