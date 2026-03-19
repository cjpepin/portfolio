'use client';

import Image from "next/image";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import IconButton from "../ui/iconButton";
import ShiftFromRightAnimation from "../ui/transitions/shiftFromRightAnimation";

export default function Home() {
  const router = useRouter();

  const handleNavigateHome = (e: any) => {
    e.preventDefault();
    router.push('/');
  }

  return (
    <ShiftFromRightAnimation>
      <IconButton className={styles.backButton} onClick={handleNavigateHome}>
        <Image
          src="/image.png"
          alt="Back arrow"
          width={20}
          height={20}
          className={styles.backIcon}
        />
      </IconButton>
      <div className={styles.aboutWrapper}>
        <div className={styles.profilePictureWrapper}>
          <Image
            src="/ME_NEWER.JPG"
            alt="Portrait of Connor Pepin"
            width={300}
            height={300}
            className={styles.profilePic}
          />
        </div>
        <div className={styles.aboutContent}>
          <div className={styles.sectionLabel}>About</div>
          <h1 className={styles.title}>Hi, I&apos;m Connor.</h1>
          <p>
            I&apos;m a software engineer who thrives in startup environments where
            ownership is high, pace matters, and impact is visible. I care about
            shipping quickly without letting quality slip.
          </p>
          <p>
            I&apos;m full-stack with a frontend-heavy lean. Recently at Mastercard,
            most of my work has been building RESTful Spring Boot APIs and working
            on React and Angular UIs that consume them.
          </p>
          <p>
            I also invest in my workflow. Tools like GitHub Copilot (and more
            recently, agentic AI workflows) help me iterate faster while keeping
            code readable, tested, and maintainable.
          </p>
          <div className={styles.focusBlock}>
            <div className={styles.focusLabel}>Current focus</div>
            <p className={styles.focusCopy}>
              Creating and optimizing agentic AI workflows that tighten feedback
              loops and improve throughput without sacrificing quality.
            </p>
          </div>
          <div className={styles.highlightsWrapper}>
            <span className={styles.highlight}>Agentic AI workflows</span>
            <span className={styles.highlight}>Spring Boot APIs</span>
            <span className={styles.highlight}>React + TypeScript</span>
          </div>
        </div>
      </div>
    </ShiftFromRightAnimation>
  );
}
