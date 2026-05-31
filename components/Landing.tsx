"use client";

import { useMemo, useRef, useState } from "react";
import type { ReactNode, MouseEvent as ReactMouseEvent } from "react";
import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import MindfulnessBloom from "./MindfulnessBloom";
import FingerprintThumb from "./FingerprintThumb";
import Fingerprint from "./Fingerprint";
import { toFingerprintParams } from "@/lib/fingerprint";
import type { Analysis } from "@/lib/analysis";


const SHOWCASE: { label: string; a: Analysis }[] = [
  {
    label: "Радост",
    a: { sentiment: 0.85, intensity: 72, energy: "high", temperature: 82, themes: ["joy"], source: "local" },
  },
  {
    label: "Спокој",
    a: { sentiment: 0.5, intensity: 30, energy: "low", temperature: 58, themes: ["calm"], source: "local" },
  },
  {
    label: "Блискост",
    a: { sentiment: 0.45, intensity: 55, energy: "medium", temperature: 72, themes: ["relationships", "joy"], source: "local" },
  },
  {
    label: "Анксиозност",
    a: { sentiment: -0.5, intensity: 84, energy: "high", temperature: 34, themes: ["anxiety", "school"], source: "local" },
  },
  {
    label: "Тага",
    a: { sentiment: -0.66, intensity: 46, energy: "low", temperature: 22, themes: ["sadness"], source: "local" },
  },
  {
    label: "Лутина",
    a: { sentiment: -0.5, intensity: 92, energy: "high", temperature: 76, themes: ["anger"], source: "local" },
  },
  {
    label: "Гордост",
    a: { sentiment: 0.72, intensity: 78, energy: "high", temperature: 80, themes: ["pride"], source: "local" },
  },
  {
    label: "Возбуда",
    a: { sentiment: 0.62, intensity: 88, energy: "high", temperature: 86, themes: ["excitement"], source: "local" },
  },
  {
    label: "Благодарност",
    a: { sentiment: 0.58, intensity: 46, energy: "medium", temperature: 68, themes: ["gratitude"], source: "local" },
  },
];


const STORY: { cls?: string; content: ReactNode }[] = [
  {
    cls: "story-intro",
    content: <>Замисли една обична училница, во вторник наутро.</>,
  },
  {
    cls: "story-big",
    content: (
      <>
        <span className="n text-grad">30</span> ученици.
        <br />
        Триесет тивки светови.
      </>
    ),
  },
  {
    content: (
      <>
        Секој <span className="n text-grad">трет</span> носи притисок од
        училиштето — тежина што ретко ја кажува на глас.
      </>
    ),
  },
  {
    content: (
      <>
        Скоро <span className="n text-grad">половина</span> се будат уморни. И
        легнуваат уште поуморни.
      </>
    ),
  },
  {
    content: (
      <>
        <span className="n text-grad">Еден на десет</span> седи во полна
        училница — и сепак се чувствува сосема сам.
      </>
    ),
  },
  {
    cls: "story-turn",
    content: (
      <>
        Но <span className="n text-grad-soft">осум на десет</span> имаат барем
        еден човек на кого можат да се потпрат.
      </>
    ),
  },
  {
    content: (
      <>
        Понекогаш, само да го <span className="text-grad-soft">видиш</span>{" "}
        чувството однадвор е доволно за да не те притиска одвнатре.
      </>
    ),
  },
  {
    cls: "story-out",
    content: <>Ти не си статистика. И не си сам во тоа што го чувствуваш.</>,
  },
];

