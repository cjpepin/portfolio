'use client';

import Image from "next/image";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { IconButton } from "../ui/iconButton";

export default function Home() {
  const router = useRouter();

  const handleNavigateHome = (e: any) => {
    e.preventDefault();
    router.push('/');
  }

  return (
    <>
      <IconButton onClick={handleNavigateHome} style={{position: "absolute", margin: "0.25rem"}}>
        <Image
          src="/image.png"
          alt="Back arrow"
          width={35}
          height={35}
        />
      </IconButton>
      <main className={styles.aboutWrapper}>
        <div className={styles.skillsContent}>
          I have skills
        </div>
      </main>
    </>
  );
}
