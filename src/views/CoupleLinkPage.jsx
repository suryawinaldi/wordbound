import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/layouts/AuthLayout'
import Button from '@/components/base/Button'
import Input from '@/components/base/Input'
import './CoupleLinkPage.css'

export default function CoupleLinkPage() {
  const navigate = useNavigate()
  const userData = useAuthStore((s) => s.userData)
  const generateInviteCode = useAuthStore((s) => s.generateInviteCode)
  const linkWithCode = useAuthStore((s) => s.linkWithCode)
  const logout = useAuthStore((s) => s.logout)

  const [inputCode, setInputCode] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [loadingLink, setLoadingLink] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate() {
    setGenerating(true)
    setError('')
    try {
      const code = await generateInviteCode()
      setGeneratedCode(code)
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  async function handleLink() {
    if (!inputCode || inputCode.length !== 6) {
      setError('Kode harus 6 angka')
      return
    }
    setLoadingLink(true)
    setError('')
    try {
      await linkWithCode(inputCode)
      // If successful, the watch below will redirect
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingLink(false)
    }
  }

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  // Watch for partnerUid being set — redirect when linked
  useEffect(() => {
    if (userData?.partnerUid) {
      navigate('/dashboard')
    }
  }, [userData?.partnerUid, navigate])

  return (
    <AuthLayout>
      <div className="link-hero">
        <h1 className="link-hero__title">Temukan Pasanganmu</h1>
        <p className="link-hero__subtitle">
          WordBound dirancang untuk dimainkan berdua.{' '}
          Hubungkan akunmu dengan pasangan untuk mulai bermain.
        </p>
      </div>

      <div className="link-cards">
        {/* Opsi 1: Punya kode */}
        <div className="link-card">
          <h2 className="link-card__title">Punya Kode?</h2>
          <p className="link-card__desc">Masukkan 6 digit kode dari pasanganmu.</p>

          <div className="link-form">
            <Input
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Contoh: 123456"
              maxLength={6}
              className="code-input"
            />
            <Button
              variant="primary"
              loading={loadingLink}
              disabled={inputCode.length !== 6}
              onClick={handleLink}
            >
              Hubungkan
            </Button>
          </div>
        </div>

        <div className="divider"><span>ATAU</span></div>

        {/* Opsi 2: Buat kode */}
        <div className="link-card">
          <h2 className="link-card__title">Buat Kode Baru</h2>
          <p className="link-card__desc">Bagikan kode ini agar pasanganmu bisa bergabung.</p>

          {generatedCode ? (
            <div className="generated-code-box">
              <span className="the-code">{generatedCode}</span>
              <p className="waiting-text">Menunggu pasanganmu bergabung...</p>
            </div>
          ) : (
            <Button variant="secondary" loading={generating} onClick={handleGenerate}>
              Buat Kode Invite
            </Button>
          )}
        </div>
      </div>

      {error && <p className="error-msg">{error}</p>}

      <div className="link-footer">
        <Button variant="ghost" onClick={handleLogout}>Keluar</Button>
      </div>
    </AuthLayout>
  )
}
