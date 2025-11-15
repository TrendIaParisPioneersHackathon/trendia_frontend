import { useState, useRef } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [avatar, setAvatar] = useState(null)
  const [product, setProduct] = useState(null)
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('5')
  const [numClips, setNumClips] = useState(3)
  const [status, setStatus] = useState(null)
  const [taskId, setTaskId] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)

  const avatarInputRef = useRef(null)
  const productInputRef = useRef(null)

  const handleDrop = (e, type) => {
    e.preventDefault()
    e.currentTarget.classList.remove('dragover')

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      if (type === 'avatar') setAvatar(file)
      else setProduct(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.currentTarget.classList.add('dragover')
  }

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('dragover')
  }

  const handleFileSelect = (e, type) => {
    const file = e.target.files[0]
    if (file) {
      if (type === 'avatar') setAvatar(file)
      else setProduct(file)
    }
  }

  const getFilePreview = (file) => {
    return URL.createObjectURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!avatar || !product || !description) {
      alert('Please fill in all fields')
      return
    }

    setStatus('uploading')
    setError(null)
    setVideoUrl(null)
    setProgress(0)

    const formData = new FormData()
    formData.append('avatar', avatar)
    formData.append('product', product)
    formData.append('description', description)
    formData.append('duration', duration)
    formData.append('num_clips', numClips)

    try {
      const response = await fetch(`${API_URL}/api/generate-video`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setTaskId(data.task_id)
        setStatus('processing')
        pollStatus(data.task_id)
      } else {
        throw new Error(data.error || 'Error during generation')
      }
    } catch (err) {
      setError(err.message)
      setStatus(null)
    }
  }

  const pollStatus = async (id) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/api/status/${id}`)
        const data = await response.json()

        setProgress(data.progress || 0)

        if (data.status === 'completed') {
          clearInterval(interval)
          setStatus('completed')
          setVideoUrl(`${API_URL}${data.video_url}`)
        } else if (data.status === 'failed') {
          clearInterval(interval)
          setError(data.error || 'Unknown error')
          setStatus(null)
        }
      } catch (err) {
        clearInterval(interval)
        setError('Server connection error')
        setStatus(null)
      }
    }, 2000)
  }

  const canSubmit = avatar && product && description && !status

  return (
    <div className="container">
      <div className="header">
        <h1>✨ trendIA</h1>
        <p>AI-Powered Promotional Video Generator</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>👤 Avatar / Person Image</label>
            <div
              className={`upload-zone ${avatar ? 'has-file' : ''}`}
              onDrop={(e) => handleDrop(e, 'avatar')}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => avatarInputRef.current?.click()}
            >
              <div className="upload-icon">📸</div>
              <p>Drag & drop an image or click to select</p>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, 'avatar')}
                style={{ display: 'none' }}
              />
              {avatar && (
                <div className="file-preview">
                  <img src={getFilePreview(avatar)} alt="Avatar" />
                  <div className="file-info">
                    <div className="file-name">{avatar.name}</div>
                    <div className="file-size">{(avatar.size / 1024).toFixed(0)} KB</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>🎨 Product Image</label>
            <div
              className={`upload-zone ${product ? 'has-file' : ''}`}
              onDrop={(e) => handleDrop(e, 'product')}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => productInputRef.current?.click()}
            >
              <div className="upload-icon">🎨</div>
              <p>Drag & drop an image or click to select</p>
              <input
                ref={productInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, 'product')}
                style={{ display: 'none' }}
              />
              {product && (
                <div className="file-preview">
                  <img src={getFilePreview(product)} alt="Product" />
                  <div className="file-info">
                    <div className="file-name">{product.name}</div>
                    <div className="file-size">{(product.size / 1024).toFixed(0)} KB</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>📝 Product Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Our revolutionary product that transforms your daily life. Innovative, powerful, and accessible."
            />
          </div>

          <div className="options">
            <div className="option-group">
              <label>⏱️ Duration per clip</label>
              <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                <option value="5">5 seconds</option>
                <option value="10">10 seconds</option>
              </select>
            </div>
            <div className="option-group">
              <label>🎬 Number of clips</label>
              <select value={numClips} onChange={(e) => setNumClips(Number(e.target.value))}>
                <option value="2">2 clips</option>
                <option value="3">3 clips</option>
                <option value="4">4 clips</option>
                <option value="5">5 clips</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn" disabled={!canSubmit}>
            {status ? '🎬 Generating...' : '🚀 Generate Video'}
          </button>
        </form>

        {status === 'processing' && (
          <div className="progress-container">
            <div className="progress-text">
              Generating... {progress}%
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="spinner"></div>
          </div>
        )}

        {status === 'completed' && videoUrl && (
          <div className="result-container">
            <h3>✅ Video generated successfully!</h3>
            <video className="result-video" controls>
              <source src={videoUrl} type="video/mp4" />
            </video>
            <a href={videoUrl} download className="download-btn">
              📥 Download Video
            </a>
          </div>
        )}

        {error && (
          <div className="error-container">
            <strong>❌ Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
