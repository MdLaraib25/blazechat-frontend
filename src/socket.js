import { io } from 'socket.io-client'

export const serverUrl =
  import.meta.env.VITE_SERVER_URL ||
  'https://blazechat-backend-production.up.railway.app'

const socket = io(serverUrl, {
  autoConnect: false,
  transports: ['websocket', 'polling']
})

export default socket
