// animeData.tsx

import { type ReactNode } from "react"; 

import hyouka from "../assets/hyouka.jpg";
import edgerunner from "../assets/edgerunner.gif";
import fern from "../assets/fern.png";
import frierenTrio from "../assets/frierenTrio.jpg";
import monogatari from "../assets/monogatari.jpg";
import suzumiya from "../assets/suzumiya.jpg";
import madeInAbyss1 from "../assets/madeInAbyss1.jpg";
import madeInAbyss from "../assets/made in abyss.jpg";
import hunter from "../assets/hunterhunter.avif";
import bunnyGirl from "../assets/bunnyGirl.jpg";
import eightySix from "../assets/86-eighty-six-lena-shin-4k--78.0_d.jpg";
import oregairuOthers from "../assets/oregairu.jpg";
import dunno from "../assets/question.webp";
import rere from "../assets/rere.jpg";
import oregairu from "../assets/oregairu.jpg";
import chuunibyou from "../assets/chuunibyou.jpeg";
import bokuyaba from "../assets/boku-no-kokoro-no-yabai-6.jpg";
import saekano from "../assets/saekano7.jpg";
import tamako from "../assets/tamako.jpg";
import kaguyasama from "../assets/kaguya-sama-love-is-war-shinomiya-cat-ears.jpg";
import goldenTime from "../assets/golden time.jpg";
import makeine from "../assets/makeine.webp";
import kayo from "../assets/kayo.jpg";
import maomao from "../assets/maomao.jpg";
import sakuraSou from "../assets/sakura-sou.webp";
import nisekoi from "../assets/nisekoi.webp";

type StreamingProvider = "netflix" | "crunchyroll";

interface AnimeItem {
  id: string;
  title: string;
  image: string;
  image1: string;
  description: string;
  reason: ReactNode;
  streaming?: StreamingProvider[];
}

export const animeList: AnimeItem[] = [
  {
    id: "hyouka",
    title: "Hyouka",
    image: hyouka,
    image1: hyouka,
    description:
      "A slice-of-life mystery series following Oreki and Chitanda as they solve everyday enigmas in their high school.",
    reason: (
      <>
        We can say that Hyouka is a masterpiece. Not only the animation is
        impeccable for it's time, the mysteries it presents, forshawdowing and
        the characters are top notch. <br /><br />
        It is my single most rewatch show and im planning in the future to make
        a video to showcase all the details that cemented this pick for me.
      </>
    ),
  },
  {
    id: "edgerunner",
    title: "Cyberpunk: Edgerunners",
    image: edgerunner,
    image1: edgerunner,
    description:
      "In the neon-lit streets of Night City, a young man tries to survive as a mercenary known as an edgerunner.",
    reason: <>It's the best show of 2022. Hands down.</>,
    streaming: ["netflix"],
  },
  {
    id: "frieren",
    title: "Frieren: Beyond Journey's End",
    image: frierenTrio,
    image1: fern,
    description:
      "An elf mage reflects on the meaning of life and time as she journeys after her hero’s party has disbanded.",
    reason: <>Ah yes, the pout queen herselft. Her relationship between Stark
    is just chef's kiss.
    </>,
    streaming: ["netflix", "crunchyroll"],
  },
  {
    id: "monogatari",
    title: "Monogatari Series",
    image: monogatari,
    image1: monogatari,
    description:
      "A supernatural dialogue-driven story exploring relationships, trauma, and identity through surreal encounters.",
    reason: <>
    I watched this show initially bacause of the "renai circulation" OP, but when I sit down to 
    watch it, it was a very weird show that realli piqued my interest back then I watched basically
    all the popular shows. 
    </>,
  },
  {
    id: "suzumiya",
    title: "The Melancholy of Haruhi Suzumiya",
    image: suzumiya,
    image1: suzumiya,
    description:
      "A high school student unknowingly befriends a godlike girl who can alter reality, leading to endless strange events.",
    reason: <></>,
  },
  {
    id: "madeInAbyss1",
    title: "Made in Abyss",
    image: madeInAbyss1,
    image1: madeInAbyss,
    description:
      "A young girl descends into the mysterious Abyss in search of her mother, uncovering both beauty and horror.",
    reason: <></>,
    streaming: ["netflix"],
  },
  {
    id: "hunter",
    title: "Hunter x Hunter",
    image: hunter,
    image1: hunter,
    description:
      "A boy embarks on a dangerous journey to become a Hunter and find his missing father.",
    reason: <></>,
  },
  {
    id: "bunnyGirl",
    title: "Rascal Does Not Dream of Bunny Girl Senpai",
    image: bunnyGirl,
    image1: bunnyGirl,
    description:
      "A high schooler encounters strange 'adolescent syndrome' phenomena tied to emotional struggles.",
    reason: <></>,
  },
  {
    id: "86",
    title: "86: Eighty-Six",
    image: eightySix,
    image1: eightySix,
    description:
      "A sci-fi war drama exploring discrimination and loss through the eyes of unmanned drone pilots.",
    reason: <></>,
    streaming: ["netflix"],
  },
];

