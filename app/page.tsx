'use client';

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import IconButton from "./ui/iconButton";
import ShiftFromLeftAnimation from "./ui/transitions/shiftFromLeftAnimation";

import BounceAnimation from "./ui/transitions/bounceAnimation";

export default function Home() {
  const imageDiameter: number = 40;
  const technologies: string[] = useMemo(() => [
    "React",
    "Angular",
    "Node.js",
    "Javascript",
    "TypeScript",
    "HTML",
    "CSS",
    "Python",
    "Java",
    "C#",
    "Java",
    "Maven",
    "Spring Boot",
    "MySQL",
    "GraphQL",
    "PostgreSQL",
    "MongoDB",
    "Cloud Foundry/cfCLI",
    "Jenkins",
    "AWS"
  ], []);
  const router = useRouter();

  const [currentTech, setCurrentTech] = useState<string>(technologies[0]);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [charIndex, setCharIndex] = useState<number>(0);

  const handleNavigate = (e: any, location: string) => {
    e.preventDefault();
    setTimeout(() => router.push(location), 0);
  }

  useEffect(() => {
    const techInterval = setInterval(() => {
      setCurrentTech((prevTech) => {
        const nextIndex: number = (technologies.indexOf(prevTech) + 1) % technologies.length;
        return technologies[nextIndex];
      });
      setDisplayedText(''); // Reset displayed text for new tech
      setCharIndex(0); // Reset typing index
    }, 2000); // Duration for each technology before switching to the next

    return () => clearInterval(techInterval);
  }, [technologies]);

  useEffect(() => {
    if (charIndex < currentTech.length) {
      const typingTimeout = setTimeout(() => {
        setDisplayedText((prevText) => prevText + currentTech[charIndex]);
        setCharIndex(charIndex + 1);
      }, 75); // Speed of typing effect

      return () => clearTimeout(typingTimeout);
    }
  }, [charIndex, currentTech]);
  
  return (
    <ShiftFromLeftAnimation>
        <div className={styles.heroSection}>
          <div className={styles.aboutWrapper}>
            {/* <div className={styles.previewContent}>
              More about me
  </div> */}
            <div 
              className={styles.titleContent}
              onClick={e => handleNavigate(e, '/about')}
            >
              <BounceAnimation className={styles.aboutWrapper}>
                <Image
                  src="/ME2024.png"
                  alt="LinkedIn Logo"
                  width={300}
                  height={300}
                  className={styles.profilePic}
                />
                <h1 className={styles.name}>Connor Pepin</h1>
              </BounceAnimation>
            </div>
          </div>
          <BounceAnimation className={styles.experienceWrapper}>
            <div onClick={e => handleNavigate(e, '/experience')}>
              <h3 className={styles.description}>Full Stack Developer</h3>
              <h3 className={styles.solutionsWrapper}>
                Building scalable web applications with&nbsp;
                <div className={styles.fancyText}>
                  {displayedText}
                  <div className={styles.flashingBox} />
                </div>
              </h3>
            </div>
          </BounceAnimation>
          <div className={`${styles.cta}`}>
            <IconButton>
              <Image
                src="/linkedIn.png"
                alt="LinkedIn Logo"
                width={imageDiameter}
                height={imageDiameter}
                onClick={() => window.open("https://www.linkedin.com/in/connor-pepin-10954b192/")}
              />
            </IconButton>
            <IconButton>
              <Image
                src="/github.png"
                alt="GitHub Logo"
                width={imageDiameter}
                height={imageDiameter}
                onClick={() => window.open("https://github.com/cjpepin")}
              />
            </IconButton>
            <IconButton>
              <Image
                src="/x.png"
                alt="X Logo"
                width={imageDiameter}
                height={imageDiameter}
                onClick={() => window.open("https://x.com/iCodeAThing")}
              />
            </IconButton>
            <IconButton>
              <Image
                src="/email.png"
                alt="Email icon"
                width={imageDiameter}
                height={imageDiameter}
                onClick={() => window.open('mailto:cjpepin@wustl.edu?subject=Contact%20Me&body=Hello%2C%20I%20would%20like%20to%20discuss%20...') }
              />
            </IconButton>
          </div>
        </div>
    </ShiftFromLeftAnimation>
  );
}
