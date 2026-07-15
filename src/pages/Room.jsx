import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSocket } from '../hooks/useSocket'
import { generateName } from '../utils/nameGenerator'
import socket from '../socket'

const AVATAR_COLORS = [
  '#2D5BE3', '#E85A4F', '#50B86C',
  '#9B6FF7', '#F59E0B', '#0891B2'
]

function getAvatarColor(index) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length]
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit'
  })
}

// ── Avatar
function Avatar({ name, color, size = 32 }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '8px',
      background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff',
      fontSize: size * 0.38,
      fontWeight: '700',
      flexShrink: 0,
      fontFamily: "'DM Sans', sans-serif"
    }}>
      {name.charAt(0)}
    </div>
  )
}

// ── System message
function SystemMessage({ content }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      margin: '10px 0'
    }}>
      <div style={{ flex: 1, height: '1px', background: 'rgba(24,24,27,0.06)' }} />
      <span style={{ fontSize: '11px', color: '#A8A29E', whiteSpace: 'nowrap' }}>
        {content}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'rgba(24,24,27,0.06)' }} />
    </div>
  )
}

// ── Message bubble
function MessageBubble({ message, myName, isFirst, avatarColor }) {
  const isMe = message.sender === myName

  if (message.type === 'system') {
    return <SystemMessage content={message.content} />
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMe ? 'row-reverse' : 'row',
      gap: '10px',
      alignItems: 'flex-end',
      marginBottom: '2px'
    }}>
      {/* Avatar — only show on first message in group */}
      <div style={{ width: '32px', flexShrink: 0 }}>
        {!isMe && isFirst && (
          <Avatar name={message.sender} color={avatarColor} size={32} />
        )}
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isMe ? 'flex-end' : 'flex-start',
        maxWidth: '65%',
        gap: '3px'
      }}>
        {isFirst && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexDirection: isMe ? 'row-reverse' : 'row',
            paddingLeft: isMe ? 0 : '2px',
            paddingRight: isMe ? '2px' : 0,
            marginBottom: '3px'
          }}>
            {!isMe && (
              <span style={{ fontSize: '12px', fontWeight: '500', color: '#3C3C42' }}>
                {message.sender}
              </span>
            )}
            <span style={{ fontSize: '11px', color: '#C4BFB9' }}>
              {formatTime(message.timestamp)}
            </span>
          </div>
        )}

        <div style={{
          padding: '10px 14px',
          borderRadius: isMe
            ? '18px 18px 4px 18px'
            : '18px 18px 18px 4px',
          background: isMe ? '#2D5BE3' : '#F0EDE8',
          color: isMe ? '#fff' : '#18181B',
          fontSize: '14px',
          lineHeight: '1.55',
          wordBreak: 'break-word',
          maxWidth: '100%',
          boxShadow: isMe
            ? '0 2px 8px rgba(45,91,227,0.25)'
            : '0 1px 3px rgba(0,0,0,0.06)'
        }}>
          {message.content}
        </div>
      </div>
    </div>
  )
}

// ── Typing indicator
function TypingIndicator({ typingUsers }) {
  if (typingUsers.length === 0) return null

  const text = typingUsers.length === 1
    ? `${typingUsers[0]} is typing`
    : typingUsers.length === 2
    ? `${typingUsers[0]} and ${typingUsers[1]} are typing`
    : `${typingUsers[0]} and ${typingUsers.length - 1} others are typing`

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0 4px 42px' }}>
      <div style={{
        display: 'flex', gap: '3px', alignItems: 'center',
        background: '#F0EDE8', borderRadius: '12px',
        padding: '8px 12px'
      }}>
        {[0, 150, 300].map(delay => (
          <div key={delay} style={{
            width: '5px', height: '5px',
            borderRadius: '50%', background: '#A8A29E',
            animation: 'typingBounce 1.2s ease infinite',
            animationDelay: `${delay}ms`
          }} />
        ))}
      </div>
      <span style={{ fontSize: '11px', color: '#A8A29E', fontStyle: 'italic' }}>
        {text}
      </span>
    </div>
  )
}

