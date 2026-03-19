'use client';

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import IconButton from "./ui/iconButton";
import ShiftFromLeftAnimation from "./ui/transitions/shiftFromLeftAnimation";

import BounceAnimation from "./ui/transitions/bounceAnimation";

export default function Home() {
  const imageDiameter: number = 48;
  const technologies: string[] = useMemo(() => [
    "React",
    "React Native",
    "TypeScript",
    "Expo",
    "Next.js",
    "Node.js",
    "Java",
    "Spring Boot",
    "PostgreSQL",
    "MySQL",
    "AWS",
    "Jenkins",
    "GraphQL",
  ], []);
  const router = useRouter();

  const [currentTech, setCurrentTech] = useState<string>(technologies[0]);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [charIndex, setCharIndex] = useState<number>(0);
  const [isFirstBouncing, setIsFirstBouncing] = useState<boolean>(false); // State to control second bounce
  const [isSecondBouncing, setIsSecondBouncing] = useState<boolean>(false); // State to control second bounce
  const [isLinkedInBouncing, setIsLinkedInBouncing] = useState<boolean>(false);
  const [isGitHubBouncing, setIsGitHubBouncing] = useState<boolean>(false);
  const [isXBouncing, setIsXBouncing] = useState<boolean>(false);
  const [isEmailBouncing, setIsEmailBouncing] = useState<boolean>(false);

  useEffect(() => {
    router.prefetch("/about");
    router.prefetch("/experience");
  }, [router]);

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

  useEffect(() => {
    if (window.innerWidth <= 475) {
      const firstBounceInterval = setInterval(() => {
        setIsFirstBouncing(true);
        setTimeout(() => {
          setIsSecondBouncing(true);
        }, 350); // 0.5-second delay after the first bounce
      }, 5000); // 5-second interval for the first bounce

      return () => clearInterval(firstBounceInterval);
    }
  }, []);
  
  return (
    <ShiftFromLeftAnimation>
        <div className={styles.heroSection}>
          <div className={styles.cardsRow}>
            <div>
              {/* <div className={styles.previewContent}>
                More about me
    </div> */}
              <Link className={styles.titleContent} href="/about">
                <BounceAnimation 
                  className={styles.aboutWrapper} 
                  isBouncing={isFirstBouncing}
                  setIsBouncing={setIsFirstBouncing}
                >
                  <Image
                    src="/ME2024.png"
                    alt="Portrait of Connor Pepin"
                    width={300}
                    height={300}
                    className={styles.profilePic}
                  />
                  <h1 className={styles.name}>Connor Pepin</h1>
                  <p className={styles.roleLine}>Startup-focused software engineer</p>
                </BounceAnimation>
              </Link>
            </div>
            <div className={styles.rightColumn}>
              <BounceAnimation 
                className={styles.experienceWrapper} 
                isBouncing={isSecondBouncing}
                setIsBouncing={setIsSecondBouncing}
              >
                <Link className={styles.experienceLink} href="/experience">
                  <div className={styles.previewLabel}>Experience + projects</div>
                  <h3 className={styles.description}>Software Engineer</h3>
                  <h3 className={styles.solutionsWrapper}>
                    Building polished, product-minded software with&nbsp;
                    <div className={styles.fancyText}>
                      {displayedText}
                      <div className={styles.flashingBox} />
                    </div>
                  </h3>
                  <p className={styles.supportingText}>
                    I do my best work in startup environments where ownership is high,
                    feedback loops are fast, and quality matters.
                  </p>
                  <div className={styles.traitRow}>
                    <span className={styles.trait}>Ownership</span>
                    <span className={styles.trait}>Product thinking</span>
                    <span className={styles.trait}>Fast execution</span>
                  </div>
                </Link>
              </BounceAnimation>
              <div className={styles.cta}>
                <BounceAnimation
                  isBouncing={isLinkedInBouncing}
                  setIsBouncing={setIsLinkedInBouncing}
                >
                  <IconButton onClick={() => window.open("https://www.linkedin.com/in/connor-pepin-10954b192/")}>
                    <Image
                      src="/linkedIn.png"
                      alt="LinkedIn Logo"
                      width={imageDiameter}
                      height={imageDiameter}
                    />
                  </IconButton>
                </BounceAnimation>
                <BounceAnimation
                  isBouncing={isGitHubBouncing}
                  setIsBouncing={setIsGitHubBouncing}
                >
                  <IconButton onClick={() => window.open("https://github.com/cjpepin")}>
                    <Image
                      src="/github.png"
                      alt="GitHub Logo"
                      width={imageDiameter}
                      height={imageDiameter}
                    />
                  </IconButton>
                </BounceAnimation>
                <BounceAnimation
                  isBouncing={isXBouncing}
                  setIsBouncing={setIsXBouncing}
                >
                  <IconButton onClick={() => window.open("https://x.com/iCodeAThing")}>
                    <Image
                      src="/x.png"
                      alt="X Logo"
                      width={imageDiameter}
                      height={imageDiameter}
                    />
                  </IconButton>
                </BounceAnimation>
                <BounceAnimation
                  isBouncing={isEmailBouncing}
                  setIsBouncing={setIsEmailBouncing}
                >
                  <IconButton onClick={() => window.open('mailto:cjpepin@wustl.edu?subject=Contact%20Me&body=Hello%2C%20I%20would%20like%20to%20discuss%20...')}>
                    <Image
                      src="/email.png"
                      alt="Email icon"
                      width={imageDiameter}
                      height={imageDiameter}
                    />
                  </IconButton>
                </BounceAnimation>
              </div>
            </div>
          </div>
        </div>
    </ShiftFromLeftAnimation>
  );
}
