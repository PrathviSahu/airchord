import { Guitar } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-amber-100 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center">
            <Guitar className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading text-xl text-amber-900">AirChord</span>
        </div>
        <div className="flex items-center gap-8">
          <a href="#" className="text-sm text-stone-400 hover:text-amber-800 transition-colors">Privacy</a>
          <a href="#" className="text-sm text-stone-400 hover:text-amber-800 transition-colors">Terms</a>
          <a href="#" className="text-sm text-stone-400 hover:text-amber-800 transition-colors">Support</a>
          <a href="#" className="text-sm text-stone-400 hover:text-amber-800 transition-colors">Twitter</a>
        </div>
        <div className="text-xs text-stone-400">© 2026 AirChord. All rights reserved.</div>
      </div>
    </footer>
  )
}
