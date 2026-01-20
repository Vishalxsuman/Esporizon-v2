import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import ParticlesBackground from '@/components/ParticlesBackground'
import HowItWorksSection from '@/components/HowItWorksSection'
import TrustSection from '@/components/TrustSection'
import LiveTournamentsGrid from '@/components/LiveTournamentsGrid'
import GamesCarousel from '@/components/GamesCarousel'
import UserButton from '@/components/UserButton'
import { ArrowRight, Github, Twitter, Instagram } from 'lucide-react'

const LandingPage = () => {
  const { user } = useAuth()

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const navLinks = [
    { label: 'Home', id: 'hero' },
    { label: 'Tournaments', id: 'tournaments' },
    { label: 'Games', id: 'games' },
    { label: 'How It Works', id: 'how-it-works' },
  ]

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white">
      <ParticlesBackground />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0E1424]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-20">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center h-full">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/Images/logo.png"
                alt="Esporizon"
                className="w-10 h-10 object-contain hover:rotate-12 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/Images/espo.png'
                }}
              />
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-[#00E0C6] to-[#7B61FF] bg-clip-text text-transparent tracking-tight">
                  ESPORIZON
                </h1>
              </div>
            </Link>

            {/* Center: Navigation (Scroll-based) */}
            <nav className="hidden lg:flex items-center gap-2 bg-white/5 p-1.5 rounded-full border border-white/10">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="px-5 py-2 rounded-full text-sm font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Right: Login or Avatar */}
            <div className="flex items-center justify-end gap-4">
              {user ? (
                <UserButton />
              ) : (
                <Link
                  to="/auth"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00E0C6] to-[#7B61FF] text-black font-bold hover:shadow-lg hover:shadow-[#00E0C6]/30 transition-all duration-200 hover:-translate-y-0.5 hover:scale-105"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-[85vh] flex items-center overflow-hidden px-4 lg:px-8 py-16">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0E1424] via-[#0B0F1A] to-[#0A0D17]"></div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-12 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-tight">
                Skill-Based Esports.{' '}
                <span className="text-[#00E0C6]">Real Rewards.</span>
              </h1>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed max-w-2xl">
                Join competitive tournaments, prove your skill, and win real cash rewards.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#00E0C6] to-[#7B61FF] text-black font-bold text-lg hover:shadow-lg hover:shadow-[#00E0C6]/40 transition-all duration-200 hover:-translate-y-1 hover:scale-105 flex items-center justify-center gap-2"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <Link
                    to="/auth"
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#00E0C6] to-[#7B61FF] text-black font-bold text-lg hover:shadow-lg hover:shadow-[#00E0C6]/40 transition-all duration-200 hover:-translate-y-1 hover:scale-105 flex items-center justify-center gap-2"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </motion.div>

            {/* Right: Character - Improved Integration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:flex justify-end relative"
            >
              {/* Soft radial glow behind chest/upper torso only */}
              <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/3 w-72 h-72 bg-[#00E0C6]/10 rounded-full blur-3xl"></div>

              {/* Subtle cyan rim-light on edges */}
              <div className="absolute inset-0 bg-gradient-to-l from-[#00E0C6]/8 via-transparent to-transparent blur-xl"></div>

              <motion.img
                src="/Images/02.png"
                alt="Esports Character"
                className="w-full max-w-md h-auto relative z-10"
                style={{
                  filter: 'drop-shadow(0 20px 60px rgba(0, 224, 198, 0.15))',
                  maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
                }}
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <div id="how-it-works">
        <HowItWorksSection />
      </div>

      {/* Supported Games */}
      <section id="games" className="py-12 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <GamesCarousel />
        </div>
      </section>

      {/* Live Tournaments Preview */}
      <section id="tournaments" className="py-12 px-4 lg:px-8 bg-gradient-to-b from-transparent to-[#0E1424]/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
              Live <span className="text-[#00E0C6]">Tournaments</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Jump into ongoing competitions or join upcoming matches
            </p>
          </motion.div>
          <LiveTournamentsGrid />
        </div>
      </section>

      {/* Trust & Transparency */}
      <TrustSection />

      {/* Final CTA */}
      <section className="py-16 px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-[#0E1424] to-[#0A0D17] rounded-3xl border border-white/10 p-12 text-center relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#00E0C6]/10 to-[#7B61FF]/10 blur-3xl"></div>

            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
                Ready to Compete?
              </h2>
              <p className="text-lg text-gray-400 mb-8">
                Join thousands of players winning real rewards
              </p>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 px-10 py-5 rounded-xl bg-gradient-to-r from-[#00E0C6] to-[#7B61FF] text-black font-bold text-lg hover:shadow-lg hover:shadow-[#00E0C6]/40 transition-all duration-200 hover:-translate-y-1 hover:scale-105"
              >
                Login & Start Competing
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0E1424]/50 backdrop-blur-md py-12 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/Images/logo.png"
                  alt="Esporizon"
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/Images/espo.png'
                  }}
                />
                <h3 className="text-xl font-black bg-gradient-to-r from-[#00E0C6] to-[#7B61FF] bg-clip-text text-transparent">
                  ESPORIZON
                </h3>
              </div>
              <p className="text-gray-400 text-sm">
                Skill-based esports platform for competitive gamers
              </p>
            </div>

            {/* About */}
            <div>
              <h4 className="text-white font-bold mb-4">About</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => scrollToSection('how-it-works')} className="text-gray-400 hover:text-white transition-colors text-sm">
                    How It Works
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('tournaments')} className="text-gray-400 hover:text-white transition-colors text-sm">
                    Tournaments
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('games')} className="text-gray-400 hover:text-white transition-colors text-sm">
                    Supported Games
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Fair Play Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-bold mb-4">Connect</h4>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00E0C6]/50 flex items-center justify-center transition-all"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00E0C6]/50 flex items-center justify-center transition-all"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00E0C6]/50 flex items-center justify-center transition-all"
                >
                  <Github className="w-5 h-5" />
                </a>
              </div>
              <p className="text-gray-400 text-sm mt-4">
                support@esporizon.com
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2026 Esporizon. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
