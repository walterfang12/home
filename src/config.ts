export const config:Config = {
    title: "Walter_Fang's Homepage",
    author: "Walter_Fang",
    avatar: "/favicon.jpg",
    description: "INFJ-T || Rhythm Game Player || He/Him",
    links: [
        {
            name: "Blog",
            url: "https://blog.walterfang.site/",
            icon: "fa7-solid:blog"
        },
        {
            name: "Github",
            url: "https://github.com/walterfang12",
            icon: "fa:github"
        },
        {
            name: "BiliBili",
            url: "https://space.bilibili.com/1210778181",
            icon: "mingcute:bilibili-line"
        }
    ],
    backDescription: "被动社交。",
    socials: [
        {
            name: "Github",
            url: "https://github.com/walterfang12",
            icon: "mdi:github"
        },
        {
            name: "BiliBili",
            url: "https://space.bilibili.com/1210778181",
            icon: "mingcute:bilibili-line"
        },
        {
            name: "QQ",
            url: "tencent://message/?uin=1448585448",
            icon: "ri:qq-line"
        },
        {
            name: "Blog",
            url: "https://blog.walterfang.site/",
            icon: "fa7-solid:blog"
        }
    ],
    lightBackgrounds: [
        "https://w.wallhaven.cc/full/57/wallhaven-57erm8.jpg",
        "https://w.wallhaven.cc/full/e7/wallhaven-e7pxgw.jpg",
        "https://w.wallhaven.cc/full/9d/wallhaven-9dg5yk.png",
        "https://w.wallhaven.cc/full/l8/wallhaven-l8gxgq.png",
    ],
    darkBackgrounds: [
        "https://w.wallhaven.cc/full/57/wallhaven-57erm8.jpg",
        "https://w.wallhaven.cc/full/e7/wallhaven-e7pxgw.jpg",
        "https://w.wallhaven.cc/full/9d/wallhaven-9dg5yk.png",
        "https://w.wallhaven.cc/full/l8/wallhaven-l8gxgq.png",
    ],
    HF_Host: "mb6vh9n9f9.re.qweatherapi.com",
    HF_Key: "2434be2249584e11a31c971bd0b4d66f",
    playlistIdWyy: "4966564011"
}
export interface Link {
    name: string;
    url: string;
    icon?: string;
    iconHtml?: string;
}

export interface Config {
    title: string;
    author: string;
    avatar: string;
    description: string;
    links: Link[];
    backDescription: string;
    socials: Link[];
    lightBackgrounds: string[];
    darkBackgrounds: string[];
    HF_Host: string;
    HF_Key: string;
    playlistIdWyy: string;
}
