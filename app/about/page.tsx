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
            width={300}
            height={300}
            className={styles.profilePic}
          />
        </div>
        <div className={styles.aboutContent}>
          Hi, I’m Connor, a full stack developer with a solid foundation in software engineering.
          <br />
          <br />
          I recently graduated from WashU with a degree in Computer Science and Mathematics. My studies focused on data science and machine learning, 
          but I later found my passion in full stack development. I've worked with a range of technologies, including React, Angular, Java, 
          Python, C#, and more. My experience spans from game development in Unity to building full stack web applications. I'm always eager to 
          learn new skills and deepen my understanding of software engineering.
        </div>
      </div>
    </ShiftFromRightAnimation>
  );
}