interface OtherAnime {
  id: ListId;
  title: string;
  image: string;
  image1: string;
  description: string;
  reason: ReactNode;
}

export const others: OtherAnime[] = [
  {
    id: "romcom",
    title: "Romcom",
    image: oregairuOthers,
    image1: oregairuOthers,
    description:
      "A collection of the best romantic comedy anime series, each with its own unique take on love and humor.",
    reason: <></>,
  },
  {
    id: "drama",
    title: "Drama",
    image: kayo,
    image1: kayo,
    description:
      "A collection of the best drama anime series, each with its own unique take on emotional storytelling.",
    reason: <></>,
  },
  {
    id: "music",
    title: "Music",
    image: rere,
    image1: dunno,
    description:
      "A collection of the best music-themed anime series, each with its own unique take on the power of music.",
    reason: <></>,
  },
];


export const romcomList: AnimeItem[] = [
  {
    id: "oregairu",
    title: "My Teen Romantic Comedy SNAFU",
    image: oregairu,
    image1: oregairu,
    description: "A high school student navigates the complexities of friendship and romance while forming a service club.",
    reason: <></>,
  },
  {
    id: "chuunibyou",
    title: "Chuunibyou Demo Koi ga Shitai!",
    image: chuunibyou,
    image1: chuunibyou,
    description: "A high school student with a vivid imagination struggles to cope with reality while navigating love and friendship.",
    reason: <></>,
  },
  {
    id: "bokuyaba",
    title: "boku no kokoro no yabai yatsu",
    image: bokuyaba,
    image1: bokuyaba,
    description: "A high school student with a dark secret navigates the challenges of adolescence and romance.",
    reason: <></>,
    streaming: ["netflix"],
  },
  {
    id: "saekano",
    title: "Saekano: How to Raise a Boring Girlfriend",
    image: saekano,
    image1: saekano,
    description: "A high school student forms a doujin circle to create a visual novel, leading to unexpected romantic entanglements.",
    reason: <></>,
  },
  {
    id: "tamako",
    title: "tamako love story",
    image: tamako,
    image1: tamako,
    description: "A heartwarming story about a girl and her childhood friend navigating love and friendship.",
    reason: <></>,
  },
  {
    id: "nisekoi",
    title: "Nisekoi",
    image: nisekoi,
    image1: nisekoi,
    description: "A romantic comedy about a high school student who becomes entangled in a love triangle with two girls.",
    reason: <></>,
  },
  {
    id: "kaguyasama",
    title: "Kaguya-sama: Love Is War",
    image: kaguyasama,
    image1: kaguyasama,
    description: "Two high school geniuses engage in a battle of wits to make the other confess their love first.",
    reason: <></>,
  },
  {
    id: "goldenTime",
    title: "Golden Time",
    image: goldenTime,
    image1: goldenTime,
    description: "A college student with amnesia navigates new relationships and personal growth in Tokyo.",
    reason: <></>,
  },
  {
    id: "makeine",
    title: "Makeine: Too Many Losing Heroines",
    image: makeine,
    image1: makeine,
    description: "A high school student finds himself surrounded by multiple losing heroines, each with their own unique struggles and stories.",
    reason: <>
    this is all you need to be convinced:
    <a href="https://makeine-anime.com/special/calorie_meter/" target="_blank" rel="noopener noreferrer" className="hover:text-stone-400 italic text-blue-300"> calorie meter</a>.  
    It shows the amount of calorie Yanami ate during the span of the 12 episodes
    </>,
  },
];

