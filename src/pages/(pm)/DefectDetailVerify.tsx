import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { mockDefects } from '../../api/mock/data'
import { DefectStatus, Severity } from '../../types/enums'
import { DefectVerifyHeader } from './defect-verify/DefectVerifyHeader'
import { DefectBoundingBoxViewer } from './defect-verify/DefectBoundingBoxViewer'
import { DefectTemporalComparison } from './defect-verify/DefectTemporalComparison'
import { DefectGisMapViewer } from './defect-verify/DefectGisMapViewer'
import { DefectVerifyForm } from './defect-verify/DefectVerifyForm'

export const DefectDetailVerify: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Tìm defect theo param hoặc mặc định lấy phần tử đầu
  const defect = mockDefects.find((d) => d.id === id) || mockDefects[0]

  // Tab chuyển đổi: 'SINGLE' (Màn 08 - Thẩm định Bounding box), 'TEMPORAL' (Màn 09 - So sánh đa kỳ) hoặc 'GIS_MAP'
  const [viewMode, setViewMode] = useState<'SINGLE' | 'TEMPORAL' | 'GIS_MAP'>('SINGLE')

  const [severity, setSeverity] = useState<Severity>(defect.severity)
  const [notes, setNotes] = useState('Đã đối chiếu với kích thước thước đo thực tế')

  const handleVerify = (newStatus: DefectStatus) => {
    defect.status = newStatus
    defect.severity = severity
    alert(`Đã cập nhật trạng thái lỗi thành: ${newStatus}`)
    navigate('/pm/ai-inbox')
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Switcher */}
      <DefectVerifyHeader
        defect={defect}
        severity={severity}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onBack={() => navigate('/pm/ai-inbox')}
      />

      {/* 2. Main Grid: Left is Photo Viewer / GIS Map, Right is Verification Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 2 Columns on Desktop */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            {viewMode === 'GIS_MAP' && (
              <DefectGisMapViewer defect={defect} severity={severity} />
            )}

            {viewMode === 'SINGLE' && (
              <DefectBoundingBoxViewer defect={defect} />
            )}

            {viewMode === 'TEMPORAL' && (
              <DefectTemporalComparison defect={defect} />
            )}
          </Card>
        </div>

        {/* Right: Verification Form */}
        <div className="space-y-4">
          <DefectVerifyForm
            defect={defect}
            severity={severity}
            setSeverity={setSeverity}
            notes={notes}
            setNotes={setNotes}
            onVerify={handleVerify}
          />
        </div>
      </div>
    </div>
  )
}

export default DefectDetailVerify
