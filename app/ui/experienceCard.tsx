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
    skills?: string[]
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
    linkLabel,
    linkUrl
}) => {
  return (
    <div className={styles.experienceCardWrapper}>
        <div>{fromDate} - {toDate}</div>
        <div className={styles.headerSplit}>
            <div>{position}, {company}</div>
            {linkLabel && linkUrl && <Link href={linkUrl}>{linkLabel}</Link>}
        </div>
        <ul>
            {experiences.map((experience, index) => (
            <li key={index}>{experience}</li>
            ))}
        </ul>
        {skills && skills.map((skill, index) => (
            <Chip key={index}>{skill}</Chip>
        ))}
    </div>
  );
};

export default ExperienceCard;
