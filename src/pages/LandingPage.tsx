import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const LandingPage = () => {
  const { user } = useAuth()

  const features = [
    {
      title: 'Host Your Own',
      description: 'Create custom tournaments with your rulesets',
      icon: '/Images/host_tournament.png'
    },
    {
      title: 'Compete to Win',
      description: 'Join skill-based matchmaking tournaments',
      icon: '/Images/join_match.png'
    },
    {
      title: 'Instant Payouts',
      description: 'Secure wallet with instant withdrawals',
      icon: '/Images/secure_wallet.png'
    },
    {
      title: 'Verified Fair Play',
      description: 'Advanced anti-cheat systems',
      icon: '/Images/fair_play.png'
    }
  ]

  const steps = [
    { number: 1, title: 'Sign Up', description: 'Create your free account in 30 seconds' },
    { number: 2, title: 'Browse & Join', description: 'Find tournaments matching your skill level' },
    { number: 3, title: 'Compete', description: 'Play your best and prove your skills' },
    { number: 4, title: 'Win Rewards', description: 'Collect prizes instantly to your wallet' }
  ]

  return (
    <div className="min-h-screen overflow-hidden select-none" style={{
      background: 'linear-gradient(180deg, #000000 0%, #0a0f1f 25%, #0d1b2a 50%, #0a1929 75%, #000000 100%)'
    }}>
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-32"
      >
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-electric-purple/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-electric-purple/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 hero-glow"
          >
            <span className="gradient-text">Esporizon</span>
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl sm:text-2xl md:text-3xl text-gray-200 font-semibold mb-3"
          >
            Compete in Real Tournaments. Win Real Prizes.
          </motion.p>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-base sm:text-lg text-gray-400 mb-10"
          >
            <span className="text-electric-purple font-medium">Compete. Predict. Win.</span>
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              to={user ? '/tournaments' : '/auth'}
              className="px-8 py-4 bg-gradient-cyber rounded-xl font-semibold text-lg shadow-lg hover:scale-105 transition-all duration-300 neon-glow"
            >
              Join Tournament
            </Link>
            <Link
              to={user ? '/dashboard' : '/auth'}
              className="px-8 py-4 glass-effect rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 border-2 border-white/20"
            >
              View Dashboard
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {[
              { label: 'Active Tournaments', value: '50+' },
              { label: 'Total Prize Pool', value: '₹10M+' },
              { label: 'Active Players', value: '25K+' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                className="glass-card card-hover-lift text-center"
              >
                <div className="text-4xl sm:text-5xl font-extrabold gradient-text mb-2">{stat.value}</div>
                <div className="text-gray-400 text-sm sm:text-base font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 border-2 border-electric-purple rounded-full flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1 h-3 bg-electric-purple rounded-full"
            />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section className="section-spacing relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-4">
              Everything You Need to Compete
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A complete esports platform built for competitive gaming
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="glass-card card-hover-lift text-center group"
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-electric-purple/20 to-neon-green/20 p-1 group-hover:scale-110 transition-transform duration-300">
                  <div className="w-full h-full rounded-xl bg-[#0a0a0a] flex items-center justify-center">
                    <img
                      src={feature.icon}
                      alt={feature.title}
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-base">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-spacing relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-4">
              How It Works
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Start competing in four simple steps
            </p>
          </motion.div>

          {/* Desktop Timeline */}
          <div className="hidden md:block relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 timeline-connector transform -translate-y-1/2" />

            <div className="grid grid-cols-4 gap-8 relative z-10">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.6 }}
                  className="text-center"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-cyber flex items-center justify-center text-3xl font-bold shadow-lg neon-glow">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400 text-sm">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile Timeline */}
          <div className="md:hidden space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="flex items-start gap-6"
              >
                <div className="w-16 h-16 flex-shrink-0 rounded-full bg-gradient-cyber flex items-center justify-center text-2xl font-bold shadow-lg neon-glow">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="section-spacing relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card py-16 relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-electric-purple/10 to-neon-green/10 blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold gradient-text mb-6">
                Ready to Start Winning?
              </h2>
              <p className="text-gray-300 text-lg sm:text-xl mb-10">
                Join <span className="text-electric-purple font-semibold">25K+ players</span> competing for real prizes
              </p>
              <Link
                to={user ? '/tournaments' : '/auth'}
                className="inline-block px-12 py-5 bg-gradient-cyber rounded-xl font-bold text-xl shadow-2xl hover:scale-105 transition-all duration-300"
                style={{
                  boxShadow: '0 0 30px rgba(139, 92, 246, 0.5)',
                  animation: 'glow 2s ease-in-out infinite alternate'
                }}
              >
                Join Now - It's Free
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 bg-black/40 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div className="md:col-span-1">
              <h3 className="text-2xl font-bold gradient-text mb-3">Esporizon</h3>
              <p className="text-gray-500 text-sm">Premium esports tournament platform</p>
            </div>

            {/* Platform Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/dashboard" className="hover:text-electric-purple transition-colors">Dashboard</Link></li>
                <li><Link to="/tournaments" className="hover:text-electric-purple transition-colors">Tournaments</Link></li>
                <li><Link to="/play" className="hover:text-electric-purple transition-colors">Play Games</Link></li>
                <li><Link to="/wallet" className="hover:text-electric-purple transition-colors">Wallet</Link></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-electric-purple transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-electric-purple transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-electric-purple transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-electric-purple transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-electric-purple transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-electric-purple transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-electric-purple transition-colors">Fair Play Policy</a></li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-white/5 text-center text-sm text-gray-500">
            <p>© 2026 Esporizon. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
