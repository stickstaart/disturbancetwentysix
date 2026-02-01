import React from "react";

const Contact: React.FC = () => {
  return (
    <section id="contact" className="py-20 bg-black text-white text-center">
      <h2 className="text-4xl font-bold mb-8 uppercase tracking-tighter">Get In Touch</h2>
      <p className="text-gray-400 mb-8">
        For booking or inquiries, email us at: <br />
        <a href="mailto:disturbancepunk@gmail.com" className="text-white underline hover:text-accent transition-colors">
          disturbancepunk@gmail.com
        </a>
      </p>

      {/* VERVANG DE URL HIERONDER NA STAP 2 */}
      <form
        action="https://formspree.io/f/mlgnpare"
        method="POST"
        className="max-w-md mx-auto flex flex-col gap-4 px-4"
      >
        <input
          type="text"
          name="name" // Belangrijk!
          placeholder="Your Name"
          required
          className="p-3 bg-gray-900 text-white border border-gray-800 focus:border-white outline-none transition-colors"
        />
        <input
          type="email"
          name="email" // Belangrijk!
          placeholder="Your Email"
          required
          className="p-3 bg-gray-900 text-white border border-gray-800 focus:border-white outline-none transition-colors"
        />

        <textarea
          name="message" // Belangrijk!
          placeholder="Message"
          required
          className="p-3 bg-gray-900 text-white border border-gray-800 focus:border-white outline-none transition-colors"
          rows={4}
        ></textarea>

        {/* Honeypot veld - onzichtbaar voor mensen, valstrik voor bots */}
        <input type="text" name="_gotcha" style={{ display: 'none' }} />

        <button
          type="submit"
          className="px-6 py-4 bg-white text-black font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-all transform hover:scale-[1.02]"
        >
          Send Message
        </button>
      </form>
    </section>
  );
};

export default Contact;
