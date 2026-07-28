import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RoomModal from '../components/RoomModal'
import socket from '../socket'
import { useTheme } from '../App'

function Landing() {
  const navigate = useNavigate()
  const { dark, toggleDark } = useTheme()
  const [joinCode, setJoinCode] = useState('')
  const [createdCode, setCreatedCode] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [joinError, setJoinError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleCreateRoom() {
    setLoading(true)
    socket.connect()
    socket.emit('create-room', {})
    socket.once('room-created', ({ code }) => {
      setCreatedCode(code)
      setShowModal(true)
      setLoading(false)
    })
  }

  function handleEnterRoom() {
    socket.disconnect()
    setShowModal(false)
    navigate(`/join/${createdCode}`)
  }

  function handleJoinRoom() {
    const code = joinCode.trim().toUpperCase()
    if (code.length < 6) {
      setJoinError('Please enter a valid 6-character room code')
      return
    }
    setJoinError('')
    navigate(`/join/${code}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Navbar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: '56px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px', height: '28px',
            background: 'var(--ink)', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{
              color: dark ? '#111' : '#fff',
              fontSize: '12px', fontWeight: '700'
            }}>
              B
            </span>
          </div>
          <span style={{
            fontWeight: '600', fontSize: '15px',
            color: 'var(--ink)', letterSpacing: '-0.02em'
          }}>
            Blazechat
          </span>
        </div>

        <button
          onClick={toggleDark}
          style={{
            padding: '7px 14px',
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '12px', fontWeight: '500',
            color: 'var(--muted)', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif"
          }}
        >
          {dark ? 'Light mode' : 'Dark mode'}
        </button>
      </div>

      {/* Hero */}
      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: '0 24px', paddingTop: '56px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '48px',
          alignItems: 'center',
          minHeight: 'calc(100vh - 56px)',
          paddingTop: '40px',
          paddingBottom: '60px'
        }}>

          {/* Left */}
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '11px', fontWeight: '500',
              color: 'var(--muted)',
              letterSpacing: '0.07em', textTransform: 'uppercase',
              marginBottom: '24px'
            }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: 'var(--green)', display: 'inline-block'
              }} />
              No sign up · No history · No trace
            </div>

            <h1 style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: 'clamp(2.8rem, 6vw, 4.5rem)',
              fontWeight: '400', lineHeight: '1.05',
              letterSpacing: '-0.025em',
              color: 'var(--ink)', marginBottom: '20px'
            }}>
              A place to<br />
              talk that<br />
              <em style={{ fontStyle: 'italic', color: 'var(--cobalt)' }}>
                forgets you
              </em>
            </h1>

            <p style={{
              fontSize: '16px', color: 'var(--muted)',
              lineHeight: '1.75', fontWeight: '300',
              marginBottom: '40px', maxWidth: '400px'
            }}>
              Create a room in one tap. Share the code. Chat with anyone. When everyone leaves, the room closes and nothing is kept.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={handleCreateRoom}
                disabled={loading}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '10px',
                  background: loading ? 'var(--muted-2)' : 'var(--cobalt)',
                  color: '#fff', border: 'none',
                  borderRadius: '14px', padding: '14px 26px',
                  fontSize: '15px', fontWeight: '500',
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: loading ? 'not-allowed' : 'pointer',
                  width: 'fit-content',
                  transition: 'background 0.18s',
                  letterSpacing: '-0.01em'
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--cobalt-h)' }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = loading ? 'var(--muted-2)' : 'var(--cobalt)' }}
              >
                <span style={{
                  width: '20px', height: '20px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '6px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: 'bold'
                }}>
                  +
                </span>
                {loading ? 'Creating room...' : 'Create a room'}
              </button>

              <div style={{
                display: 'flex', gap: '8px',
                maxWidth: '380px', width: '100%'
              }}>
                <input
                  type="text"
                  value={joinCode}
                  onChange={e => setJoinCode(
                    e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                  )}
                  onKeyDown={e => e.key === 'Enter' && handleJoinRoom()}
                  placeholder="Have a code? e.g. XK94MV"
                  maxLength={6}
                  style={{
                    flex: 1, padding: '13px 16px',
                    background: 'var(--bg)',
                    border: '1.5px solid var(--border)',
                    borderRadius: '10px',
                    fontSize: '14px', color: 'var(--ink)',
                    outline: 'none',
                    fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: '0.04em',
                    transition: 'border-color 0.18s'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--cobalt)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button
                  onClick={handleJoinRoom}
                  style={{
                    padding: '13px 20px',
                    background: 'var(--bg-2)',
                    border: '1.5px solid var(--border)',
                    borderRadius: '10px',
                    fontSize: '14px', fontWeight: '500',
                    color: 'var(--ink-soft)',
                    fontFamily: "'DM Sans', sans-serif",
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-2)'}
                >
                  Join
                </button>
              </div>

              {joinError && (
                <p style={{ fontSize: '12px', color: 'var(--red-text)' }}>
                  {joinError}
                </p>
              )}

              <p style={{ fontSize: '12px', color: 'var(--muted-2)' }}>
                Codes are 6 characters. No account needed.
              </p>
            </div>
          </div>

          {/* Right — decorative room card */}
          <div style={{
            display: 'flex', justifyContent: 'center',
            alignItems: 'center', padding: '20px 0'
          }}>
            <div
              style={{ transform: 'rotate(2.5deg)', transition: 'transform 0.4s ease' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'rotate(0deg)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'rotate(2.5deg)'}
            >
              <div style={{
                width: '280px',
                background: 'var(--surface)',
                borderRadius: '22px',
                overflow: 'hidden',
                border: '1px solid var(--border)',
                boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 16px 40px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  background: 'var(--ink)',
                  padding: '12px 18px',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => (
                      <span key={i} style={{
                        width: '9px', height: '9px',
                        borderRadius: '50%', background: c,
                        display: 'inline-block'
                      }} />
                    ))}
                  </div>
                  <span style={{
                    flex: 1, textAlign: 'center',
                    fontSize: '10px', color: 'rgba(255,255,255,0.35)',
                    marginRight: '36px'
                  }}>
                    blazechat · room XK9-4MV
                  </span>
                </div>

                <div style={{ padding: '20px' }}>
                  <div style={{
                    fontSize: '10px', fontWeight: '500',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: 'var(--muted-2)', marginBottom: '4px'
                  }}>
                    Room code
                  </div>
                  <div style={{
                    fontSize: '1.8rem', fontWeight: '700',
                    letterSpacing: '0.14em', color: 'var(--ink)',
                    lineHeight: '1', marginBottom: '4px'
                  }}>
                    XK9-4MV
                  </div>
                  <div style={{
                    fontSize: '12px', color: 'var(--muted-2)',
                    marginBottom: '16px'
                  }}>
                    Share this with anyone you want in
                  </div>

                  <div style={{
                    padding: '9px', textAlign: 'center',
                    background: 'var(--cobalt-bg)',
                    border: '1px solid var(--cobalt-bd)',
                    borderRadius: '9px', fontSize: '12px',
                    fontWeight: '500', color: 'var(--cobalt)',
                    marginBottom: '7px'
                  }}>
                    Copy code
                  </div>
                  <div style={{
                    padding: '9px', textAlign: 'center',
                    background: 'var(--ink)', borderRadius: '9px',
                    fontSize: '12px', fontWeight: '500', color: '#fff'
                  }}>
                    Enter room
                  </div>

                  <div style={{
                    height: '1px',
                    background: 'var(--border)',
                    margin: '14px 0'
                  }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex' }}>
                      {[
                        { c: '#2D5BE3', l: 'M' },
                        { c: '#E85A4F', l: 'S' },
                        { c: '#50B86C', l: 'J' }
                      ].map((av, i) => (
                        <div key={i} style={{
                          width: '22px', height: '22px',
                          borderRadius: '50%', background: av.c,
                          border: '2px solid var(--surface)',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '8px', fontWeight: '700', color: '#fff',
                          marginLeft: i > 0 ? '-6px' : '0'
                        }}>
                          {av.l}
                        </div>
                      ))}
                    </div>
                    <span style={{
                      fontSize: '11px', color: 'var(--muted)',
                      marginLeft: '6px'
                    }}>
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
      <div style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)'
      }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          padding: '16px 24px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center',
          gap: '32px', flexWrap: 'wrap'
        }}>
          {[
            'No account required',
            'Nothing stored after room closes',
            'Live in under 3 seconds',
            'Any device, any browser'
          ].map(item => (
            <div key={item} style={{
              display: 'flex', alignItems: 'center',
              gap: '6px', fontSize: '12px', color: 'var(--muted)'
            }}>
              <span style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: 'var(--cobalt)', display: 'inline-block'
              }} />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{
        background: 'var(--bg-2)',
        borderBottom: '1px solid var(--border)',
        padding: '72px 24px'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <span style={{
            fontSize: '10px', fontWeight: '500',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--cobalt)', display: 'block', marginBottom: '10px'
          }}>
            How it works
          </span>
          <h2 style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
            fontWeight: '400', letterSpacing: '-0.025em',
            color: 'var(--ink)', marginBottom: '40px'
          }}>
            Three steps.{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--muted)' }}>
              That is the whole thing.
            </em>
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1px',
            background: 'var(--border)',
            borderRadius: '16px', overflow: 'hidden'
          }}>
            {[
              {
                num: '1', title: 'Create the room',
                body: 'Tap the button. A room opens instantly with a unique code. Nothing to fill out.'
              },
              {
                num: '2', title: 'Share the code',
                body: 'Copy the 6-character code and send it anywhere. Anyone with it can walk straight in.'
              },
              {
                num: '3', title: 'Talk, then leave',
                body: 'Chat in real time. When the last person leaves, the room closes. Nothing saved.'
              }
            ].map(step => (
              <div key={step.num} style={{
                background: 'var(--bg)',
                padding: '32px 28px',
                transition: 'background 0.2s'
              }}>
                <div style={{
                  width: '30px', height: '30px',
                  borderRadius: '50%',
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px', fontWeight: '500',
                  color: 'var(--muted)', marginBottom: '18px'
                }}>
                  {step.num}
                </div>
                <h3 style={{
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  fontSize: '1.2rem', fontWeight: '400',
                  letterSpacing: '-0.01em', color: 'var(--ink)',
                  marginBottom: '8px'
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: '13px', color: 'var(--muted)',
                  lineHeight: '1.7', fontWeight: '300'
                }}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: '24px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '8px'
      }}>
        <span style={{
          fontWeight: '600', fontSize: '14px',
          letterSpacing: '-0.01em', color: 'var(--ink)'
        }}>
          Blazechat
        </span>
        <span style={{
          fontSize: '12px', color: 'var(--muted-2)',
          fontFamily: 'monospace'
        }}>
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