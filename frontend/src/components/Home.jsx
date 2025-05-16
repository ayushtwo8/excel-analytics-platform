import React from "react";
import Navbar from "./Navbar"; // Assuming you have this
import { Button } from "./ui/button"; // Assuming you have this Shadcn UI button
import { FaChartLine, FaLightbulb, FaHistory, FaLock, FaShieldAlt, FaUsers, FaCogs } from "react-icons/fa";
import { FaArrowRightLong } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Animation variants for Framer Motion
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" } },
};

const cardContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Stagger the animation of child elements
      delayChildren: 0.3,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const features = [
  {
    icon: <FaChartLine className="text-4xl text-green-500 mb-4" />,
    title: "Powerful Analytics",
    description: "Dive deep into your data with robust analytical tools and visualizations.",
  },
  {
    icon: <FaLightbulb className="text-4xl text-yellow-500 mb-4" />,
    title: "Smart Insights",
    description: "Automatically uncover trends, patterns, and actionable insights from your spreadsheets.",
  },
  {
    icon: <FaHistory className="text-4xl text-blue-500 mb-4" />,
    title: "Version History",
    description: "Track changes and revert to previous versions of your analyses with ease.",
  },
  {
    icon: <FaLock className="text-4xl text-red-500 mb-4" />,
    title: "Data Privacy",
    description: "Your data is yours. We prioritize privacy with strong encryption and controls.",
  },
  {
    icon: <FaShieldAlt className="text-4xl text-purple-500 mb-4" />,
    title: "Top-tier Security",
    description: "Bank-level security measures to protect your sensitive information at all times.",
  },
  {
    icon: <FaUsers className="text-4xl text-teal-500 mb-4" />,
    title: "Collaboration",
    description: "Share your dashboards and insights securely with your team members.",
  },
  {
    icon: <FaCogs className="text-4xl text-indigo-500 mb-4" />,
    title: "Customizable Dashboards",
    description: "Tailor dashboards to your specific needs and KPIs for a personalized experience.",
  },
];


const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      {/* Hero Section */}
      <div className="w-full min-h-[calc(100vh-80px)]  px-6 sm:px-10 md:px-20 lg:px-32 xl:px-40 py-10 md:py-20 flex flex-col md:flex-row justify-between items-center bg-slate-50">
        <motion.div
          className="flex flex-col justify-center items-start w-full md:w-1/2 mb-10 md:mb-0 text-center md:text-left"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold pb-4 text-gray-800">
            Unlock the Power of Your Spreadsheets
          </h1>
          <p className="text-base sm:text-lg text-gray-600 w-full md:w-5/6 lg:w-4/5 mb-8">
            Turn your Excel data into powerful, interactive insights. Upload files, generate dynamic charts, and discover trends in seconds.
          </p>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white text-lg py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto md:mx-0"
            onClick={() => navigate("/signup")}
          >
            Get Started Free
            <FaArrowRightLong />
          </Button>
        </motion.div>
        <motion.div
          className="flex w-full md:w-1/2 justify-center items-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeInOut" }}
        >
          <img
            src="/home-illustration.jpg" // Replace with your illustration path (e.g., in public folder)
            alt="Excel Analytics Illustration"
            className="w-full max-w-md lg:max-w-lg xl:max-w-xl h-auto rounded-lg shadow-xl"
          />
        </motion.div>
      </div>

      {/* Features Section */}
      <motion.section
        className="py-16 sm:py-20 md:py-24 bg-white"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }} // Trigger when 20% of the section is in view
      >
        <div className="container mx-auto px-6 sm:px-10">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-6"
            initial={{ opacity:0, y:20}}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once: true }}
            transition={{duration: 0.5, delay: 0.2}}
          >
            Everything You Need, All In One Place
          </motion.h2>
          <motion.p
            className="text-center text-gray-600 text-lg mb-12 sm:mb-16 md:mb-20 max-w-2xl mx-auto"
            initial={{ opacity:0, y:20}}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once: true }}
            transition={{duration: 0.5, delay: 0.4}}
          >
            Our platform offers a comprehensive suite of tools to transform your data analysis workflow.
          </motion.p>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
            variants={cardContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-slate-50 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col items-center text-center"
                variants={cardVariants}
                whileHover={{ scale: 1.03, y: -5, transition: { duration: 0.2 } }}
              >
                {feature.icon}
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Call to Action Section */}
      <motion.section
        className="py-16 sm:py-20 bg-green-600 text-white"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="container mx-auto px-6 sm:px-10 text-center">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold mb-6"
            initial={{ opacity:0, y:20}}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once: true }}
            transition={{duration: 0.5, delay: 0.2}}
          >
            Ready to Transform Your Data?
          </motion.h2>
          <motion.p
            className="text-lg sm:text-xl mb-8 max-w-xl mx-auto"
            initial={{ opacity:0, y:20}}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once: true }}
            transition={{duration: 0.5, delay: 0.4}}
          >
            Sign up today and experience the future of Excel analytics. No credit card required.
          </motion.p>
          <motion.div
             initial={{ opacity:0, scale:0.8}}
             whileInView={{ opacity:1, scale:1 }}
             viewport={{ once: true }}
             transition={{duration: 0.5, delay: 0.6}}
          >
            <Button
              className="bg-white text-green-600 hover:bg-gray-100 text-lg py-3 px-10 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-semibold flex items-center gap-2 mx-auto"
              onClick={() => navigate("/signup")}
              size="lg" // if your Button component supports this
            >
              Start Analyzing Now
              <FaArrowRightLong />
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Simple Footer (Optional) */}
      <footer className="py-8 bg-gray-800 text-gray-400 text-center">
        <p>© {new Date().getFullYear()} Your Excel Analytics Platform. All rights reserved.</p>
        {/* Add links to privacy policy, terms, etc. if needed */}
      </footer>
    </>
  );
};

export default Home;