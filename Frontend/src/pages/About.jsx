import { Link } from 'react-router-dom';

function About() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-black dark:text-white min-h-screen">
      {/* About Section */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-primary-gradient-start to-primary-gradient-end text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6">
            About Us
          </h1>
          <p className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto mb-8 md:mb-12">
            Discover our mission, values, and the passion driving our innovative widget-building platform.
          </p>
        </div>
      </section>

      {/* Mission, Vision, Values Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Mission Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 text-accent-cyan">Our Mission</h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Empower creators with intuitive tools to transform ideas into vibrant, impactful widgets, making creation accessible and fun for all.
              </p>
            </div>
            {/* Vision Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 text-accent-orange">Our Vision</h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                A world where creativity thrives without limits, powered by tools that inspire innovation and collaboration globally.
              </p>
            </div>
            {/* Values Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 text-button-yellow">Our Values</h2>
              <ul className="list-inside list-disc text-sm sm:text-base text-gray-600 dark:text-gray-300 space-y-2">
                <li>Innovation: Pushing creative boundaries.</li>
                <li>Collaboration: Building together.</li>
                <li>Integrity: Honest and transparent.</li>
                <li>Customer-Centric: Your success is ours.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Our Journey Section */}
      <section className="py-12 md:py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-black dark:text-white">
            Our Journey
          </h2>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-primary-gradient-start to-primary-gradient-end h-full"></div>
            {[
              {
                year: '2020',
                title: 'Founded',
                description: 'Started with a vision to empower creators.',
                side: 'left',
              },
              {
                year: '2022',
                title: 'First Release',
                description: 'Launched our widget builder to the public.',
                side: 'right',
              },
              {
                year: '2024',
                title: 'Global Reach',
                description: 'Expanded to support creators worldwide.',
                side: 'left',
              },
              {
                year: '2025',
                title: 'Community Growth',
                description: 'Hit 1M active users and counting!',
                side: 'right',
              },
            ].map((milestone, index) => (
              <div
                key={index}
                className={`mb-8 flex justify-${milestone.side === 'left' ? 'start' : 'end'} items-center w-full`}
              >
                <div
                  className={`w-5/12 ${milestone.side === 'left' ? 'text-right pr-8' : 'text-left pl-8'}`}
                >
                  <h3 className="text-lg sm:text-xl font-semibold text-button-yellow">{milestone.year}</h3>
                  <h4 className="text-base sm:text-lg font-medium text-black dark:text-white">{milestone.title}</h4>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{milestone.description}</p>
                </div>
                <div className="w-2/12 flex justify-center">
                  <div className="w-4 h-4 bg-accent-cyan rounded-full"></div>
                </div>
                <div className="w-5/12"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-primary-gradient-start to-primary-gradient-end text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Join Our Creative Community</h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8">
            Be part of a vibrant platform where your ideas come to life.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-button-yellow hover:bg-yellow-500 text-black font-medium text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-cyan"
            aria-label="Sign up now"
          >
            Sign Up Now
          </Link>
        </div>
      </section>
    </div>
  );
}

export default About;