import { useEffect, useState } from 'react'

function App() {
  const [status, setStatus] = useState('Idle...')
  const [text, setText] = useState('')

  useEffect(() => {
    console.log('APP LOADED')

    const onStatus = (_, data) => setStatus(data)
    const onTranscript = (_, data) => setText(data)

    window.electron?.ipcRenderer?.on?.('status', onStatus)
    window.electron?.ipcRenderer?.on?.('transcript', onTranscript)

    return () => {
      window.electron?.ipcRenderer?.removeListener?.('status', onStatus)
      window.electron?.ipcRenderer?.removeListener?.('transcript', onTranscript)
    }
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h2>🎤 Speech to Text</h2>

      <button onClick={() => window.api?.startRecording()}>Start Recording</button>

      <button onClick={() => window.api?.stopRecording()}>Stop</button>

      <p>{status}</p>

      <pre style={{ background: '#111', color: '#0f0' }}>{text}</pre>
    </div>
  )
}

export default App
