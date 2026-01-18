import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, ArrowRight, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const AuthPage = () => {
  const { signInWithGoogle, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signInWithGoogle()
      navigate('/dashboard')
    } catch (error) {
      console.error(error)
      toast.error('Failed to sign in with Google')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (isLogin) {
        await signIn(formData.email, formData.password)
      } else {
        await signUp(formData.email, formData.password, formData.name)
      }
      navigate('/dashboard')
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || (isLogin ? 'Invalid email or password' : 'Failed to create account'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden select-none" style={{
      background: 'linear-gradient(135deg, #0a0e1a 0%, #0f1621 40%, #152238 70%, #1a3a52 100%)'
    }}>
      {/* Rich Esports Gradient Background with Vignette */}
      <div className="absolute inset-0 z-0">
        {/* Animated cyan/teal glow */}
        <div className="absolute top-[10%] right-[15%] w-[500px] h-[500px] bg-teal-500/15 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[15%] left-[10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '1.5s' }} />

        {/* Deep vignette for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)]" />
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-[1200px] px-6 lg:px-12 relative z-10 flex items-center justify-center min-h-screen">
        <div className="w-full flex items-center justify-center gap-12">

          {/* LEFT: Compact Centered Auth Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[480px] relative group"
          >
            {/* Glow Effect Behind Card (visible on hover) */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400/15 via-cyan-500/10 to-transparent rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            {/* Glassmorphism Card */}
            <div className="relative bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 backdrop-blur-2xl rounded-[2rem] border border-slate-700/30 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(20,184,166,0.1)] p-8 sm:p-10 transition-all duration-500 group-hover:border-teal-500/40 group-hover:shadow-[0_8px_40px_rgba(20,184,166,0.2),0_0_0_1px_rgba(20,184,166,0.2)]">

              {/* Brand Header */}
              <div className="flex items-center justify-center gap-2.5 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-teal-400 blur-lg opacity-30" />
                  <img
                    src="/Images/logo.png"
                    alt="Esporizon"
                    className="w-7 h-7 object-contain relative z-10 drop-shadow-[0_0_16px_rgba(20,184,166,0.6)]"
                  />
                </div>
                <span className="text-xl font-black tracking-tight text-white drop-shadow-[0_2px_20px_rgba(255,255,255,0.3)]">
                  ESPORIZON
                </span>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isLogin ? 'login' : 'signup'}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Title */}
                  <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-white mb-1.5 tracking-tight">
                      {isLogin ? 'Welcome back' : 'Join the Arena'}
                    </h1>
                    <p className="text-gray-400 text-[13px] leading-relaxed">
                      {isLogin ? 'Initiate your credentials to enter the dashboard.' : 'Establish your agent profile to begin competing.'}
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    {!isLogin && (
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-500 pointer-events-none" />
                        <input
                          type="text"
                          required={!isLogin}
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-slate-900/40 border border-slate-700/40 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/60 focus:bg-slate-800/50 focus:shadow-[0_0_0_3px_rgba(20,184,166,0.15)] transition-all duration-300 select-text"
                          placeholder="Warrior Name"
                        />
                      </div>
                    )}

                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-500 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-slate-900/40 border border-slate-700/40 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/60 focus:bg-slate-800/50 focus:shadow-[0_0_0_3px_rgba(20,184,166,0.15)] transition-all duration-300 select-text"
                        placeholder="Email terminal"
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-500 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        className="w-full bg-slate-900/40 border border-slate-700/40 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/60 focus:bg-slate-800/50 focus:shadow-[0_0_0_3px_rgba(20,184,166,0.15)] transition-all duration-300 select-text"
                        placeholder="Security key"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {isLogin && (
                      <div className="flex justify-end">
                        <button type="button" className="text-xs text-teal-400/80 hover:text-teal-300 transition-colors">
                          Forgot password?
                        </button>
                      </div>
                    )}

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-5 relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 transition-all duration-300 hover:shadow-[0_0_35px_rgba(20,184,166,0.6)] group"
                    >
                      <div className="flex items-center justify-center gap-2 py-3.5 px-6 text-white font-bold text-sm uppercase tracking-wider">
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>{isLogin ? 'Initiate Login' : 'Register Profile'}</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </div>
                    </motion.button>
                  </form>

                  {/* Divider */}
                  <div className="my-5 flex items-center gap-4">
                    <div className="h-px flex-1 bg-slate-700/40" />
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Or</span>
                    <div className="h-px flex-1 bg-slate-700/40" />
                  </div>

                  {/* Google Sign In */}
                  <motion.button
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 bg-slate-900/40 border border-slate-700/40 text-gray-300 font-semibold py-3.5 rounded-xl hover:border-slate-600/50 hover:bg-slate-800/50 transition-all duration-300"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span className="text-sm">Continue with Google</span>
                  </motion.button>

                  {/* Toggle Login/Signup */}
                  <div className="mt-6 text-center">
                    <p className="text-gray-500 text-sm">
                      {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                      <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-teal-400 hover:text-teal-300 font-semibold transition-colors"
                      >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                      </button>
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* RIGHT: Illustration (Desktop Only) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block w-[500px] h-[600px] relative"
          >
            <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <img
                src="/Images/01.png"
                alt="Gaming Evolution"
                className="w-full h-full object-cover opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-700"
              />
              {/* Gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Decorative branding */}
              <div className="absolute bottom-8 left-8 z-10">
                <div className="h-0.5 w-8 bg-cyan-500 rounded-full mb-3" />
                <h3 className="text-white/30 font-black text-xl italic tracking-tight uppercase leading-tight">
                  NEXT GEN<br />ARENA
                </h3>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Fixed Copyright Footer */}
      <div className="fixed bottom-0 left-0 right-0 pb-6 z-20">
        <p className="text-center text-[10px] font-bold text-white/25 uppercase tracking-[0.3em] hover:text-white/40 transition-colors cursor-default">
          © Esporizon Collective. All Rights Reserved.
        </p>
      </div>
    </div>
  )
}

export default AuthPage
