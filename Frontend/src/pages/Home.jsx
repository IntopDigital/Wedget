import Slider from '../components/Slider';
import { Link } from 'react-router-dom';
import {
  SparklesIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import Widget from './Widget';

function Home() {
  return (
    <div className="bg-text-white dark:bg-gray-900 text-text-black dark:text-text-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-gradient-start to-primary-gradient-end text-text-white py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                Create Stunning Widgets
              </h1>
              <p className="text-base sm:text-lg lg:text-xl mb-6">
                Unleash your creativity with our vibrant, easy-to-use widget builder.
              </p>
              <Link
                to="/signup"
                className="inline-block bg-button-yellow hover:bg-button-yellow/90 text-text-black font-medium text-sm sm:text-base px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                aria-label="Get started with MyApp"
              >
                Get Started
              </Link>
            </div>
            {/* <div className="order-first md:order-last">
              <Slider />
            </div> */}
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-center mb-12">
            Why Our Widgets Shine
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[ 
              {
                icon: SparklesIcon,
                title: 'Vibrant Design',
                description: 'Craft eye-catching widgets with our colorful editor.',
                color: 'text-accent-cyan',
              },
              {
                icon: ShieldCheckIcon,
                title: 'Reliable',
                description: 'Trust our secure platform for worry-free widget creation.',
                color: 'text-accent-orange',
              },
              {
                icon: RocketLaunchIcon,
                title: 'Blazing Fast',
                description: 'Build and deploy widgets with lightning speed.',
                color: 'text-button-yellow',
              },
              {
                icon: UsersIcon,
                title: 'Team Ready',
                description: 'Collaborate seamlessly with your creative crew.',
                color: 'text-primary-gradient-start',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-text-white dark:bg-gray-900 p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-700"
              >
                <feature.icon className={`w-10 h-10 ${feature.color} mb-4`} />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-base lg:text-lg">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-center mb-12">
            Loved by Creators
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[ 
              {
                name: 'Sarah Kim',
                role: 'UI Designer',
                quote: 'The vibrant colors and flexibility make my designs pop!',
              },
              {
                name: 'Michael Chen',
                role: 'Developer',
                quote: 'I built a widget in minutes. It’s fast and fun to use.',
              },
              {
                name: 'Emma Davis',
                role: 'Creative Lead',
                quote: 'Our team loves the collaborative features. Highly recommend!',
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-text-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <p className="text-base italic mb-4">“{testimonial.quote}”</p>
                <p className="text-lg font-semibold">{testimonial.name}</p>
                <p className="text-base text-gray-500 dark:text-gray-400">
                  {testimonial.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="bg-gradient-to-r from-primary-gradient-start to-primary-gradient-end text-text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold mb-4">Start Creating Today</h2>
          <p className="text-lg mb-8">
            Join our community of creators and bring your widget ideas to life.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-button-yellow hover:bg-button-yellow/90 text-text-black font-medium text-sm sm:text-base px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-cyan"
            aria-label="Sign up now"
          >
            Sign Up Now
          </Link>
        </div>
      </section>
  
    </div>
  );
}
export default Home;
