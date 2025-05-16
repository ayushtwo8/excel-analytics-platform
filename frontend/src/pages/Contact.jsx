// src/components/Contact.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import { Button } from "@/components/ui/button";

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

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    console.log("Form data submitted:", formData);
    // Replace with actual API call to your backend (e.g., using fetch or axios)
    // For example:
    // try {
    //   const response = await fetch('/api/contact', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(formData),
    //   });
    //   if (response.ok) {
    //     setIsSubmitted(true);
    //     setFormData({ name: "", email: "", message: "" });
    //   } else {
    //     // Handle error
    //     alert("Failed to send message. Please try again.");
    //   }
    // } catch (error) {
    //   console.error("Contact form submission error:", error);
    //   alert("An error occurred. Please try again.");
    // }
    setTimeout(() => { // Simulate network delay
        setIsSubmitted(true);
        setFormData({ name: "", email: "", message: "" });
        setIsLoading(false);
    }, 1500);
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="container mx-auto px-6 py-12 md:py-20 min-h-[calc(100vh-150px)]" // Adjust min-height
    >
      <header className="text-center mb-12 md:mb-16">
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Get In Touch
        </motion.h1>
        <motion.p
          className="text-lg text-gray-600 max-w-xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          We'd love to hear from you! Whether you have a question, feedback, or need support, feel free to reach out.
        </motion.p>
      </header>

      <div className="grid md:grid-cols-2 gap-10 md:gap-16">
        {/* Contact Information Section */}
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="space-y-6 bg-slate-50 p-6 md:p-8 rounded-lg shadow-lg"
        >
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Contact Information</h2>
          <div className="flex items-start space-x-3">
            <FaEnvelope className="text-green-600 mt-1 h-5 w-5" />
            <div>
              <h3 className="font-medium text-gray-700">Email Us</h3>
              <a href="mailto:support@excelytics.com" className="text-green-700 hover:text-green-800 hover:underline">
                support@excelytics.com
              </a>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <FaPhoneAlt className="text-green-600 mt-1 h-5 w-5" />
            <div>
              <h3 className="font-medium text-gray-700">Call Us (Mon-Fri, 9am-5pm)</h3>
              <p className="text-gray-600">+1 (555) 123-4567</p> {/* Placeholder */}
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <FaMapMarkerAlt className="text-green-600 mt-1 h-5 w-5" />
            <div>
              <h3 className="font-medium text-gray-700">Our Office</h3>
              <p className="text-gray-600">123 Analytics Way, Suite 100<br />Data City, DC 54321</p> {/* Placeholder */}
            </div>
          </div>
          {/* You can add social media links here too */}
        </motion.div>

        {/* Contact Form Section */}
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="bg-white p-6 md:p-8 rounded-lg shadow-lg"
        >
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Send Us a Message</h2>
          {isSubmitted ? (
            <div className="text-center p-4 bg-green-100 text-green-700 rounded-md">
              <h3 className="font-semibold text-lg">Thank You!</h3>
              <p>Your message has been sent successfully. We'll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                ></textarea>
              </div>
              <div>
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Contact;