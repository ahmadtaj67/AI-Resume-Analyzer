import { useRef, useState } from 'react'
import { uploadResume } from '../../services/resumeService.js'
import {
  formatFileSize,
  resumeFileRules,
  validateResumeFile,
} from '../../utils/fileValidation.js'

function ResumeUploadPlaceholder() {
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const resetInputValue = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileSelection = (file) => {
    setSuccessMessage('')

    const validationResult = validateResumeFile(file)

    if (!validationResult.isValid) {
      setSelectedFile(null)
      setErrorMessage(validationResult.error)
      resetInputValue()
      return
    }

    setSelectedFile(file)
    setErrorMessage('')
  }

  const handleInputChange = (event) => {
    handleFileSelection(event.target.files?.[0])
  }

  const handleSelectClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setErrorMessage('')
    setSuccessMessage('')
    resetInputValue()
  }

  const handleUpload = async () => {
    const validationResult = validateResumeFile(selectedFile)

    if (!validationResult.isValid) {
      setErrorMessage(validationResult.error)
      setSuccessMessage('')
      resetInputValue()
      return
    }

    setIsUploading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await uploadResume(selectedFile)
      setSuccessMessage(
        'Your PDF was received and validated successfully. Resume analysis will be added in a later phase.',
      )
    } catch (error) {
      setErrorMessage(error.message)
      resetInputValue()
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <section
      className="dashboard-panel dashboard-upload-panel"
      aria-busy={isUploading}
      aria-labelledby="upload-placeholder-title"
    >
      <div className="dashboard-section-heading">
        <p className="eyebrow">Resume upload</p>
        <h2 id="upload-placeholder-title">Upload Your Resume</h2>
        <p>
          Select one PDF resume to confirm secure upload validation. Analysis,
          scoring, and report generation will be added in later phases.
        </p>
      </div>

      <div className="dashboard-upload-dropzone" aria-label="PDF resume selection area">
        <span aria-hidden="true">PDF</span>
        <strong>Choose one PDF resume</strong>
        <p>
          PDF only. Maximum size: {resumeFileRules.maxSizeMb} MB. The file is
          validated only and is not permanently stored.
        </p>
        <input
          aria-label="Select a PDF resume file"
          accept="application/pdf,.pdf"
          className="dashboard-file-input"
          id="resume-upload-input"
          onChange={handleInputChange}
          ref={fileInputRef}
          type="file"
        />
        <button
          className="dashboard-secondary-action"
          disabled={isUploading}
          onClick={handleSelectClick}
          type="button"
        >
          {selectedFile ? 'Replace File' : 'Select PDF File'}
        </button>
      </div>

      {selectedFile ? (
        <article className="dashboard-selected-file" aria-label="Selected resume file">
          <div>
            <strong title={selectedFile.name}>{selectedFile.name}</strong>
            <span>{formatFileSize(selectedFile.size)}</span>
          </div>
          <button
            className="dashboard-secondary-action"
            disabled={isUploading}
            onClick={handleRemoveFile}
            type="button"
          >
            Remove
          </button>
        </article>
      ) : null}

      <div className="dashboard-upload-actions">
        <button
          className="dashboard-primary-action"
          disabled={!selectedFile || isUploading}
          onClick={handleUpload}
          type="button"
        >
          {isUploading ? 'Uploading...' : 'Validate Resume PDF'}
        </button>
      </div>

      <div className="dashboard-upload-feedback" aria-live="polite">
        {successMessage ? (
          <p className="dashboard-upload-success">{successMessage}</p>
        ) : null}
        {errorMessage ? (
          <p className="dashboard-upload-error" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </section>
  )
}

export default ResumeUploadPlaceholder
