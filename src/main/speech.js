import mic from 'mic'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { BrowserWindow, app } from 'electron'

let micInstance = null
let micStream = null

const basePath = app.isPackaged ? process.resourcesPath : app.getAppPath()

const audioDir = path.join(basePath, 'resources/whisper/audio')
const audioPath = path.join(audioDir, 'output.raw')

// 🔥 FIXED PATH (your actual folder)
const exePath = path.join(basePath, 'resources/whisper/bin/Release/whisper-cli.exe')
const modelPath = path.join(basePath, 'resources/whisper/models/ggml-tiny.en.bin')

const send = (channel, data) => {
  const win = BrowserWindow.getAllWindows()[0]
  if (win) win.webContents.send(channel, data)
}

/* ---------------- START RECORDING ---------------- */
export const startRecording = () => {
  try {
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true })
    }

    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath)
    }

    micInstance = mic({
      rate: '16000',
      channels: '1',
      bitwidth: '16',
      encoding: 'signed-integer',
      endian: 'little',
      fileType: 'raw'
    })

    micStream = micInstance.getAudioStream()
    const out = fs.createWriteStream(audioPath)

    micStream.pipe(out)

    micStream.on('error', (err) => {
      console.log('MIC ERROR:', err)
    })

    micInstance.start()

    console.log('🎤 Recording started...')
    send('status', 'Recording...')
  } catch (e) {
    console.log('START ERROR:', e)
  }
}

/* ---------------- STOP RECORDING ---------------- */
export const stopRecording = () => {
  try {
    if (!micInstance) return

    console.log('🛑 Stopping...')
    micInstance.stop()

    micStream.once('close', () => {
      console.log('📁 Audio saved')
      runWhisper()
    })
  } catch (e) {
    console.log('STOP ERROR:', e)
  }
}

/* ---------------- WHISPER ---------------- */
export const runWhisper = () => {
  console.log('EXE:', exePath)
  console.log('MODEL:', modelPath)
  console.log('AUDIO:', audioPath)

  if (!fs.existsSync(exePath)) {
    console.log('❌ whisper-cli.exe NOT FOUND')
    return
  }

  if (!fs.existsSync(modelPath)) {
    console.log('❌ MODEL NOT FOUND')
    return
  }

  if (!fs.existsSync(audioPath)) {
    console.log('❌ AUDIO NOT FOUND')
    return
  }

  console.log('🧠 Running Whisper...')

  const cmd = `"${exePath}" -m "${modelPath}" -f "${audioPath}" --raw`

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.log('❌ WHISPER ERROR:', err)
      console.log(stderr)
      return
    }

    const text = stdout
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .pop()

    console.log('\n======================')
    console.log('🎤 SPEECH TO TEXT:')
    console.log(text || stdout)
    console.log('======================\n')

    send('transcript', text || stdout)
  })
}
