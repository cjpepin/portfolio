// components/DownloadButton.js
import React from 'react';
import styles from './experienceCard.module.css';
import Chip from './chip';
import Link from 'next/link';

type ExperienceCardProps = {
    fromDate: string,
    toDate: string,
    company: string,
    position: string,
    experiences: string[],
    skills?: string[],
    context?: string,
    linkLabel?: string,
    linkUrl?: string
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({ 
    fromDate, 
    toDate, 
    company, 
    position, 
    experiences,
    skills,
    context,
    linkLabel,
    linkUrl
}) => {
  return (
    <div className={styles.experienceCardWrapper}>
        <div className={styles.cardHeader}>
          <div className={styles.titleBlock}>
            <div className={styles.dateLabel}>{fromDate} - {toDate}</div>
            <div className={styles.roleLine}>{position}, {company}</div>
          </div>
          {context && <div className={styles.contextLabel}>{context}</div>}
        </div>
        <div className={styles.headerSplit}>
            <div />
            {linkLabel && linkUrl && <Link href={linkUrl} className={styles.link}>{linkLabel}</Link>}
        </div>
        <ul className={styles.experienceList}>
            {experiences.map((experience, index) => (
            <li key={index}>{experience}</li>
            ))}
        </ul>
        {skills && (
          <div className={styles.skillsWrapper}>
            {skills.map((skill, index) => (
                <Chip key={index}>{skill}</Chip>
            ))}
          </div>
        )}
    </div>
  );
};

export default ExperienceCard;
