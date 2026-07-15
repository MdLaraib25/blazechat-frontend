import { useState } from 'react'

function RoomModal({ code, onClose, onEnter }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-5"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl p-10 w-full max-w-[400px] shadow-2xl relative animate-[modalIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F0EDE8] flex items-center justify-center text-[#78716C] text-sm hover:bg-[#E5E0D8] transition-colors"
        >
          x
        </button>

        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 text-xl font-bold mb-4">
          ok
        </div>

        <h2 className="font-serif-display text-2xl font-normal tracking-tight text-[#18181B] mb-1">
          Room created
        </h2>
        <p className="text-sm text-[#78716C] leading-relaxed mb-6">
          Share this code with anyone you want in the room. No account needed on their end.
        </p>

        <div className="bg-[#FAFAF7] border border-black/8 rounded-2xl p-5 text-center mb-4">
          <div className="text-xs font-medium uppercase tracking-widest text-[#A8A29E] mb-2">
            Room code
          </div>
          <div className="text-4xl font-semibold tracking-[0.18em] text-[#18181B] leading-none">
            {code}
          </div>
          <div className="text-xs text-[#A8A29E] mt-2">
            Expires when everyone leaves
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleCopy}
            className="w-full py-3 rounded-xl text-sm font-medium bg-[#2D5BE3]/8 border border-[#2D5BE3]/20 text-[#2D5BE3] hover:bg-[#2D5BE3]/12 transition-colors"
          >
            {copied ? 'Copied' : 'Copy code'}
          </button>
          <button
            onClick={onEnter}
            className="w-full py-3 rounded-xl text-sm font-medium bg-[#18181B] text-white hover:bg-[#2D5BE3] transition-colors"
          >
            Enter room
          </button>
        </div>
      </div>
    </div>
  )
}

export default RoomModal