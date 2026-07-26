import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AuthField from '../../components/auth/AuthField.jsx'
import PasswordField from '../../components/auth/PasswordField.jsx'
import DashboardHeader from '../../components/dashboard/DashboardHeader.jsx'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar.jsx'
import MobileNavigation from '../../components/dashboard/MobileNavigation.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  changePassword,
  getProfile,
  updateProfile,
} from '../../services/profileService.js'
import { formatDisplayDate } from '../../utils/dateFormat.js'

const initialPasswordValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

const formatRole = (role) => {
  if (typeof role !== 'string' || role.trim().length === 0) {
    return 'User'
  }

  return role
    .trim()
    .split(/\s+/)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(' ')
}

const getInitials = (user) => {
  const fullName = user?.full_name?.trim()

  if (fullName) {
    return fullName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('')
  }

  return user?.email?.charAt(0).toUpperCase() || 'U'
}

const getAccountStatus = (user) => {
  if (user?.is_active === true) {
    return 'Active'
  }

  if (user?.is_active === false) {
    return 'Inactive'
  }

  return 'Not available'
}

const getNavigationItems = (pathname, user) => [
  ...(user?.role === 'admin'
    ? [
        {
          label: 'Admin Dashboard',
          href: '/admin',
          isActive: pathname === '/admin',
        },
      ]
    : []),
  {
    label: 'Dashboard',
    href: '/dashboard',
    isActive: pathname === '/dashboard',
  },
  {
    label: 'Reports',
    href: '/reports',
    isActive: pathname.startsWith('/reports'),
  },
  {
    label: 'Compare',
    href: '/compare',
    isActive: pathname === '/compare',
  },
  {
    label: 'Profile',
    href: '/profile',
    isActive: pathname === '/profile',
  },
]

const isValidPassword = (password) =>
  typeof password === 'string' && password.length >= 6

