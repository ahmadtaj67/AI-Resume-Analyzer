import { useRef, useState } from 'react'
import ResumeAnalysisResult from './ResumeAnalysisResult.jsx'
import { analyzeResume } from '../../services/resumeService.js'
import {
  formatFileSize,
  resumeFileRules,
  validateResumeFile,
} from '../../utils/fileValidation.js'

function ResumeUploadPlaceholder() {
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [validationError, setValidationError] = useState('')
  const [analysisError, setAnalysisError] = useState('')
  const [analysisResult, setAnalysisResult] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const resetInputValue = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileSelection = (file) => {
    setSuccessMessage('')
    setAnalysisError('')
    setAnalysisResult(null)

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
    setAnalysisError('')
    setAnalysisResult(null)
    setSuccessMessage('')
    resetInputValue()
  }

  const handleClearResult = () => {
    setAnalysisResult(null)
    setSuccessMessage('')
    setAnalysisError('')
  }

  const handleAnalyzeResume = async () => {
    const validationResult = validateResumeFile(selectedFile)

    if (!validationResult.isValid) {
      setValidationError(validationResult.error)
      setAnalysisError('')
      setSuccessMessage('')
      resetInputValue()
      return
    }

    setIsAnalyzing(true)
    setValidationError('')
    setAnalysisError('')
    setAnalysisResult(null)
    setSuccessMessage('')

    try {
      const result = await analyzeResume(selectedFile)
      setAnalysisResult(result.result)
      setSuccessMessage('Resume analysis completed. This result has not been saved.')
    } catch (error) {
      setAnalysisError(error.message)
      resetInputValue()
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <section
      className="dashboard-panel dashboard-upload-panel"
      aria-busy={isAnalyzing}
      aria-labelledby="upload-placeholder-title"
    >
      <div className="dashboard-section-heading">
        <p className="eyebrow">Resume upload</p>
        <h2 id="upload-placeholder-title">Upload Your Resume</h2>
        <p>
          Select one PDF resume for a temporary AI analysis. Report history and
          saved scoring will be added in later phases.
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
          disabled={isAnalyzing}
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
            disabled={isAnalyzing}
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
          disabled={!selectedFile || isAnalyzing}
          onClick={handleAnalyzeResume}
          type="button"
        >
          {isAnalyzing ? 'Analyzing Resume...' : 'Analyze Resume'}
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
        {analysisError ? (
          <p className="dashboard-upload-error" role="alert">
            {analysisError}
            {analysisError.toLowerCase().includes('no readable text') ? (
              <span> Please upload a PDF that contains selectable text.</span>
            ) : null}
          </p>
        ) : null}
      </div>

      <ResumeAnalysisResult
        result={analysisResult}
        onClear={handleClearResult}
      />
    </section>
  )
}

export default ResumeUploadPlaceholder
