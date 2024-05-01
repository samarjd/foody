import React, {useEffect} from 'react';
import videoLink from '../assets/images/about.mp4'
import { logUserAction } from '../components/loginAction';

export default function ContactPage() {
    useEffect(() => {
        logUserAction('visited the About Page');
    }, []);

  return (
    <section className='about video-section'>
        <video autoPlay muted playsInline={true} loop>
            <source src={videoLink} type="video/mp4" />
        </video>

        <div className='sub-content'>
            <h1>HOW IT GOT STARTED</h1>
            <h2>The Roots</h2>
            <p>
                I believe you must bring your whole self to the table if you want to thrive in today’s crazy world; your personality, your sense of humor, and most importantly, your heart. All of these elements brought me to start Foody.
                
                Ever since I launched this project, the blog has been thriving and has quickly gained a loyal following. To see what I’ve been up to, browse my site, learn about my passions, and explore what excites and interests you as well.
            </p>
            <h2>Our Journey Begins</h2>
            <h3>Origins</h3>
            <p>
                Every great venture starts with a spark of inspiration. For us, it was a shared love for food, culture, and community. We envisioned a platform where food enthusiasts could come together to celebrate culinary delights from around the globe.
            </p>
            <h3>The Birth of Foody</h3>
            <p>
                With this vision in mind, Foody was born. It began as a humble blog, where we shared our gastronomic adventures, recipes, and insights into the vibrant world of food. Little did we know, it would evolve into much more than just a blog.
            </p>
            <h2>Our Mission</h2>
            <h3>Bringing People Together</h3>
            <p>
                At Foody, our mission is simple yet profound: to bring people together through the universal language of food. We believe that sharing a meal is more than just nourishing the body—it's about fostering connections, bridging cultures, and creating lasting memories.
            </p>
            <h3>Celebrating Diversity</h3>
            <p>
                Food is a reflection of our diverse world, and we celebrate this diversity in every dish we feature. From traditional recipes passed down through generations to innovative fusion cuisines, we embrace the rich tapestry of flavors that make our planet so unique.
            </p>
            <h2>Our Commitment</h2>
            <h3>Quality and Authenticity</h3>
            <p>
                In a world of fast food and shortcuts, we remain committed to quality and authenticity. We source the finest ingredients, prioritize sustainable practices, and honor the time-honored techniques that have been perfected over centuries.
            </p>
            <h3>Continuous Growth</h3>
            <p>
                As we continue to grow, our commitment to excellence remains unwavering. We constantly seek new culinary experiences, collaborate with passionate chefs and artisans, and push the boundaries of what's possible in the world of food.
            </p>
            <h2>Join Us on the Journey</h2>
            <p>
                Whether you're a seasoned chef, a curious foodie, or simply someone who appreciates a good meal, we invite you to join us on this delicious journey. Explore our blog, try out our recipes, and embark on your own culinary adventures. Together, let's savor the flavors of life.
            </p>
        </div>
    </section>
  );
}