function ProfilePage() {
  const { logout, updateUser, user } = useAuth()
  const location = useLocation()
  const [profile, setProfile] = useState(user)
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [passwordValues, setPasswordValues] = useState(initialPasswordValues)
  const [nameErrors, setNameErrors] = useState({})
  const [passwordErrors, setPasswordErrors] = useState({})
  const [profileMessage, setProfileMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [profileError, setProfileError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const displayUser = profile || user
  const userName = displayUser?.full_name?.trim() || 'User'
  const userEmail = displayUser?.email?.trim() || 'Email not available'
  const userInitials = getInitials(displayUser)
  const roleLabel = formatRole(displayUser?.role)
  const accountStatus = getAccountStatus(displayUser)
  const navigationItems = getNavigationItems(location.pathname, displayUser)

  const fetchProfile = useCallback(async () => {
    setIsLoading(true)
    setProfileError('')

    try {
      const nextProfile = await getProfile()
      setProfile(nextProfile)
      setFullName(nextProfile?.full_name || '')
      updateUser(nextProfile)
    } catch (error) {
      setProfileError(error.message)
    } finally {
      setIsLoading(false)
    }
  }, [updateUser])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const validateNameForm = () => {
    const trimmedName = fullName.trim()
    const nextErrors = {}

    if (trimmedName.length < 2 || trimmedName.length > 80) {
      nextErrors.fullName = 'Full name must be between 2 and 80 characters.'
    }

    return nextErrors
  }

  const validatePasswordForm = () => {
    const nextErrors = {}

    if (!passwordValues.currentPassword) {
      nextErrors.currentPassword = 'Current password is required.'
    }

    if (!isValidPassword(passwordValues.newPassword)) {
      nextErrors.newPassword = 'New password must be at least 6 characters.'
    }

    if (!passwordValues.confirmPassword) {
      nextErrors.confirmPassword = 'Confirm your new password.'
    } else if (passwordValues.newPassword !== passwordValues.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords must match.'
    }

    if (
      passwordValues.currentPassword &&
      passwordValues.newPassword &&
      passwordValues.currentPassword === passwordValues.newPassword
    ) {
      nextErrors.newPassword = 'New password must be different from your current password.'
    }

    return nextErrors
  }

  const handlePasswordChange = (event) => {
    const { name, value } = event.target
    setPasswordValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
  }

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    if (isSavingProfile) {
      return
    }

    setNameErrors({})
    setProfileMessage('')
    setProfileError('')

    const validationErrors = validateNameForm()
    if (Object.keys(validationErrors).length > 0) {
      setNameErrors(validationErrors)
      return
    }

    setIsSavingProfile(true)

    try {
      const result = await updateProfile({
        fullName: fullName.trim(),
      })

      setProfile(result.profile)
      updateUser(result.profile)
      setProfileMessage(result.message || 'Profile updated successfully.')
    } catch (error) {
      setProfileError(error.message)
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    if (isChangingPassword) {
      return
    }

    setPasswordErrors({})
    setPasswordMessage('')
    setPasswordError('')

    const validationErrors = validatePasswordForm()
    if (Object.keys(validationErrors).length > 0) {
      setPasswordErrors(validationErrors)
      return
    }

    setIsChangingPassword(true)

    try {
      const result = await changePassword({
        currentPassword: passwordValues.currentPassword,
        newPassword: passwordValues.newPassword,
      })

      setPasswordValues(initialPasswordValues)
      setPasswordMessage(result.message || 'Password changed successfully.')
    } catch (error) {
      setPasswordError(error.message)
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="dashboard-shell">
      <DashboardSidebar
        navigationItems={navigationItems}
        onLogout={logout}
        userEmail={userEmail}
        userInitials={userInitials}
        userName={userName}
      />

      <div className="dashboard-main-shell">
        <MobileNavigation
          navigationItems={navigationItems}
          onLogout={logout}
          userInitials={userInitials}
        />

        <main className="dashboard-main profile-page-main">
          <DashboardHeader
            accountStatus={accountStatus}
            roleLabel={roleLabel}
            userEmail={userEmail}
            userInitials={userInitials}
            userName={userName}
          />

          <section className="reports-page-heading" aria-labelledby="profile-page-title">
            <p className="eyebrow">Profile</p>
            <h1 id="profile-page-title">Profile Settings</h1>
            <p>Manage your account details and password.</p>
          </section>

          <div className="reports-state-message" aria-live="polite">
            {isLoading ? <p>Loading profile...</p> : null}
            {profileError && !isSavingProfile ? <p role="alert">{profileError}</p> : null}
          </div>

          {!isLoading ? (
            <div className="profile-settings-grid">
              <section className="dashboard-panel profile-info-panel" aria-labelledby="profile-info-title">
                <div className="dashboard-profile-topline">
                  <span className="dashboard-avatar dashboard-avatar-large" aria-hidden="true">
                    {userInitials}
                  </span>
                  <div>
                    <p className="eyebrow">Account</p>
                    <h2 id="profile-info-title">Profile Information</h2>
                  </div>
                </div>

                <dl className="dashboard-profile-list">
                  <div>
                    <dt>Full name</dt>
                    <dd>{userName}</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd title={userEmail}>{userEmail}</dd>
                  </div>
                  <div>
                    <dt>Role</dt>
                    <dd>{roleLabel}</dd>
                  </div>
                  <div>
                    <dt>Joined</dt>
                    <dd>{formatDisplayDate(displayUser?.created_at)}</dd>
                  </div>
                </dl>

                <Link className="dashboard-secondary-action" to="/dashboard">
                  Back to Dashboard
                </Link>
              </section>

              <section className="dashboard-panel profile-form-panel" aria-labelledby="profile-name-title">
                <form className="profile-form" onSubmit={handleProfileSubmit} noValidate>
                  <div className="dashboard-section-heading">
                    <p className="eyebrow">Identity</p>
                    <h2 id="profile-name-title">Update Full Name</h2>
                    <p>Your email remains read-only for this phase.</p>
                  </div>

                  {profileMessage ? (
                    <div className="form-alert form-alert-success" role="status" aria-live="polite">
                      {profileMessage}
                    </div>
                  ) : null}

                  {profileError && isSavingProfile ? (
                    <div className="form-alert form-alert-error" role="alert" aria-live="polite">
                      {profileError}
                    </div>
                  ) : null}

                  <AuthField
                    autoComplete="name"
                    disabled={isSavingProfile}
                    error={nameErrors.fullName}
                    id="profile-full-name"
                    label="Full name"
                    name="fullName"
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Alex Morgan"
                    value={fullName}
                  />

                  <AuthField
                    autoComplete="email"
                    disabled
                    id="profile-email"
                    label="Email"
                    name="email"
                    value={userEmail}
                  />

                  <button className="dashboard-primary-action" disabled={isSavingProfile} type="submit">
                    {isSavingProfile ? 'Saving...' : 'Save Full Name'}
                  </button>
                </form>
              </section>

              <section className="dashboard-panel profile-form-panel" aria-labelledby="profile-password-title">
                <form className="profile-form" onSubmit={handlePasswordSubmit} noValidate>
                  <div className="dashboard-section-heading">
                    <p className="eyebrow">Security</p>
                    <h2 id="profile-password-title">Change Password</h2>
                    <p>Verify your current password before setting a new one.</p>
                  </div>

                  {passwordMessage ? (
                    <div className="form-alert form-alert-success" role="status" aria-live="polite">
                      {passwordMessage}
                    </div>
                  ) : null}

                  {passwordError ? (
                    <div className="form-alert form-alert-error" role="alert" aria-live="polite">
                      {passwordError}
                    </div>
                  ) : null}

                  <PasswordField
                    autoComplete="current-password"
                    disabled={isChangingPassword}
                    error={passwordErrors.currentPassword}
                    id="profile-current-password"
                    label="Current password"
                    name="currentPassword"
                    onChange={handlePasswordChange}
                    onToggleVisibility={() => setShowCurrentPassword((isVisible) => !isVisible)}
                    placeholder="Enter current password"
                    showPassword={showCurrentPassword}
                    toggleLabel={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                    value={passwordValues.currentPassword}
                  />

                  <PasswordField
                    autoComplete="new-password"
                    disabled={isChangingPassword}
                    error={passwordErrors.newPassword}
                    id="profile-new-password"
                    label="New password"
                    name="newPassword"
                    onChange={handlePasswordChange}
                    onToggleVisibility={() => setShowNewPassword((isVisible) => !isVisible)}
                    placeholder="Create a new password"
                    showPassword={showNewPassword}
                    toggleLabel={showNewPassword ? 'Hide new password' : 'Show new password'}
                    value={passwordValues.newPassword}
                  />

                  <PasswordField
                    autoComplete="new-password"
                    disabled={isChangingPassword}
                    error={passwordErrors.confirmPassword}
                    id="profile-confirm-password"
                    label="Confirm password"
                    name="confirmPassword"
                    onChange={handlePasswordChange}
                    onToggleVisibility={() => setShowConfirmPassword((isVisible) => !isVisible)}
                    placeholder="Confirm new password"
                    showPassword={showConfirmPassword}
                    toggleLabel={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    value={passwordValues.confirmPassword}
                  />

                  <button className="dashboard-primary-action" disabled={isChangingPassword} type="submit">
                    {isChangingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              </section>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}

export default ProfilePage
