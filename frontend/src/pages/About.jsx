import React from "react";
import { motion } from "framer-motion";
import { FaBullseye, FaLightbulb, FaUsers } from "react-icons/fa"; // Example icons

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5,
};

const About = () => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="container mx-auto px-6 py-12 md:py-20 min-h-[calc(100vh-150px)]" // Adjust min-height based on navbar/footer
    >
      <header className="text-center mb-12 md:mb-16">
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          About Excelytics
        </motion.h1>
        <motion.p
          className="text-lg text-gray-600 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Empowering you to make data-driven decisions with ease and precision.
        </motion.p>
      </header>

      <section className="grid md:grid-cols-2 gap-10 md:gap-16 items-center mb-12 md:mb-20">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <img
            src="/team-image.png" // Replace with your own illustration or a relevant stock image
            alt="Team working on analytics"
            className="rounded-lg shadow-xl w-full h-auto max-w-md mx-auto"
          />
        </motion.div>
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.2 }}
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
            Our Story
          </h2>
          <p className="text-gray-600 mb-4 leading-relaxed">
            Excelytics was born from a simple idea: to make sophisticated data analysis accessible to everyone, regardless of their technical expertise. We saw professionals spending countless hours wrestling with complex spreadsheets and knew there had to be a better way.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Our platform transforms your raw Excel data into clear, actionable insights, interactive charts, and intelligent summaries, helping you unlock the true potential hidden within your numbers.
          </p>
        </motion.div>
      </section>

      <section className="mb-12 md:mb-20">
        <h2 className="text-3xl font-semibold text-center text-gray-700 mb-10">
          Our Core Values
        </h2>
        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-lg shadow-md"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <FaBullseye className="text-4xl text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Precision</h3>
            <p className="text-gray-600 text-sm">
              Delivering accurate and reliable analytics you can trust for critical decisions.
            </p>
          </motion.div>
          <motion.div
            className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-lg shadow-md"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <FaLightbulb className="text-4xl text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Innovation</h3>
            <p className="text-gray-600 text-sm">
              Continuously evolving our platform with cutting-edge features and smart insights.
            </p>
          </motion.div>
          <motion.div
            className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-lg shadow-md"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <FaUsers className="text-4xl text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">User-Centricity</h3>
            <p className="text-gray-600 text-sm">
              Designing intuitive experiences that empower users of all skill levels.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Optional: Call to Action */}
      {/* <section className="text-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Ready to explore?</h2>
        <Button onClick={() => navigate('/features')} className="bg-green-600 hover:bg-green-700">
          See Our Features
        </Button>
      </section> */}
    </motion.div>
  );
};

export default About;