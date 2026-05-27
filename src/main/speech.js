import mic from 'mic'
import fs from 'fs'
import { exec } from 'child_process'
import path from 'path'
import { BrowserWindow } from 'electron'

let micInstance

const send = (channel, data) => {
  const win = BrowserWindow.getAllWindows()[0]
  win?.webContents.send(channel, data)
}

export const startRecording = () => {
  micInstance = mic({
    rate: '16000',
    channels: '1',
    fileType: 'wav'
  })

  const stream = micInstance.getAudioStream()

  const filePath = path.join(process.cwd(), 'resources/whisper/audio/output.wav')
  const output = fs.createWriteStream(filePath)

  stream.pipe(output)
  micInstance.start()

  send('status', '🎤 Recording started...')
}

export const stopRecording = () => {
  if (!micInstance) return

  micInstance.stop()
  send('status', '🛑 Recording stopped...')

  setTimeout(runWhisper, 1000)
}

export const runWhisper = () => {
  send('status', '🧠 Transcribing...')

  const exe = path.join(process.cwd(), 'resources/whisper/bin/whisper-cli.exe')
  const model = path.join(process.cwd(), 'resources/whisper/models/ggml-tiny.en.bin')
  const audio = path.join(process.cwd(), 'resources/whisper/audio/output.wav')

  const cmd = `"${exe}" -m "${model}" -f "${audio}"`

  exec(cmd, (err, stdout) => {
    if (err) {
      send('status', '❌ Error in Whisper')
      console.log(err)
      return
    }

    send('status', '✅ Done!')
    send('transcript', stdout)
  })
}