// ── Sidebar member item
function MemberItem({ member, isMe, index }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '8px 10px',
      borderRadius: '10px',
      background: isMe ? 'rgba(45,91,227,0.05)' : 'transparent',
      transition: 'background 0.15s'
    }}>
      <Avatar name={member.name} color={getAvatarColor(index)} size={30} />
      <span style={{
        fontSize: '13px', fontWeight: '500',
        color: '#18181B', flex: 1,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
      }}>
        {member.name}
      </span>
      {isMe && (
        <span style={{
          fontSize: '10px', fontWeight: '500',
          background: 'rgba(45,91,227,0.1)',
          color: '#2D5BE3',
          borderRadius: '4px', padding: '2px 6px'
        }}>
          you
        </span>
      )}
      <div style={{
        width: '7px', height: '7px',
        borderRadius: '50%', background: '#16A34A',
        flexShrink: 0
      }} />
    </div>
  )
}

// ── Main Room component
function Room() {
  const { code } = useParams()
  const navigate = useNavigate()

  const [myName] = useState(() => generateName())
  const [messages, setMessages] = useState([])
  const [members, setMembers] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [connected, setConnected] = useState(false)
  const [roomError, setRoomError] = useState('')

  const typingTimeoutRef = useRef(null)
  const textareaRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    let hasJoined = false
    if (!socket.connected) socket.connect()
    socket.emit('join-room', { code, name: myName })
    hasJoined = true

    socket.once('room-joined', ({ members, messages }) => {
      setMembers(members.map((m, i) => ({ ...m, avatarColor: getAvatarColor(i) })))
      setMessages(messages)
      setConnected(true)
    })

    return () => {
      if (hasJoined) {
        socket.emit('leave-room', { code })
        socket.disconnect()
      }
    }
  }, [code, myName])

  // auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUsers])

  const handlers = useCallback({
    onNewMessage: (message) => {
      setMessages(prev => [...prev, message])
    },
    onUserJoined: ({ name, members }) => {
      setMembers(members.map((m, i) => ({ ...m, avatarColor: getAvatarColor(i) })))
      setMessages(prev => [...prev, {
        id: Date.now(), type: 'system',
        content: `${name} joined the room`,
        timestamp: new Date().toISOString()
      }])
    },
    onUserLeft: ({ name, members }) => {
      setMembers(members.map((m, i) => ({ ...m, avatarColor: getAvatarColor(i) })))
      setMessages(prev => [...prev, {
        id: Date.now(), type: 'system',
        content: `${name} left the room`,
        timestamp: new Date().toISOString()
      }])
    },
    onUserTyping: ({ name }) => {
      setTypingUsers(prev => prev.includes(name) ? prev : [...prev, name])
    },
    onUserStoppedTyping: ({ name }) => {
      setTypingUsers(prev => prev.filter(n => n !== name))
    },
    onRoomError: ({ message }) => {
      setRoomError(message)
      setTimeout(() => navigate('/'), 2000)
    }
  }, [navigate])

  useSocket(code, handlers)

  function handleInputChange(e) {
    setInputValue(e.target.value)
    socket.emit('typing-start', { code, name: myName })
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing-stop', { code, name: myName })
    }, 1500)
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, 90) + 'px'
    }
  }

  function handleSend() {
    if (!inputValue.trim()) return
    const myIndex = members.findIndex(m => m.name === myName)
    const message = {
      id: Date.now(),
      sender: myName,
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
      type: 'text',
      avatarColor: getAvatarColor(myIndex >= 0 ? myIndex : 0)
    }
    socket.emit('send-message', { code, message })
    socket.emit('typing-stop', { code, name: myName })
    clearTimeout(typingTimeoutRef.current)
    setInputValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleLeave() {
    socket.emit('leave-room', { code })
    socket.disconnect()
    navigate('/')
  }

  function isFirstInGroup(index) {
    if (index === 0) return true
    return messages[index].sender !== messages[index - 1].sender ||
           messages[index].type === 'system' ||
           messages[index - 1].type === 'system'
  }

  if (roomError) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '8px', background: '#FAFAF7'
      }}>
        <p style={{ fontSize: '15px', fontWeight: '500', color: '#18181B' }}>{roomError}</p>
        <p style={{ fontSize: '13px', color: '#A8A29E' }}>Redirecting to home...</p>
      </div>
    )
  }

  if (!connected) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '12px', background: '#FAFAF7'
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          border: '2.5px solid #E5E0D8',
          borderTopColor: '#2D5BE3',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ fontSize: '13px', color: '#78716C' }}>
          Connecting to room {code}...
        </p>
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAF7', overflow: 'hidden' }}>

      {/* Top navbar */}
      <div style={{
        height: '56px', flexShrink: 0,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        background: '#fff',
        borderBottom: '1px solid rgba(24,24,27,0.07)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            onClick={() => navigate('/')}
            style={{
              width: '28px', height: '28px',
              background: '#18181B', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <span style={{ color: '#fff', fontSize: '12px', fontWeight: '700' }}>B</span>
          </div>
          <span style={{ fontWeight: '600', fontSize: '15px', color: '#18181B', letterSpacing: '-0.02em' }}>
            Blazechat
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#F0EDE8',
            border: '1px solid rgba(24,24,27,0.08)',
            borderRadius: '8px', padding: '6px 12px'
          }}>
            <span style={{ fontSize: '11px', color: '#78716C', fontWeight: '500', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Room
            </span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#18181B', letterSpacing: '0.08em' }}>
              {code}
            </span>
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText(code) }}
            style={{
              padding: '6px 12px',
              background: 'rgba(45,91,227,0.07)',
              border: '1px solid rgba(45,91,227,0.15)',
              borderRadius: '8px',
              fontSize: '12px', fontWeight: '500',
              color: '#2D5BE3', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif"
            }}
          >
            Copy code
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Sidebar */}
        <div style={{
          width: '220px', flexShrink: 0,
          background: '#FAFAF7',
          borderRight: '1px solid rgba(24,24,27,0.07)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Room info */}
          <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid rgba(24,24,27,0.06)' }}>
            <div style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2D5BE3', marginBottom: '4px' }}>
              Anonymous room
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A' }} />
              <span style={{ fontSize: '12px', color: '#78716C' }}>
                {members.length} {members.length === 1 ? 'person' : 'people'} here
              </span>
            </div>
          </div>

          {/* Members */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
            <div style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C4BFB9', padding: '4px 8px 10px' }}>
              Members
            </div>
            {members.map((member, index) => (
              <MemberItem
                key={member.id}
                member={member}
                isMe={member.name === myName}
                index={index}
              />
            ))}
          </div>

          {/* Leave */}
          <div style={{ padding: '12px', borderTop: '1px solid rgba(24,24,27,0.06)' }}>
            <button
              onClick={handleLeave}
              style={{
                width: '100%', padding: '9px',
                background: 'none',
                border: '1px solid rgba(24,24,27,0.1)',
                borderRadius: '10px',
                fontSize: '13px', color: '#78716C',
                fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer', transition: 'all 0.18s'
              }}
              onMouseEnter={e => {
                e.target.style.borderColor = '#FCA5A5'
                e.target.style.color = '#EF4444'
                e.target.style.background = '#FEF2F2'
              }}
              onMouseLeave={e => {
                e.target.style.borderColor = 'rgba(24,24,27,0.1)'
                e.target.style.color = '#78716C'
                e.target.style.background = 'none'
              }}
            >
              Leave room
            </button>
          </div>
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>

          {/* Chat header */}
          <div style={{
            padding: '14px 24px',
            borderBottom: '1px solid rgba(24,24,27,0.06)',
            flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: '600', color: '#18181B', letterSpacing: '-0.01em' }}>
                  Anonymous room
                </span>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: 'rgba(22,163,74,0.08)',
                  border: '1px solid rgba(22,163,74,0.15)',
                  borderRadius: '100px', padding: '2px 8px'
                }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#16A34A' }} />
                  <span style={{ fontSize: '10px', fontWeight: '600', color: '#16A34A', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    live
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#A8A29E', marginTop: '2px' }}>
                Expires when everyone leaves · messages not saved
              </div>
            </div>

            {/* Member avatars stack */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex' }}>
                {members.slice(0, 4).map((m, i) => (
                  <div
                    key={m.id}
                    title={m.name}
                    style={{
                      width: '28px', height: '28px',
                      borderRadius: '50%',
                      background: getAvatarColor(i),
                      border: '2px solid #fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', fontWeight: '700', color: '#fff',
                      marginLeft: i > 0 ? '-8px' : '0',
                      zIndex: members.length - i
                    }}
                  >
                    {m.name.charAt(0)}
                  </div>
                ))}
                {members.length > 4 && (
                  <div style={{
                    width: '28px', height: '28px',
                    borderRadius: '50%',
                    background: '#F0EDE8',
                    border: '2px solid #fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: '600', color: '#78716C',
                    marginLeft: '-8px'
                  }}>
                    +{members.length - 4}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex', flexDirection: 'column',
            gap: '2px'
          }}>
            {messages.length === 0 && (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '8px', padding: '60px 0'
              }}>
                <div style={{
                  width: '48px', height: '48px',
                  background: '#F0EDE8', borderRadius: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', marginBottom: '4px'
                }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#C4BFB9' }} />
                </div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#3C3C42' }}>
                  No messages yet
                </p>
                <p style={{ fontSize: '13px', color: '#A8A29E' }}>
                  Be the first to say something
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                myName={myName}
                isFirst={isFirstInGroup(index)}
                avatarColor={message.avatarColor || getAvatarColor(
                  members.findIndex(m => m.name === message.sender)
                )}
              />
            ))}

            <TypingIndicator typingUsers={typingUsers} />
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '14px 20px 16px',
            borderTop: '1px solid rgba(24,24,27,0.06)',
            flexShrink: 0,
            background: '#fff'
          }}>
            {/* Replying as chip */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              marginBottom: '10px'
            }}>
              <Avatar name={myName} color={getAvatarColor(members.findIndex(m => m.name === myName))} size={20} />
              <span style={{ fontSize: '12px', color: '#78716C' }}>
                Chatting as <strong style={{ color: '#18181B', fontWeight: '600' }}>{myName}</strong>
              </span>
            </div>

            <div style={{
              display: 'flex', alignItems: 'flex-end', gap: '10px',
              background: '#FAFAF7',
              border: '1.5px solid rgba(24,24,27,0.1)',
              borderRadius: '16px',
              padding: '10px 12px 10px 16px',
              transition: 'border-color 0.18s'
            }}
              onFocus={() => {}}
            >
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                style={{
                  flex: 1, background: 'none',
                  border: 'none', outline: 'none',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px', color: '#18181B',
                  resize: 'none', lineHeight: '1.5',
                  minHeight: '22px', maxHeight: '90px'
                }}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                style={{
                  width: '34px', height: '34px',
                  background: inputValue.trim() ? '#2D5BE3' : '#E5E0D8',
                  border: 'none', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                  flexShrink: 0,
                  transition: 'background 0.18s, transform 0.15s'
                }}
                onMouseEnter={e => { if (inputValue.trim()) e.currentTarget.style.transform = 'scale(1.08)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <span style={{ fontSize: '11px', color: '#C4BFB9' }}>
                Enter to send · Shift Enter for new line
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes typingBounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        div::-webkit-scrollbar { width: 4px; }
        div::-webkit-scrollbar-track { background: transparent; }
        div::-webkit-scrollbar-thumb { background: #E5E0D8; border-radius: 2px; }
        textarea::placeholder { color: #A8A29E; }
      `}</style>
    </div>
  )
}

export default Room