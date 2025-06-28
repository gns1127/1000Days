// src/components/NavigationBar.jsx
import React from 'react'
import { FaClock, FaMapMarkerAlt, FaHome, FaPlus, FaUser, FaHeart } from 'react-icons/fa'
import { useNavigate, useLocation } from 'react-router-dom'
import styles from './NavigationBar.module.css'

const NavigationBar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const movePage = (page) => () => {
    navigate(page)
  }

  return (
    <footer className={styles.navbar}>
      <FaHome
        className={`${styles.icon} ${isActive('/home') ? styles.active : ''}`}
        onClick={movePage('/home')}
      />
      <FaMapMarkerAlt
        className={`${styles.icon} ${isActive('/map') ? styles.active : ''}`}
        onClick={movePage('/map')}
      />
      <div className={styles.plusWrapper}>
        <FaPlus className={`${styles.icon} ${styles.main}`} onClick={movePage('/upload')} />
      </div>
      <FaHeart
        className={`${styles.icon} ${isActive('/favorites') ? styles.active : ''}`}
        onClick={movePage('/favorites')}
      />
      <FaUser
        className={`${styles.icon} ${isActive('/profile') ? styles.active : ''}`}
        onClick={movePage('/profile')}
      />
    </footer>
  )
}

export default NavigationBar
