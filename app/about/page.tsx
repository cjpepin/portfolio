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
            alt="LinkedIn Logo"
            width={250}
            height={250}
            className={styles.profilePic}
          />
        </div>
        <div className={styles.aboutContent}>
          Hello! My name is Connor, I&apos;m a full stack developer with a diverse background in software engineering.
          <br />
          <br />
          I have a degree from WashU in Computer Science and Mathematics. During school I spent time focusing on 
          data science and machine learning, but I have since transitioned to full stack development. I have experience
          with a wide range of technologies, including React, Angular, Java, Python, C# and more. I have worked on a
          variety of projects, from game development in Unity to full stack web applications. I am always looking to
          learn new skills and expand my knowledge of software engineering.
        </div>
      </div>
    </ShiftFromRightAnimation>
  );
}
