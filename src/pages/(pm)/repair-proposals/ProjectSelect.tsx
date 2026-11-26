import React, { useEffect, useState } from 'react'

export type ProjectChoice = { id: string; name: string; code: string }

/** Chọn dự án cho panel đọc theo trách nhiệm: mặc định theo bộ lọc của trang; nếu trang chưa chọn dự án thì chọn riêng tại panel (tự chọn khi chỉ có một dự án). */
export function useProjectChoice(projects: ProjectChoice[], initialProjectId?: string) {
  const [chosen, setChosen] = useState(initialProjectId || '')
  useEffect(() => { if (initialProjectId) setChosen(initialProjectId) }, [initialProjectId])
  useEffect(() => { if (!chosen && projects.length === 1) setChosen(projects[0].id) }, [chosen, projects])
  const projectId = projects.some((p) => p.id === chosen) ? chosen : ''
  const select = (
    <label className="block max-w-lg text-xs space-y-1"><span className="rg-label">Dự án chịu trách nhiệm hiện hành</span>
      <select aria-label="Dự án của panel" className="rg-field w-full" value={projectId} onChange={(e) => setChosen(e.target.value)}>
        <option value="">Chọn dự án</option>
        {projects.map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
      </select>
    </label>
  )
  return { projectId, select }
}
