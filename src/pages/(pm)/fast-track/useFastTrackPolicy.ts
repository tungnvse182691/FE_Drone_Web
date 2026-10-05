import { useState } from 'react'
import {
  PolicyThresholdConfig,
  PolicyHistoryItem,
  AuditLogItem,
  DefectItem as DispatchDefectItem
} from './types'
import {
  INITIAL_POLICY,
  INITIAL_POLICY_HISTORY,
  INITIAL_AUDIT_LOGS
} from './mockData'

export function useFastTrackPolicy(
  setDefects: React.Dispatch<React.SetStateAction<DispatchDefectItem[]>>,
  showToast: (msg: string) => void
) {
  const [currentPolicy, setCurrentPolicy] = useState<PolicyThresholdConfig>(INITIAL_POLICY)
  const [policyHistory, setPolicyHistory] = useState<PolicyHistoryItem[]>(INITIAL_POLICY_HISTORY)
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS)

  // Form states cho Modal Tạo chính sách mới
  const [formVersionName, setFormVersionName] = useState('Policy v2.2')
  const [formMaxArea, setFormMaxArea] = useState('0.60')
  const [formMaxDepth, setFormMaxDepth] = useState('5.5')
  const [formSlaHours, setFormSlaHours] = useState('24')
  const [formMaxPerimeter, setFormMaxPerimeter] = useState('3.0')
  const [formPolicyNote, setFormPolicyNote] = useState(
    'Điều chỉnh theo phụ lục hợp đồng bảo dưỡng thường xuyên quý IV/2026.'
  )
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false)
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false)

  const handleApplyPolicy = (action: 'ACTIVATE' | 'DRAFT') => {
    const area = parseFloat(formMaxArea) || 0.5
    const depth = parseFloat(formMaxDepth) || 5.0
    const sla = parseInt(formSlaHours, 10) || 24
    const perimeter = parseFloat(formMaxPerimeter) || 3.0
    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    const nowDate = new Date().toLocaleDateString('vi-VN')
    const timeStr = `${nowTime} ${nowDate}`

    if (action === 'ACTIVATE') {
      const updatedPolicy: PolicyThresholdConfig = {
        version: formVersionName,
        status: 'ACTIVE',
        maxAreaM2: area,
        maxDepthCm: depth,
        maxPerimeterM: perimeter,
        allowedSeverities: ['LOW', 'MEDIUM'],
        slaHours: sla,
        activatedBy: 'Kỹ sư Nguyễn Văn Hoàng (PM)',
        activatedAt: `${nowTime} • ${nowDate}`,
        appliedRoute: 'QL1A (Km 1000 - Km 1080) • PK-04',
        description: `Quy chuẩn kích hoạt tự động ${formVersionName}: Diện tích ≤ ${area}m², Độ sâu ≤ ${depth}cm.`
      }
      setCurrentPolicy(updatedPolicy)

      setPolicyHistory((prev) => [
        {
          id: `pol-${Date.now()}`,
          version: formVersionName,
          displayName: `${formVersionName} (Hiện hành)`,
          status: 'ACTIVE',
          activatedBy: 'PM Hoàng',
          activatedAt: timeStr,
          route: `Áp dụng toàn tuyến QL1A (Km 1000 - Km 1080)`,
          maxArea: area,
          maxDepth: depth,
          slaHours: sla,
          maxPerimeter: perimeter
        },
        ...prev.map((p) => ({
          ...p,
          displayName: (p.displayName || p.version).replace(' (Hiện hành)', ' (Lưu trữ)'),
          status: (p.status === 'ACTIVE' ? 'ARCHIVED' : p.status) as 'ACTIVE' | 'ARCHIVED' | 'DRAFT'
        }))
      ])

      const newAudit: AuditLogItem = {
        title: `Kích hoạt ${formVersionName} (ACTIVE)`,
        time: `${nowDate} ${nowTime}:00`,
        user: 'Nguyễn Văn Hoàng (PM)',
        hash: `sha256:${Math.random().toString(16).substring(2, 8)}...${Math.random().toString(16).substring(2, 6)}`,
        note: `Nâng ngưỡng Fast Track: Diện tích ≤ ${area} m², Độ sâu ≤ ${depth} cm, SLA ≤ ${sla}h. ${formPolicyNote}`
      }
      setAuditLogs((prev) => [newAudit, ...prev])

      setDefects((prev) =>
        prev.map((d) => {
          const isEligible = d.areaM2 <= area && d.depthCm <= depth
          return {
            ...d,
            isFastTrackEligible: isEligible,
            violationReason: isEligible
              ? undefined
              : `Diện tích ${d.areaM2} m² (> ${area} m²) hoặc Độ sâu ${d.depthCm} cm (> ${depth} cm)`
          }
        })
      )

      showToast(`ĐÃ KÍCH HOẠT CHÍNH SÁCH ${formVersionName}! Ngưỡng kỹ thuật và bảng khiếm khuyết đã cập nhật.`)
    } else {
      setPolicyHistory((prev) => [
        {
          id: `pol-${Date.now()}`,
          version: formVersionName,
          displayName: `${formVersionName} (Dự thảo)`,
          status: 'DRAFT',
          activatedBy: 'PM Hoàng (Đang soạn)',
          activatedAt: timeStr,
          route: `Ngưỡng diện tích ≤ ${area} m² • Độ sâu ≤ ${depth} cm`,
          maxArea: area,
          maxDepth: depth,
          slaHours: sla,
          maxPerimeter: perimeter
        },
        ...prev
      ])
      showToast(`Đã lưu dự thảo ${formVersionName} vào danh sách lịch sử chính sách!`)
    }

    setIsPolicyModalOpen(false)
  }

  const handleActivateDraft = (item: (typeof policyHistory)[0]) => {
    setCurrentPolicy({
      version: item.version,
      status: 'ACTIVE',
      maxAreaM2: item.maxArea,
      maxDepthCm: item.maxDepth,
      maxPerimeterM: item.maxPerimeter || 3.0,
      allowedSeverities: ['LOW', 'MEDIUM'],
      slaHours: item.slaHours,
      activatedBy: 'Kỹ sư Nguyễn Văn Hoàng (PM)',
      activatedAt: 'Vừa kích hoạt',
      appliedRoute: 'QL1A (Km 1000 - Km 1080) • PK-04',
      description: `Quy chuẩn kích hoạt tự động ${item.version}: Diện tích ≤ ${item.maxArea}m², Độ sâu ≤ ${item.maxDepth}cm.`
    })

    setPolicyHistory((prev) =>
      prev.map((p) => {
        if (p.id === item.id) {
          return { ...p, displayName: `${p.version} (Hiện hành)`, status: 'ACTIVE', activatedAt: 'Vừa kích hoạt' }
        }
        if (p.status === 'ACTIVE') {
          return { ...p, displayName: (p.displayName || p.version).replace(' (Hiện hành)', ' (Lưu trữ)'), status: 'ARCHIVED' }
        }
        return p
      })
    )

    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    const nowDate = new Date().toLocaleDateString('vi-VN')
    setAuditLogs((prev) => [
      {
        title: `Kích hoạt dự thảo ${item.version} (ACTIVE)`,
        time: `${nowDate} ${nowTime}:00`,
        user: 'Nguyễn Văn Hoàng (PM)',
        hash: `sha256:${Math.random().toString(16).substring(2, 8)}...${Math.random().toString(16).substring(2, 6)}`,
        note: `Chuyển dự thảo sang chính sách vận hành chính thức: Diện tích ≤ ${item.maxArea} m², Độ sâu ≤ ${item.maxDepth} cm.`
      },
      ...prev
    ])

    setDefects((prev) =>
      prev.map((d) => {
        const isEligible = d.areaM2 <= item.maxArea && d.depthCm <= item.maxDepth
        return {
          ...d,
          isFastTrackEligible: isEligible,
          violationReason: isEligible
            ? undefined
            : `Diện tích ${d.areaM2} m² (> ${item.maxArea} m²) hoặc Độ sâu ${d.depthCm} cm (> ${item.maxDepth} cm)`
        }
      })
    )

    showToast(`Đã kích hoạt thành công ${item.version} làm chính sách hiện hành!`)
  }

  return {
    currentPolicy,
    setCurrentPolicy,
    policyHistory,
    setPolicyHistory,
    auditLogs,
    formVersionName,
    setFormVersionName,
    formMaxArea,
    setFormMaxArea,
    formMaxDepth,
    setFormMaxDepth,
    formSlaHours,
    setFormSlaHours,
    formMaxPerimeter,
    setFormMaxPerimeter,
    formPolicyNote,
    setFormPolicyNote,
    isPolicyModalOpen,
    setIsPolicyModalOpen,
    isAuditModalOpen,
    setIsAuditModalOpen,
    handleApplyPolicy,
    handleActivateDraft
  }
}
