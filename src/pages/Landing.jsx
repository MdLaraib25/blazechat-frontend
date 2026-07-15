import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import RoomModal from '../components/RoomModal'
import socket from '../socket'

function Landing() {
  const navigate = useNavigate()
  const [joinCode, setJoinCode] = useState('')
  const [createdCode, setCreatedCode] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [joinError, setJoinError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleCreateRoom() {
  setLoading(true)
  socket.connect()
  socket.emit('create-room', { name: 'Host' })
  socket.once('room-created', ({ code }) => {
    console.log('Room created on frontend:', code)
    setCreatedCode(code)
    setShowModal(true)
    setLoading(false)
  })
}

function handleEnterRoom() {
  console.log('Entering room — code:', createdCode)
  console.log('Socket connected?', socket.connected)
  setShowModal(false)
  navigate(`/room/${createdCode}`)
}

  function handleJoinRoom() {
    const code = joinCode.trim().toUpperCase()
    if (code.length < 6) {
      setJoinError('Please enter a valid 6-character room code')
      return
    }
    setJoinError('')
    navigate(`/room/${code}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF7' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 48px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'center',
          minHeight: '100vh',
          paddingTop: '60px'
        }}>

          {/* Left */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11px',
              fontWeight: '500',
              color: '#78716C',
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              marginBottom: '28px'
            }}>
              <span style={{
                width: '6px', height: '6px',
                borderRadius: '50%',
                background: '#16A34A',
                display: 'inline-block'
              }} />
              No sign up · No history · No trace
            </div>

            <h1 style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: 'clamp(3rem, 5vw, 4.5rem)',
              fontWeight: '400',
              lineHeight: '1.05',
              letterSpacing: '-0.025em',
              color: '#18181B',
              marginBottom: '24px'
            }}>
              A place to<br />
              talk that<br />
              <em style={{ fontStyle: 'italic', color: '#2D5BE3' }}>forgets you</em>
            </h1>

            <p style={{
              fontSize: '17px',
              color: '#78716C',
              lineHeight: '1.75',
              fontWeight: '300',
              marginBottom: '44px',
              maxWidth: '400px'
            }}>
              Create a room in one tap. Share the code. Chat with anyone. When everyone leaves, the room closes and nothing is kept.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <button
                onClick={handleCreateRoom}
                disabled={loading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: loading ? '#6B8FE8' : '#2D5BE3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '15px 28px',
                  fontSize: '15px',
                  fontWeight: '500',
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: loading ? 'not-allowed' : 'pointer',
                  width: 'fit-content',
                  transition: 'background 0.18s'
                }}
              >
                <span style={{
                  width: '20px', height: '20px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>+</span>
                {loading ? 'Creating room...' : 'Create a room'}
              </button>

              <div style={{ display: 'flex', gap: '8px', maxWidth: '380px' }}>
                <input
                  type="text"
                  value={joinCode}
                  onChange={e =>
                    setJoinCode(
                      e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, '')
                    )
                  }
                  onKeyDown={e => e.key === 'Enter' && handleJoinRoom()}
                  placeholder="Have a code? e.g. XK94MV"
                  maxLength={6}
                  style={{
                    flex: '1',
                    padding: '13px 16px',
                    background: '#FAFAF7',
                    border: '1.5px solid rgba(24,24,27,0.12)',
                    borderRadius: '10px',
                    fontSize: '14px',
                    color: '#18181B',
                    outline: 'none',
                    fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: '0.04em'
                  }}
                />
                <button
                  onClick={handleJoinRoom}
                  style={{
                    padding: '13px 20px',
                    background: '#F0EDE8',
                    border: '1.5px solid rgba(24,24,27,0.1)',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#3C3C42',
                    fontFamily: "'DM Sans', sans-serif",
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Join
                </button>
              </div>

              {joinError && (
                <p style={{ fontSize: '12px', color: '#EF4444' }}>{joinError}</p>
              )}

              <p style={{ fontSize: '12px', color: '#A8A29E' }}>
                Codes are 6 characters. No account needed.
              </p>
            </div>
          </div>

          {/* Right — room card */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0' }}>
            <div style={{ transform: 'rotate(2.5deg)', transition: 'transform 0.4s ease' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'rotate(0deg)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'rotate(2.5deg)'}
            >
              <div style={{
                width: '300px',
                background: '#fff',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.1), 0 40px 64px rgba(0,0,0,0.06)'
              }}>
                <div style={{
                  background: '#18181B',
                  padding: '14px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF5F57', display: 'inline-block' }} />
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FEBC2E', display: 'inline-block' }} />
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28C840', display: 'inline-block' }} />
                  </div>
                  <span style={{ flex: '1', textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginRight: '38px' }}>
                    blazechat · room XK9-4MV
                  </span>
                </div>

                <div style={{ padding: '24px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A8A29E', marginBottom: '6px' }}>
                    Room code
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '600', letterSpacing: '0.14em', color: '#18181B', lineHeight: '1', marginBottom: '4px' }}>
                    XK9-4MV
                  </div>
                  <div style={{ fontSize: '12px', color: '#A8A29E', marginBottom: '18px' }}>
                    Share this with anyone you want in
                  </div>

                  <div style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(45,91,227,0.07)',
                    border: '1px solid rgba(45,91,227,0.2)',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#2D5BE3',
                    textAlign: 'center',
                    marginBottom: '8px'
                  }}>
                    Copy code
                  </div>
                  <div style={{
                    width: '100%',
                    padding: '10px',
                    background: '#18181B',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#fff',
                    textAlign: 'center'
                  }}>
                    Enter room
                  </div>

                  <div style={{ height: '1px', background: 'rgba(24,24,27,0.06)', margin: '16px 0' }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex' }}>
                      {[
                        { color: '#2D5BE3', letter: 'M' },
                        { color: '#E85A4F', letter: 'S' },
                        { color: '#50B86C', letter: 'J' }
                      ].map((av, i) => (
                        <div key={i} style={{
                          width: '24px', height: '24px',
                          borderRadius: '50%',
                          background: av.color,
                          border: '2px solid #fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '9px',
                          fontWeight: '700',
                          color: '#fff',
                          marginLeft: i > 0 ? '-7px' : '0'
                        }}>
                          {av.letter}
                        </div>
                      ))}
                    </div>
                    <span style={{ fontSize: '12px', color: '#78716C', marginLeft: '8px' }}>
                      3 people in this room
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust bar */}
      <div style={{ borderTop: '1px solid rgba(24,24,27,0.06)', borderBottom: '1px solid rgba(24,24,27,0.06)' }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '18px 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {[
            'No account required',
            'Nothing stored after room closes',
            'Live in under 3 seconds',
            'Any device, any browser'
          ].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: '#78716C' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#2D5BE3', display: 'inline-block' }} />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: '#F0EDE8', borderBottom: '1px solid rgba(24,24,27,0.06)', padding: '80px 48px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <span style={{
            fontSize: '10px',
            fontWeight: '500',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#2D5BE3',
            display: 'block',
            marginBottom: '12px'
          }}>
            How it works
          </span>
          <h2 style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
            fontWeight: '400',
            letterSpacing: '-0.025em',
            color: '#18181B',
            marginBottom: '48px'
          }}>
            Three steps.{' '}
            <em style={{ fontStyle: 'italic', color: '#78716C' }}>That is the whole thing.</em>
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1px',
            background: 'rgba(24,24,27,0.08)',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            {[
              { num: '1', title: 'Create the room', body: 'Tap the button. A room opens instantly with a unique code. Nothing to fill out, no forms, no friction.' },
              { num: '2', title: 'Share the code', body: 'Copy the 6-character code and send it anywhere. Anyone with it can walk straight in.' },
              { num: '3', title: 'Talk, then leave', body: 'Chat in real time. When the last person leaves, the room closes. No transcript, no archive, nothing saved.' }
            ].map(step => (
              <div key={step.num} style={{ background: '#FAFAF7', padding: '36px 32px 40px' }}>
                <div style={{
                  width: '32px', height: '32px',
                  borderRadius: '50%',
                  border: '1px solid rgba(24,24,27,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#78716C',
                  marginBottom: '20px'
                }}>
                  {step.num}
                </div>
                <h3 style={{
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  fontSize: '1.25rem',
                  fontWeight: '400',
                  letterSpacing: '-0.01em',
                  color: '#18181B',
                  marginBottom: '10px'
                }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#78716C', lineHeight: '1.7', fontWeight: '300' }}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '28px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span style={{ fontWeight: '600', fontSize: '14px', letterSpacing: '-0.01em', color: '#18181B' }}>
          Blazechat
        </span>
        <span style={{ fontSize: '12px', color: '#A8A29E', fontFamily: 'monospace' }}>
          No logs. No accounts. Gone when you leave.
        </span>
      </footer>

      {showModal && (
        <RoomModal
          code={createdCode}
          onClose={() => setShowModal(false)}
          onEnter={handleEnterRoom}
        />
      )}
    </div>
  )
}

export default Landing