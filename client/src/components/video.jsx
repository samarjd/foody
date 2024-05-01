import React from 'react';
import videoLink from '../assets/images/file.mp4'

const VideoSection = () => {
  return (
    <section className='video-section'>
      <video autoPlay muted playsInline={true} loop>
        <source src={videoLink} type="video/mp4" />
      </video>

      <div className='content'>
        <h1>WELCOME TO FOODY</h1>
        <h3>All the Latest recipies are available on our bolg</h3>
        <h6>We are all told, “live your life to the fullest”; I am here to do just that. Foody serves as a vessel to project my passions, and clue in my loyal readers as to what inspires me in this crazy world. So, sit back, relax, and read on. you will find whatever you are looking for whether it is breakfast, lunch or dinner.</h6>
      </div>
    </section>
  );
};

export default VideoSection;
