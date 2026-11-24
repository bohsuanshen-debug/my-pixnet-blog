import type { Metadata } from "next";
import Top10Client from "./Top10Client";

export const metadata: Metadata = {
  title: "沈伯的人生十大 ｜ 十大電影、十大影集與十大電玩推薦",
  description:
    "由沈伯（戴爾瑞）精選影響生命與審美品味的十大電影、十大影集與十大遊戲，包含《異星入境》、《核爆家園》、《對馬戰鬼》、《絕命毒師》等永恆殿堂神作。",
  openGraph: {
    title: "沈伯的人生十大 ｜ 十大電影、十大影集與十大電玩推薦",
    description:
      "由沈伯（戴爾瑞）精選影響生命與審美品味的十大電影、十大影集與十大遊戲，包含《異星入境》、《核爆家園》、《對馬戰鬼》、《絕命毒師》等永恆殿堂神作。",
    url: "https://bhmoviediary.com/top10",
    images: [{ url: "https://i.ibb.co/Gfh4M4mJ/cover.jpg", alt: "沈伯的人生十大" }],
  },
};

export default function Top10Page() {
  return <Top10Client />;
}