export const dramaList: AnimeItem[] = [
  {
    id: "erased",
    title: "Erased",
    image: kayo,
    image1: kayo,
    description: "A struggling manga artist is sent back in time to his childhood, where he has one chance to prevent a series of tragedies.",
    reason: <>A tense, heartfelt mystery that knows exactly when to slow down and let its characters breathe.</>,
  },
  {
    id: "maomao",
    title: "Apothecary diaries",
    image: maomao,
    image1: maomao,
    description: "An observant apothecary finds herself drawn into palace intrigues, medical mysteries, and the politics of an imperial court.",
    reason: <>Maomao's curiosity and sharp wit make every case a pleasure to follow.</>,
    streaming: ["netflix"],
  },
  {
    id: "sakuraSou",
    title: "Sakura Sou no Pet na Kanojo",
    image: sakuraSou,
    image1: sakuraSou,
    description: "A kind-hearted student moves into a dorm full of brilliant misfits and learns what ambition, friendship, and growing up really cost.",
    reason: <>Warm, chaotic, and unexpectedly sincere—the kind of coming-of-age show that is easy to revisit.</>,
  },
  {
    id: "dunno",
    title: "Dunno",
    image: dunno,
    image1: dunno,
    description: "A small placeholder for future music-focused picks in the collection.",
    reason: <></>,
  },
  {
    id: "dunno",
    title: "Dunno",
    image: dunno,
    image1: dunno,
    description: "A small placeholder for future music-focused picks in the collection.",
    reason: <></>,
  },
  {
    id: "dunno",
    title: "Dunno",
    image: dunno,
    image1: dunno,
    description: "A small placeholder for future music-focused picks in the collection.",
    reason: <></>,
  },
  {
    id: "dunno",
    title: "Dunno",
    image: dunno,
    image1: dunno,
    description: "A small placeholder for future music-focused picks in the collection.",
    reason: <></>,
  },
  {
    id: "dunno",
    title: "Dunno",
    image: dunno,
    image1: dunno,
    description: "A small placeholder for future music-focused picks in the collection.",
    reason: <></>,
  },
  {
    id: "dunno",
    title: "Dunno",
    image: dunno,
    image1: dunno,
    description: "A small placeholder for future music-focused picks in the collection.",
    reason: <></>,
  },
];

export const musicList: AnimeItem[] = [
  {
    id: "rere",
    title: "Re:Creators",
    image: rere,
    image1: rere,
    description: "Fictional characters arrive in the real world and force their creators to confront the consequences of the stories they made.",
    reason: <>An inventive celebration of anime, its genres, and the people who create it.</>,
  },
  {
    id: "dunno",
    title: "Dunno",
    image: dunno,
    image1: dunno,
    description: "A small placeholder for future music-focused picks in the collection.",
    reason: <></>,
  },
  {
    id: "dunno",
    title: "Dunno",
    image: dunno,
    image1: dunno,
    description: "A small placeholder for future music-focused picks in the collection.",
    reason: <></>,
  },
  {
    id: "dunno",
    title: "Dunno",
    image: dunno,
    image1: dunno,
    description: "A small placeholder for future music-focused picks in the collection.",
    reason: <></>,
  },
  {
    id: "dunno",
    title: "Dunno",
    image: dunno,
    image1: dunno,
    description: "A small placeholder for future music-focused picks in the collection.",
    reason: <></>,
  },
  {
    id: "dunno",
    title: "Dunno",
    image: dunno,
    image1: dunno,
    description: "A small placeholder for future music-focused picks in the collection.",
    reason: <></>,
  },
  {
    id: "dunno",
    title: "Dunno",
    image: dunno,
    image1: dunno,
    description: "A small placeholder for future music-focused picks in the collection.",
    reason: <></>,
  },
  {
    id: "dunno",
    title: "Dunno",
    image: dunno,
    image1: dunno,
    description: "A small placeholder for future music-focused picks in the collection.",
    reason: <></>,
  },
  {
    id: "dunno",
    title: "Dunno",
    image: dunno,
    image1: dunno,
    description: "A small placeholder for future music-focused picks in the collection.",
    reason: <></>,
  },
];

export const listsById = {
  romcom: romcomList,
  drama: dramaList,
  music: musicList,
} as const;

export type ListId = keyof typeof listsById;
