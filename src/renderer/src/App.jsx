import { useEffect, useState } from 'react'

function App() {
  const [status, setStatus] = useState('Idle...')
  const [text, setText] = useState('')

  useEffect(() => {
    if (!window.api) {
      console.error('❌ window.api NOT FOUND')
      return
    }

    window.api.onStatus((data) => setStatus(data))
    window.api.onTranscript((data) => setText(data))
  }, [])

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h2>🎤 Speech to Text (Whisper)</h2>

      <button onClick={() => window.api?.startRecording()}>Start Recording</button>

      <button onClick={() => window.api?.stopRecording()} style={{ marginLeft: 10 }}>
        Stop + Transcribe
      </button>

      {/* STATUS */}
      <p style={{ marginTop: 20, color: 'blue' }}>{status}</p>

      {/* TRANSCRIPT */}
      <pre style={{ marginTop: 20, background: '#111', color: '#0f0', padding: 10 }}>
        {text || 'No transcript yet'}
      </pre>
    </div>
  )
}

export default App
