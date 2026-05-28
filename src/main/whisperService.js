import fs from 'fs'
import { exec } from 'child_process'
import path from 'path'
import { app } from 'electron'

// base path (dev + prod safe)
const basePath = app.isPackaged ? process.resourcesPath : app.getAppPath()

const exePath = path.join(basePath, 'resources/whisper/bin/Release/whisper-cli.exe')
const modelPath = path.join(basePath, 'resources/whisper/models/ggml-tiny.en.bin')
const audioPath = path.join(basePath, 'resources/whisper/audio/output.raw')

export const runWhisper = () => {
  try {
    console.log('EXE:', exePath)
    console.log('MODEL:', modelPath)
    console.log('AUDIO:', audioPath)

    if (!fs.existsSync(exePath)) {
      console.log('❌ whisper-cli.exe not found')
      return
    }

    if (!fs.existsSync(modelPath)) {
      console.log('❌ model not found')
      return
    }

    if (!fs.existsSync(audioPath)) {
      console.log('❌ audio not found')
      return
    }

    console.log('🧠 Running Whisper...')

    const cmd = `"${exePath}" -m "${modelPath}" -f "${audioPath}" --raw`

    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.log('❌ Whisper Error:', err)
        console.log(stderr)
        return
      }

      const text = stdout
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .pop()

      console.log('\n========================')
      console.log('🎤 SPEECH TO TEXT RESULT:')
      console.log(text || stdout)
      console.log('========================\n')
    })
  } catch (error) {
    console.log('❌ Whisper crash:', error)
  }
}
