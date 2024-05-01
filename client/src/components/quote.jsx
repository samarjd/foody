import videoSource from '../assets/images/file2.webm'

export default function Quote(){
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <section className='quote-section'>
        <div className='quote-text'>
            <h1>“There is no love sincerer than the love of food.”</h1>
            <h3>George Bernard Shaw, Man and <br/>Superman</h3>
            <div className="scroll-to-top">
              <button onClick={scrollToTop}>Scroll to top</button>
            </div>
        </div>
        <div className="videoChef">
          <video autoPlay muted loop controls playsInline={true}>
              <source src={videoSource} type="video/webm" />
          </video>
        </div>
    </section>
  );
};