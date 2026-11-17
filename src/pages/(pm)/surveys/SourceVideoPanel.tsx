import React, { useCallback, useEffect, useRef, useState } from 'react'
import { sourceVideoService, sourceVideosOf, SourceVideoError, type SourceVideoLoaded, type SourceVideoRef } from '../../../api/services/sourceVideoService'
import { Empty, Feedback, PanelButton, Pill, SectionTitle } from '../../../components/ui/PanelKit'
import { Icon } from '../../../components/ui/Icon'
import { useAuthStore } from '../../../store/authStore'

const mb = (n?: number) => (typeof n !== 'number' ? '—' : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(2)} MB`)
const clock = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '—')
const MEDIA_ERROR: Record<number, string> = {
  1: 'Trình phát bị hủy tải.',
  2: 'Lỗi mạng khi trình phát đọc video.',
  3: 'Trình duyệt không giải mã được video (hỏng dữ liệu hoặc codec không hỗ trợ).',
  4: 'Trình duyệt không hỗ trợ định dạng/codec của video này (MIME video/mp4 không bảo đảm codec tương thích).',
}

/**
 * Video nguồn của bản nộp (SURVEY_VIDEO) — chỉ đọc. Không tạo dataset/job/đánh giá/baseline khi xem.
 * Phát bằng thẻ <video> thật (tua theo video.currentTime), tải toàn tệp qua sourceVideoService; không dùng timeline frame AI.
 * Dùng `key={datasetId}` ở nơi gọi để đổi bản nộp thì hủy tải và giải phóng ObjectURL.
 */
export const SourceVideoPanel: React.FC<{ sourceFiles: SourceVideoRef[]; versionNo?: number | null }> = ({ sourceFiles, versionNo }) => {
  const videos = sourceVideosOf(sourceFiles)
  const [openId, setOpenId] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<{ loaded: number; total: number | null } | null>(null)
  const [loaded, setLoaded] = useState<SourceVideoLoaded | null>(null)
  const [error, setError] = useState<SourceVideoError | null>(null)
  const [mediaError, setMediaError] = useState('')
  const [duration, setDuration] = useState<number | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const loadedRef = useRef<SourceVideoLoaded | null>(null)
  const epoch = useAuthStore((s) => s.authEpoch)

  const release = useCallback(() => {
    abortRef.current?.abort(); abortRef.current = null
    loadedRef.current?.release(); loadedRef.current = null
  }, [])
  const close = useCallback(() => {
    release(); setOpenId(''); setLoaded(null); setLoading(false); setProgress(null); setError(null); setMediaError(''); setDuration(null)
  }, [release])
  // Rời panel / đổi bản nộp (key) / đổi phiên đăng nhập: hủy request và giải phóng blob, không giữ video cũ.
  useEffect(() => () => release(), [release])
  useEffect(() => { close() }, [epoch, close])

  const open = async (ref: SourceVideoRef) => {
    release(); setLoaded(null); setError(null); setMediaError(''); setDuration(null); setProgress(null)
    setOpenId(ref.fileId); setLoading(true)
    const ctl = new AbortController(); abortRef.current = ctl
    try {
      const v = await sourceVideoService.load(ref, ctl.signal, (l, t) => setProgress({ loaded: l, total: t }))
      if (ctl.signal.aborted) { v.release(); return }
      loadedRef.current = v; setLoaded(v)
    } catch (e) {
      if (ctl.signal.aborted && (e as SourceVideoError).kind === 'aborted') return
      setError(e instanceof SourceVideoError ? e : new SourceVideoError('other', (e as Error).message))
    } finally {
      if (abortRef.current === ctl) setLoading(false)
    }
  }

  // Tải tệp nguồn: cùng đường đọc + kiểm SHA-256 như khi xem; không giữ Blob sau khi lưu.
  const [downloading, setDownloading] = useState('')
  const [dlError, setDlError] = useState<SourceVideoError | null>(null)
  const download = async (ref: SourceVideoRef) => {
    if (downloading) return
    setDownloading(ref.fileId); setDlError(null)
    try {
      const v = await sourceVideoService.load(ref, new AbortController().signal)
      const a = document.createElement('a')
      a.href = v.url; a.download = `video-nguon-${ref.fileId.slice(0, 8)}.${/webm/i.test(v.mediaType) ? 'webm' : /quicktime/i.test(v.mediaType) ? 'mov' : 'mp4'}`
      document.body.appendChild(a); a.click(); a.remove()
      setTimeout(() => v.release(), 10000)
    } catch (e) {
      setDlError(e instanceof SourceVideoError ? e : new SourceVideoError('other', (e as Error).message))
    } finally { setDownloading('') }
  }
  const pct = progress?.total ? Math.min(100, Math.round((progress.loaded / progress.total) * 100)) : null
  return (
    <div className="space-y-3" data-testid="source-video-panel">
      <SectionTitle icon="movie">Video nguồn của bản nộp{typeof versionNo === 'number' ? ` · bản ${versionNo}` : ''}</SectionTitle>
      {dlError && <Feedback error={dlError.message} />}
      {videos.length === 0 ? (
        <Empty icon="videocam_off">Chưa có video nguồn trong bản nộp</Empty>
      ) : (
        <ul className="space-y-2" data-testid="source-video-list">
          {videos.map((f) => {
            const active = openId === f.fileId
            return (
              <li key={f.fileId} className={`rounded-lg border px-3 py-2 ${active ? 'border-brand-navy bg-brand-surfaceAlt' : 'border-brand-border bg-white'}`}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="rg-panel-icon !h-7 !w-7"><Icon name="smart_display" size={16} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-brand-dark truncate">Video nguồn · {f.fileId.slice(0, 8)}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <Pill tone="neutral">{f.purpose}</Pill>
                      <span>{f.mediaType || 'MIME chưa rõ'}</span><span>·</span><span>{mb(f.sizeBytes)}</span>
                      {f.checksumSha256 && <><span>·</span><span className="font-mono" title={f.checksumSha256}>SHA-256 {f.checksumSha256.slice(0, 10)}…</span></>}
                    </p>
                  </div>
                  {active && (loading || loaded || error)
                    ? <PanelButton onClick={close} aria-label="Đóng video nguồn">{loading ? 'Hủy tải' : 'Đóng'}</PanelButton>
                    : <PanelButton variant="primary" disabled={loading} onClick={() => { void open(f) }} aria-label={`Xem video nguồn ${f.fileId.slice(0, 8)}`}>Xem video nguồn</PanelButton>}
                  <PanelButton disabled={!!downloading} onClick={() => { void download(f) }} aria-label={`Tải tệp nguồn ${f.fileId.slice(0, 8)}`}>{downloading === f.fileId ? 'Đang tải…' : 'Tải tệp nguồn'}</PanelButton>
                </div>
                {active && (
                  <div className="mt-3 space-y-2">
                    {loading && (
                      <div role="status" className="space-y-1">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200" aria-label="Tiến độ tải video">
                          <div className="h-full bg-brand-navy transition-all" style={{ width: `${pct ?? 15}%` }} />
                        </div>
                        <p className="text-[11px] text-slate-500">Đang tải toàn bộ tệp{progress ? ` · ${mb(progress.loaded)}${progress.total ? ` / ${mb(progress.total)}` : ''}${pct !== null ? ` (${pct}%)` : ''}` : ''}… BE chưa hỗ trợ phát dần (Range), cần tải xong mới phát.</p>
                      </div>
                    )}
                    {error && <Feedback error={error.message} />}
                    {loaded && (
                      <>
                        <video
                          key={loaded.url}
                          data-testid="source-video-player"
                          src={loaded.url}
                          controls
                          preload="metadata"
                          playsInline
                          className="w-full max-h-[420px] rounded-lg bg-black"
                          onLoadedMetadata={(e) => setDuration((e.currentTarget as HTMLVideoElement).duration)}
                          onError={(e) => setMediaError(MEDIA_ERROR[(e.currentTarget as HTMLVideoElement).error?.code ?? 0] || 'Không phát được video.')}
                        />
                        {mediaError && <Feedback error={mediaError} />}
                        <p className="text-[11px] text-slate-500" data-testid="source-video-info">
                          {duration !== null ? `Thời lượng ${clock(duration)} · ` : ''}{mb(loaded.sizeBytes)} · {loaded.checksumVerified ? 'SHA-256 khớp metadata' : 'metadata không có SHA-256 để đối chiếu'}. Tua bằng thanh điều khiển của video (không phải timeline khung AI); xem video không tạo đánh giá, baseline hay job.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
