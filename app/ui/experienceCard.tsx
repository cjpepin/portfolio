import React, { useState } from 'react';
import styles from './experienceCard.module.css';
import Chip from './chip';
import Image from 'next/image';
import BounceAnimation from './transitions/bounceAnimation';

type ExperienceCardProps = {
    fromDate: string,
    toDate: string,
    company: string,
    position: string,
    experiences: string[],
    skills?: string[],
    context?: string,
    linkLabel?: string,
    linkUrl?: string,
    linkIconSrc?: string,
    linkIconAlt?: string,
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
    linkUrl,
    linkIconSrc,
    linkIconAlt,
}) => {
  const [isLinkBouncing, setIsLinkBouncing] = useState(false);

  return (
    <div className={styles.experienceCardWrapper}>
        <div className={styles.cardHeader}>
          <div className={styles.titleBlock}>
            <div className={styles.dateLabel}>{fromDate} - {toDate}</div>
            <div className={styles.roleLine}>{position}, {company}</div>
          </div>
          {context && <div className={styles.contextLabel}>{context}</div>}
        </div>
        <ul className={styles.experienceList}>
            {experiences.map((experience, index) => (
            <li key={index}>{experience}</li>
            ))}
        </ul>

        {linkLabel && linkUrl && (
          <>
            {!linkIconSrc && (
              <a
                href={linkUrl}
                target="_blank"
                rel="noreferrer noopener"
                className={styles.link}
              >
                {linkLabel}
              </a>
            )}
            {linkIconSrc && (
              <a
                href={linkUrl}
                target="_blank"
                rel="noreferrer noopener"
                className={styles.iconLink}
                aria-label={linkLabel}
                title={linkLabel}
              >
                <BounceAnimation
                  isBouncing={isLinkBouncing}
                  setIsBouncing={setIsLinkBouncing}
                >
                  <div className={styles.appIconButton}>
                    <Image
                      src={linkIconSrc}
                      alt={linkIconAlt ?? linkLabel}
                      fill
                      sizes="52px"
                      className={styles.appIconImage}
                    />
                  </div>
                </BounceAnimation>
              </a>
            )}
          </>
        )}

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
