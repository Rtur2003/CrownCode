// ML Toolkit: three audio tools that run on the CrownCode backend. Convert a file
// between formats, make new samples from it, or read its length, tempo, key and
// loudness and get tags. One file at a time; mixing takes a second.

import React, { useMemo, useState } from 'react'
import type { NextPage } from 'next'
import { MainLayout } from '@/components/Layout/MainLayout'
import { BackendNote } from '@/components/UI/BackendNote'
import { WorldPage } from '@/components/UI/WorldPage'
import FileUploader from '@/components/MLToolkit/FileUploader'
import AudioAugmentation, { type AudioAugmentationOptions } from '@/components/MLToolkit/AudioAugmentation'
import FormatConverter, { type FormatConvertOptions } from '@/components/MLToolkit/FormatConverter'
import DatasetMetadataResult from '@/components/MLToolkit/DatasetMetadataResult'
import ProcessLog from '@/components/MLToolkit/ProcessLog'
import { useLanguage } from '@/context/LanguageContext'
import { useDatasetTool, type ToolId } from '@/hooks/useDatasetTool'
import world from '@/styles/components/world-page.module.css'
import styles from '@/styles/pages/data-manipulation.module.css'

const TOOL_IDS: ToolId[] = ['augment', 'convert', 'organize']

const INITIAL_AUGMENT: AudioAugmentationOptions = {
  pitchShift: false,
  speedChange: false,
  bassBoost: false,
  trimSilence: false,
  mixAudio: false,
  addNoise: false,
}

const INITIAL_CONVERT: FormatConvertOptions = { targetFormat: 'mp3', bitrateKbps: 192 }

const AudioDatasetPage: NextPage = () => {
  const { t } = useLanguage()
  const A = t.audioDataset
  const M = t.mlToolkit

  const [tool, setTool] = useState<ToolId>('augment')
  const [augment, setAugment] = useState<AudioAugmentationOptions>(INITIAL_AUGMENT)
  const [convert, setConvert] = useState<FormatConvertOptions>(INITIAL_CONVERT)

  const messages = useMemo(() => ({
    selectFile: A.interface.errors.selectFile,
    processingFailed: A.interface.errors.processingFailed,
    unexpected: A.interface.errors.unexpected,
    tooLarge: A.interface.errors.tooLarge,
    invalidFile: A.interface.errors.invalidFile,
    rateLimit: A.interface.errors.rateLimit,
    busy: A.interface.errors.busy,
    unreachable: A.interface.errors.unreachable,
    mixNeedsTwo: M.audioOptions.mixAudioNeedsTwoFiles,
    filesSelected: M.logs.filesUploaded,
    processStarted: M.logs.processStarted,
    done: M.logs.done,
  }), [A, M])

  const { files, state, error, resultUrl, resultName, metadata, logs, setFiles, run, reset } = useDatasetTool(messages)

  const processing = state === 'processing'
  const mixShort = tool === 'augment' && augment.mixAudio && files.length < 2
  const canRun = files.length > 0 && !processing && !mixShort

  // A result belongs to the tool that made it, so switching tools starts clean.
  const pickTool = (next: ToolId) => {
    if (next === tool) {return}
    reset()
    setTool(next)
  }

  const active = A.tools[tool]

  return (
    <MainLayout title={A.meta.title} description={A.meta.description} keywords={A.meta.keywords}>
      <WorldPage world="ml-toolkit" title={A.title} lead={A.subtitle}>
        <section className={world.section} aria-labelledby="mlk-tool-title">
          <div className={world.sectionHead}>
            <h2 id="mlk-tool-title">{active.title}</h2>
            <p>{active.description}</p>
          </div>

          <div className={world.sectionBody}>
            <BackendNote />

            <div className={styles.tabs} role="group" aria-label={A.interface.toolsLabel}>
              {TOOL_IDS.map(id => (
                <button
                  key={id}
                  type="button"
                  className={styles.tab}
                  aria-pressed={tool === id}
                  disabled={processing}
                  onClick={() => pickTool(id)}
                >
                  {A.tools[id].title}
                </button>
              ))}
            </div>

            <div>
              <div className={world.field}>
                <span className={world.fieldLabel}>{A.interface.filesTitle}</span>
                <FileUploader files={files} onFilesChange={setFiles} />
                <p className={world.hint}>{A.interface.filesNote}</p>
              </div>

              {tool === 'augment' && (
                <AudioAugmentation options={augment} onChange={setAugment} fileCount={files.length} />
              )}
              {tool === 'convert' && <FormatConverter options={convert} onChange={setConvert} />}
              {tool === 'organize' && <p className={world.hint}>{M.organizer.description}</p>}

              {error && <p className={world.error} role="alert">{error}</p>}

              <div className={world.actions}>
                <button
                  type="button"
                  className={world.primary}
                  disabled={!canRun}
                  aria-busy={processing}
                  onClick={() => void run(tool, { augment, convert })}
                >
                  {processing ? A.interface.processing : tool === 'organize' ? M.organizer.analyze : A.interface.startProcessing}
                </button>
              </div>

              <div aria-live="polite">
                {resultUrl && resultName && (
                  <div className={world.reading}>
                    <audio controls src={resultUrl} className={styles.audio} />
                    <div className={world.actions}>
                      <a className={world.primary} href={resultUrl} download={resultName}>{A.interface.downloadResult}</a>
                    </div>
                  </div>
                )}
                {metadata && <DatasetMetadataResult metadata={metadata} />}
              </div>

              {logs.length > 0 && (
                <div className={styles.logBlock}>
                  <h3 className={world.readingLabel}>{A.interface.logTitle}</h3>
                  <ProcessLog logs={logs} />
                </div>
              )}
            </div>
          </div>
        </section>

        <section className={world.section} aria-labelledby="mlk-about-title">
          <div className={world.sectionHead}>
            <h2 id="mlk-about-title">{A.about.title}</h2>
          </div>
          <div className={world.sectionBody}>
            {A.about.body.map((paragraph: string) => (
              <p key={paragraph} className={world.interpretation}>{paragraph}</p>
            ))}
          </div>
        </section>
      </WorldPage>
    </MainLayout>
  )
}

export default AudioDatasetPage
