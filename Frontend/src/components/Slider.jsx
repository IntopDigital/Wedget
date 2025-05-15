import { useState, useEffect } from 'react';

const slides = [
  {
    title: 'Welcome to MyApp',
    description: 'Discover amazing features and join our community.',
  },
  {
    title: 'Explore Widgets',
    description: 'Interactive tools to enhance your experience.',
  },
  {
    title: 'Stay Updated',
    description: 'Read our blog for the latest news.',
  },
];

function Slider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-gradient-start to-primary-gradient-end opacity-70 flex flex-col justify-center items-center text-center p-4 md:p-6 lg:p-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
              {slide.title}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white">{slide.description}</p>
          </div>
        </div>
      ))}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-light-accent dark:bg-dark-primary scale-125'
                : 'bg-light-secondary dark:bg-dark-secondary opacity-60 hover:opacity-100'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default Slider;
