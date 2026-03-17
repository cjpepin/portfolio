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
      <IconButton onClick={handleNavigateHome} style={{position: "absolute", margin: "0.25rem", top: "0.5rem", left: "0.5rem"}}>
        <Image
          src="/image.png"
          alt="Back arrow"
          width={25}
          height={25}
        />
      </IconButton>
      <div className={styles.aboutWrapper}>
        <div className={styles.profilePictureWrapper}>
          <Image
            src="/ME2024.png"
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
            ownership is high, the pace is fast, and the work has a visible impact
            on the product. I enjoy building software that feels thoughtful in the
            details while still moving quickly enough to keep momentum.
          </p>
          <p>
            My background is full-stack with a frontend-heavy lean. I&apos;ve worked
            across React, React Native, Expo, TypeScript, APIs, and cloud-backed
            applications, and I&apos;m especially motivated by products where I can
            contribute to both the implementation and the shape of the user
            experience.
          </p>
          <p>
            I studied Computer Science and Mathematics at WashU, but most of what
            I value as an engineer has come from building real software, learning
            how to ship under constraints, and caring about quality without losing
            speed.
          </p>
          <div className={styles.highlightsWrapper}>
            <span className={styles.highlight}>Startup environments</span>
            <span className={styles.highlight}>React / React Native</span>
            <span className={styles.highlight}>Expo + TypeScript</span>
            <span className={styles.highlight}>Product-minded engineering</span>
          </div>
        </div>
      </div>
    </ShiftFromRightAnimation>
  );
}