const STEPS = [
  {
    idx: "01",
    title: "Внес",
    text: "Напиши 2–4 реченици за денот. Анонимно, без регистрација, без email.",
  },
  {
    idx: "02",
    title: "Разбирање",
    text: "Невидлив AI ги чита чувствата: тон, интензитет, теми и енергија.",
  },
  {
    idx: "03",
    title: "Отпечаток",
    text: "Чувствата стануваат единствена слика — само твоја, само за денес.",
  },
  {
    idx: "04",
    title: "Резонанца",
    text: "Гледаш колкумина денес почувствувале слично. Не си сам.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};


function Parallax({
  children,
  speed = 0.16,
  className,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const dist = speed * 240;
  const yRaw = useTransform(scrollYProgress, [0, 1], [dist, -dist]);
  const y = useSpring(yRaw, { stiffness: 90, damping: 28, mass: 0.4 });
  return (
    <motion.div
      ref={ref}
      className={className}
      style={reduce ? undefined : { y }}
    >
      {children}
    </motion.div>
  );
}


function StoryLine({ content, cls }: { content: ReactNode; cls?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.32, 0.6, 1], [0, 1, 1, 0.12]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [80, 0, -80]);
  const blurPx = useTransform(scrollYProgress, [0, 0.3, 0.66, 1], [12, 0, 0, 8]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;
  const cn = `story-line${cls ? ` ${cls}` : ""}`;
  if (reduce) return <p className={cn}>{content}</p>;
  return (
    <motion.p ref={ref} className={cn} style={{ opacity, y, filter }}>
      {content}
    </motion.p>
  );
}


function ShowcaseCell({
  label,
  a,
  index,
}: {
  label: string;
  a: Analysis;
  index: number;
}) {
  const [hover, setHover] = useState(false);
  const params = useMemo(() => toFingerprintParams(a, `show-${label}`), [a, label]);
  return (
    <motion.div
      className="show-cell"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
    >
      <FingerprintThumb
        params={params}
        size={460}
        alt={`Отпечаток за „${label}“`}
        className="show-img"
      />
      {hover && (
        <Fingerprint params={params} className="show-img show-live" animate />
      )}
      <span className="show-label chroma">{label}</span>
    </motion.div>
  );
}

export default function Landing() {
  const reduce = useReducedMotion();


  const { scrollY } = useScroll();
  const domeScale = useTransform(scrollY, [0, 650], [1, 1.16]);
  const domeOpacity = useTransform(scrollY, [0, 520], [1, 0]);
  const heroCopyY = useTransform(scrollY, [0, 540], [0, -90]);
  const heroCopyOpacity = useTransform(scrollY, [0, 440], [1, 0]);
  const hintOpacity = useTransform(scrollY, [0, 160], [1, 0]);


  const px = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 18, mass: 0.6 });
  const bloomX = useTransform(sx, [-1, 1], [-26, 26]);

  function onMove(e: ReactMouseEvent<HTMLElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width) * 2 - 1);
  }
  function onLeave() {
    px.set(0);
  }

  return (
    <main>
      <header className="lp-hero" onMouseMove={onMove} onMouseLeave={onLeave}>
        <div className="lp-bloom-dome">
          <motion.div
            className="dome-inner"
            style={
              reduce ? undefined : { x: bloomX, scale: domeScale, opacity: domeOpacity }
            }
          >
            <MindfulnessBloom ellipse />
          </motion.div>
        </div>

        <motion.div
          className="lp-hero-copy"
          style={reduce ? undefined : { y: heroCopyY, opacity: heroCopyOpacity }}
        >
          <motion.div
            className="eyebrow"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <span className="ln" /> анонимен визуелен дневник
          </motion.div>

          <motion.h1
            className="lp-title"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            Одвој минута <br />
            <span className="text-grad">за себе.</span>
          </motion.h1>

          <motion.p
            className="lp-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.8 }}
          >
            Запиши како се чувствуваш денес. ЕХО го претвора тоа во единствен
            отпечаток — и тивко ти покажува дека не си сам.
          </motion.p>

          <motion.div
            className="lp-cta"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.95 }}
          >
            <Link href="/odraz" className="btn btn-primary btn-lg">
              Започни
            </Link>
            <Link href="/galerija" className="btn btn-ghost btn-lg">
              Галерија
            </Link>
          </motion.div>

          <motion.div
            className="lp-meta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.15 }}
          >
            <span className="lp-tag">
              <b>0</b> регистрации
            </span>
            <span className="lp-tag">на македонски</span>
            <span className="lp-tag">нов отпечаток секој ден</span>
          </motion.div>
        </motion.div>

        <motion.div
          className="scroll-hint"
          style={reduce ? undefined : { opacity: hintOpacity }}
        >
          <span>скролај</span>
          <span className="line" />
        </motion.div>
      </header>
      <section className="story container">
        <motion.div
          className="eyebrow"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.6 }}
        >
          <span className="ln" /> реалноста · HBSC Македонија
        </motion.div>

        {STORY.map((line, i) => (
          <StoryLine key={i} content={line.content} cls={line.cls} />
        ))}

        <p className="story-src">Извор: HBSC — Health Behaviour in School-aged Children, Северна Македонија.</p>
      </section>
      <section className="lp-section center container">
        <Parallax speed={0.08}>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6 }}
          >
            <div className="sec-label" style={{ justifyContent: "center" }}>
              <span className="num">процесот</span>
              <span>четири мирни чекори</span>
            </div>
            <h2 className="lp-h2">
              Како <span className="text-grad">функционира</span>
            </h2>
          </motion.div>
        </Parallax>

        <Parallax speed={0.16}>
          <div className="steps">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.idx}
                className="step glass"
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
              >
                <div className="idx">{step.idx}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </motion.div>
            ))}
          </div>
        </Parallax>
      </section>
      <section className="lp-section center container">
        <Parallax speed={0.08}>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
          >
            <div className="sec-label" style={{ justifyContent: "center" }}>
              <span className="num">отпечатоци</span>
              <span>секое чувство · своја боја</span>
            </div>
            <h2 className="lp-h2">
              Секој ден добива <span className="text-grad">своја боја</span>
            </h2>
            <p className="lead">
              Истиот тивок AI што те слуша ги претвора чувствата во жива слика —
              единствена како денот. Положи го курсорот за да оживеат:
            </p>
          </motion.div>
        </Parallax>

        <Parallax speed={0.18}>
          <div className="showcase-grid">
            {SHOWCASE.map((s, i) => (
              <ShowcaseCell key={s.label} label={s.label} a={s.a} index={i} />
            ))}
          </div>
        </Parallax>
      </section>
      <section className="lp-cta-block container">
        <Parallax speed={0.28} className="glow-bloom-wrap">
          <div className="glow-bloom" aria-hidden="true">
            <MindfulnessBloom />
          </div>
        </Parallax>
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6 }}
        >
          Денешниот ден заслужува <br />
          <span className="text-grad">своја боја.</span>
        </motion.h2>
        <Link href="/odraz" className="btn btn-primary btn-lg">
          Создади го првиот отпечаток
        </Link>
      </section>

      <footer className="foot container">
        ЕХО · студентски проект · ПНУВ
        <br />
        Не е замена за професионална помош. Ако ти е тешко, разговарај со некого
        на кого му веруваш.
      </footer>
    </main>
  );
}
