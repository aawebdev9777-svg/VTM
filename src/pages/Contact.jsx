import React, { useState } from 'react';
import { Mail, MessageSquare, Github, Twitter, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Opens default mail client with pre-filled details
    const subject = encodeURIComponent(`VStock Contact: ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.open(`mailto:support@vstock.app?subject=${subject}&body=${body}`);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          Contact <span className="text-amber-500">Us</span>
        </h1>
        <p className="text-xl text-slate-400 mb-12">We'd love to hear from you. Reach out any time.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Contact methods */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Get in touch</h2>

            <a href="mailto:support@vstock.app" className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-amber-500 transition-colors group">
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                <Mail className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="font-bold text-white">Email Us</p>
                <p className="text-sm text-amber-400">support@vstock.app</p>
              </div>
            </a>

            <a href="https://twitter.com/vstockapp" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-amber-500 transition-colors group">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                <Twitter className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="font-bold text-white">Twitter / X</p>
                <p className="text-sm text-slate-400">@vstockapp</p>
              </div>
            </a>

            <a href="https://github.com/vstockapp" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-amber-500 transition-colors group">
              <div className="w-12 h-12 bg-slate-600/40 rounded-xl flex items-center justify-center group-hover:bg-slate-600/60 transition-colors">
                <Github className="w-6 h-6 text-slate-300" />
              </div>
              <div>
                <p className="font-bold text-white">GitHub</p>
                <p className="text-sm text-slate-400">github.com/vstockapp</p>
              </div>
            </a>

            <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl border border-slate-700">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="font-bold text-white">Response Time</p>
                <p className="text-sm text-slate-400">Usually within 24 hours</p>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Send a message</h2>
            {sent ? (
              <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
                <p className="text-green-400 font-bold text-lg mb-2">Message ready!</p>
                <p className="text-slate-400 text-sm">Your email client will open with the message pre-filled.</p>
                <button onClick={() => setSent(false)} className="mt-4 text-amber-400 text-sm underline">Send another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="Your name"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Message</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    required
                    rows={5}
                    placeholder="Tell us how we can help..."
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-700 text-center">
          <Link to="/About" className="text-slate-400 hover:text-amber-400 text-sm transition-colors mr-6">About VStock</Link>
          <Link to="/Home" className="text-slate-400 hover:text-amber-400 text-sm transition-colors">Back to Trading</Link>
        </div>
      </div>
    </div>
  );
}