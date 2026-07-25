import { useRef, useState } from 'react'
import ResumeTextPreview from './ResumeTextPreview.jsx'
import { extractResumeText } from '../../services/resumeService.js'
import {
  formatFileSize,
  resumeFileRules,
  validateResumeFile,
} from '../../utils/fileValidation.js'

function ResumeUploadPlaceholder() {
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [validationError, setValidationError] = useState('')
  const [extractionError, setExtractionError] = useState('')
  const [extractionResult, setExtractionResult] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)

  const resetInputValue = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileSelection = (file) => {
    setSuccessMessage('')
    setExtractionError('')
    setExtractionResult(null)

    const validationResult = validateResumeFile(file)

    if (!validationResult.isValid) {
      setSelectedFile(null)
      setValidationError(validationResult.error)
      resetInputValue()
      return
    }

    setSelectedFile(file)
    setValidationError('')
  }

  const handleInputChange = (event) => {
    handleFileSelection(event.target.files?.[0])
  }

  const handleSelectClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setValidationError('')
    setExtractionError('')
    setExtractionResult(null)
    setSuccessMessage('')
    resetInputValue()
  }

  const handleClearResult = () => {
    setExtractionResult(null)
    setSuccessMessage('')
    setExtractionError('')
  }

  const handleExtractText = async () => {
    const validationResult = validateResumeFile(selectedFile)

    if (!validationResult.isValid) {
      setValidationError(validationResult.error)
      setExtractionError('')
      setSuccessMessage('')
      resetInputValue()
      return
    }

    setIsExtracting(true)
    setValidationError('')
    setExtractionError('')
    setExtractionResult(null)
    setSuccessMessage('')

    try {
      const result = await extractResumeText(selectedFile)
      setExtractionResult(result.extraction)
      setSuccessMessage(
        'Readable text was extracted successfully. Resume analysis will be added in a later phase.',
      )
    } catch (error) {
      setExtractionError(error.message)
      resetInputValue()
    } finally {
      setIsExtracting(false)
    }
  }

  return (
    <section
      className="dashboard-panel dashboard-upload-panel"
      aria-busy={isExtracting}
      aria-labelledby="upload-placeholder-title"
    >
      <div className="dashboard-section-heading">
        <p className="eyebrow">Resume upload</p>
        <h2 id="upload-placeholder-title">Upload Your Resume</h2>
        <p>
          Select one PDF resume to extract readable text. Analysis, scoring,
          and report generation will be added in later phases.
        </p>
      </div>

      <div className="dashboard-upload-dropzone" aria-label="PDF resume selection area">
        <span aria-hidden="true">PDF</span>
        <strong>Choose one PDF resume</strong>
        <p>
          PDF only. Maximum size: {resumeFileRules.maxSizeMb} MB. The file is
          parsed in memory only and is not permanently stored.
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
          disabled={isExtracting}
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
            disabled={isExtracting}
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
          disabled={!selectedFile || isExtracting}
          onClick={handleExtractText}
          type="button"
        >
          {isExtracting ? 'Extracting Text...' : 'Extract Resume Text'}
        </button>
      </div>

      <div className="dashboard-upload-feedback" aria-live="polite">
        {successMessage ? (
          <p className="dashboard-upload-success">{successMessage}</p>
        ) : null}
        {validationError ? (
          <p className="dashboard-upload-error" role="alert">
            {validationError}
          </p>
        ) : null}
        {extractionError ? (
          <p className="dashboard-upload-error" role="alert">
            {extractionError}
            {extractionError.toLowerCase().includes('no readable text') ? (
              <span> Please upload a PDF that contains selectable text.</span>
            ) : null}
          </p>
        ) : null}
      </div>

      <ResumeTextPreview
        extractionResult={extractionResult}
        onClear={handleClearResult}
      />
    </section>
  )
}

export default ResumeUploadPlaceholder
