import {motion} from "framer-motion"
const Home = () => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black">
      <div className="container mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-6xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-fuchsia-500 to-purple-600 drop-shadow-lg"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-fuchsia-500 to-purple-600">
              ReviewBot
            </span>
            -<span className="text-gray-100">Scrape, Summarize & Analyze</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 font-medium"
          >
            Transform customer feedback into
            <span className="text-fuchsia-400 font-semibold">
              actionable insights
            </span>
            with our AI-powered review analysis platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <a
              href="#"
              className="px-8 py-4 border-2 border-fuchsia-500 text-fuchsia-300 rounded-xl hover:bg-fuchsia-900/20 transition font-semibold text-lg hover:scale-105 shadow-lg"
            >
              Start Free Trial
            </a>
            <a
              href="#"
              className="px-8 py-4 border-2 border-fuchsia-500 text-fuchsia-300 rounded-xl hover:bg-fuchsia-900/20 transition font-semibold text-lg hover:scale-105 shadow-lg"
            >
              See Demo
            </a>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 rounded-2xl shadow-2xl hover:shadow-fuchsia-600/50 transition group border border-gray-700 hover:border-fuchsia-400"
          >
            <div className="w-16 h-16 bg-gradient-to-tr from-fuchsia-700 via-indigo-700 to-purple-800 rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-fuchsia-300 group-hover:text-indigo-200 transition"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-fuchsia-200">
              Smart Scraping
            </h3>
            <p className="text-gray-300">
              Automatically collect reviews from platforms including Amazon.
              (Flipkart to be implemented)
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 rounded-2xl shadow-2xl hover:shadow-fuchsia-600/50 transition group border border-gray-700 hover:border-fuchsia-400"
          >
            <div className="w-16 h-16 bg-gradient-to-tr from-fuchsia-700 via-indigo-700 to-purple-800 rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-fuchsia-300 group-hover:text-indigo-200 transition"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-fuchsia-200">
              AI Summarization
            </h3>
            <p className="text-gray-300">
              Get
              <span className="text-fuchsia-300 font-semibold">
                concise summaries
              </span>
              of thousands of reviews in seconds using advanced NLP.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 rounded-2xl shadow-2xl hover:shadow-fuchsia-600/50 transition group border border-gray-700 hover:border-fuchsia-400"
          >
            <div className="w-16 h-16 bg-gradient-to-tr from-fuchsia-700 via-indigo-700 to-purple-800 rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-fuchsia-300 group-hover:text-indigo-200 transition"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-fuchsia-200">
              Sentiment Analysis
            </h3>
            <p className="text-gray-300">
              Understand customer emotions with our
              <span className="text-indigo-300 font-semibold">
                machine learning models
              </span>
              .
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Home;