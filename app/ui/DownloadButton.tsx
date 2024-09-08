// components/DownloadButton.js
import React from 'react';
import styles from './button.module.css';

const DownloadButton = () => {
  return (
    <a
      href="/ConnorPepinResume.pdf" // Path to the resume
      target="_blank" // Opens in a new tab
      rel="noopener noreferrer" // Security best practice
      className={styles.downloadButton}
    >
      Resume
    </a>
  );
};

export default DownloadButton;
