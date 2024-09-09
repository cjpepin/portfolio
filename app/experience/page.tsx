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
        <h1>Experience</h1>
        <div className={style.experiencesWrapper}>
        <ExperienceCard 
          fromDate="August 2021" 
          toDate="May 2022" 
          company="Mastercard" 
          position="Software Engineer" 
          experiences={[
            "Collaborated with a team of 8 developers to deliver features for Spring Boot APIs, enhancing digital redemption services.",
            "Developed features and fixed defects for a continuous delivery platform, which reduced deployment lead time by 86%.",
            "Drove innovation by developing and presenting 3 proof-of-concept applications to senior leadership.",
            "Enhanced integration and unit testing suite to improve code coverage, ensure testing integrity, and reduce application risk.",
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
          fromDate="November 2022" 
          toDate="May 2024" 
          company="Caralyst Health" 
          position="Lead Engineer" 
          experiences={[
            "Designed and built a full-stack application from scratch, utilizing React, Angular, Node.js, and MySQL, hosted on AWS.",
            "Collaborated with the CTO to architect and implement cloud-based solutions, ensuring scalability and reliability.",
            "Developed comprehensive integration tests for server-side code to enhance code quality and reduce deployment risks.",
            "Mentored and led a team of developers, providing guidance on best practices, code reviews, and project workflows.",
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
          fromDate="May 2022" 
          toDate="December 2022" 
          company="Momentus Technologies" 
          position="Software Engineer Intern" 
          experiences={[
            "Served as the primary frontend developer in a team of 3 interns to build a dynamic web chat application using Angular, TypeScript, C#, and MongoDB, designed to enhance customer experience by recommending tailored products.",
            "Developed a full stack floor planning software using ThreeJS, capable of handling large scale event space designs.",
            "Presented an application demo to senior management with the next goals set for deployment to client-facing applications.",
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
      <h1>Projects</h1>
      <div className={style.experiencesWrapper}>
        <ExperienceCard 
          fromDate="January 2021" 
          toDate="Present" 
          company="Personal" 
          position="Full Stack Developer" 
          experiences={[
            "Developed a full stack web application using React, Node.js, and MySQL to track personal finances.",
            "Built a game using Unity and C# to learn the basics of game development.",
            "Created a personal website using React, Next.js, and Tailwind CSS to showcase my portfolio.",
          ]}
          skills={[
            "React",
            "Node.js",
            "MySQL",
            "Unity",
            "C#",
            "Next.js",
            "Tailwind CSS",
          ]}
          linkLabel="Personal Finance Tracker"
          linkUrl="idk"
        />
      </div>
    </ShiftFromRightAnimation>
  );
}
