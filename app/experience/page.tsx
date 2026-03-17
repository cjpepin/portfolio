'use client';

import { useRouter } from "next/navigation";
import style from "./page.module.css";
import ExperienceCard from "../ui/experienceCard";
import IconButton from "../ui/iconButton";
import Image from "next/image";
import ShiftFromRightAnimation from "../ui/transitions/shiftFromRightAnimation";

export default function Home() {
  const router = useRouter();

  const handleNavigateHome = (e: any) => {
    e.preventDefault();
    router.push('/');
  }

  return (
    <ShiftFromRightAnimation>
        <IconButton onClick={handleNavigateHome} style={{position: "absolute", margin: "0.25rem"}}>
          <Image
            src="/image.png"
            alt="Back arrow"
            width={25}
            height={25}
          />
        </IconButton>
        <br />
        <br />
        <h1 className={style.title}>Experience</h1>
        <p className={style.intro}>
          I enjoy roles where I can move quickly, own meaningful parts of the
          product, and help turn ideas into software that feels reliable in real
          use.
        </p>
        <div className={style.experiencesWrapper}>
        <ExperienceCard 
          fromDate="May 2025" 
          toDate="December 2025" 
          company="Crosswalk" 
          position="Lead Software Engineer" 
          context="Startup environment"
          experiences={[
            "Built the sync engine for legal work management software, owning a core part of the product that needed to stay dependable as data changed across the app.",
            "Designed and implemented UI for day-to-day legal work management workflows in a fast-moving startup setting with short product feedback loops.",
            "Worked in Expo and React Native, balancing delivery speed with the structure and quality needed for software people rely on.",
          ]}
          skills={[
            "Expo",
            "React Native",
            "TypeScript",
          ]}
        />
        <ExperienceCard 
          fromDate="November 2022" 
          toDate="May 2024" 
          company="Caralyst Health" 
          position="Lead Engineer" 
          context="Healthtech startup"
          experiences={[
            "Built a full-stack application from scratch using React, Angular, Node.js, MySQL, and AWS in close collaboration with company leadership.",
            "Helped shape product and architecture decisions for a young product that needed to move quickly without becoming fragile.",
            "Improved engineering quality through stronger integration testing and day-to-day technical leadership across reviews, implementation, and team guidance.",
          ]}
          skills={[
            "React",
            "Angular",
            "Node.js",
            "TypeScript",
            "MySQL",
            "AWS",
          ]}
          linkLabel="Caralyst Health"
          linkUrl="https://my.caralyst.io/"
        />
        <ExperienceCard 
          fromDate="August 2021" 
          toDate="May 2022" 
          company="Mastercard" 
          position="Software Engineer" 
          context="Platform engineering"
          experiences={[
            "Delivered features for Spring Boot APIs supporting digital redemption services as part of a collaborative engineering team.",
            "Built improvements for a continuous delivery platform that reduced deployment lead time by 86%.",
            "Developed and presented proof-of-concept applications to senior leadership while also strengthening integration and unit testing.",
          ]}
          skills={[
            "Java",
            "Spring Boot",
            "Jenkins",
            "PostgreSQL",
            "GraphQL",
          ]}
          linkLabel="Mastercard Redemptions Services"
          linkUrl="https://developer.mastercard.com/product/mastercard-redemption-services/"
        />
        <ExperienceCard 
          fromDate="May 2022" 
          toDate="December 2022" 
          company="Momentus Technologies" 
          position="Software Engineer Intern" 
          context="Product prototyping"
          experiences={[
            "Served as the primary frontend developer on an intern team building a web chat application with Angular, TypeScript, C#, and MongoDB.",
            "Developed full-stack floor planning software with Three.js for large-scale event space design workflows.",
            "Presented application demos to senior management and helped move exploratory work toward client-facing use cases.",
          ]}
          skills={[
            "Angular",
            "TypeScript",
            "C#",
            "MongoDB",
            "ThreeJS",
          ]}
          linkLabel="Ungerbot UI"
          linkUrl="https://cjpepin.github.io/ungerbot-frontend/"
        />
      </div>
      <div className={style.projectsSection}>
        <h2 className={style.sectionTitle}>Projects</h2>
        <div className={style.projectCard}>
          <div className={style.projectHeader}>
            <div>
              <div className={style.projectLabel}>Featured project</div>
              <h3 className={style.projectName}>LingoLeaf</h3>
            </div>
            <div className={style.projectType}>Self-built iOS app</div>
          </div>
          <p className={style.projectDescription}>
            LingoLeaf is an iOS app I developed for language learners who want to
            improve by reading full-length books instead of relying only on short,
            disconnected exercises. I built it with Expo and React Native and used
            it as a way to explore product direction, mobile UX, and the details
            that make a learning experience feel usable over time.
          </p>
          <p className={style.projectDescription}>
            The section is intentionally lightweight for now, but it is structured
            to grow into a fuller project write-up later with product decisions,
            screenshots, and implementation notes.
          </p>
          <div className={style.projectSkills}>
            <span>Expo</span>
            <span>React Native</span>
            <span>iOS</span>
            <span>Product design</span>
          </div>
        </div>
      </div>
    </ShiftFromRightAnimation>
  );
}
