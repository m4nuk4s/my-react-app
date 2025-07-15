// Import all existing driver images
import N15Grey from "@/assets/wtpth/PC/N15Grey.jpg"
import N15C8SL512 from "@/assets/wtpth/PC/N15C8SL512.jpg"
import TH17V2 from "@/assets/wtpth/PC/TH17V2.jpg"
import n14c4 from "@/assets/wtpth/PC/n14c4.jpg"
import n14128 from "@/assets/wtpth/PC/n14128.jpg"
import N17V2C4WH128 from "@/assets/wtpth/PC/N17V2C4WH128.jpg"
import n17i712img from "@/assets/wtpth/PC/N17I712.jpg"
import N17I5108SLIMG from "@/assets/wtpth/PC/N17I5108SL.jpg"
import N15C12SL512IMG from "@/assets/wtpth/PC/N15C12SL512.jpg"
import N14C4BK128IMG from "@/assets/wtpth/PC/N14C4BK128.jpg"
import K14C4T128IMG from "@/assets/wtpth/PC/K14C4T128.jpg"
import HUN14C4BK128IMG from "@/assets/wtpth/PC/HUN14C4BK128.jpg"
import PX14C4SL128IMG from "@/assets/wtpth/PC/PX14C4SL128.jpg"

export interface ExistingDriver {
  id: number;
  name: string;
  category: string;
  manufacturer: string;
  image: string;
  os: string[];
  drivers: {
    name: string;
    version: string;
    date: string;
    size: string;
    link: string;
  }[];
}

// All existing drivers from your system
export const existingDrivers: ExistingDriver[] = [
  {
    id: 1,
    name: "UKN15I711-8GR512",
    category: "laptops",
    manufacturer: "Thomson",
    os: ["windows11"],
    image: N15Grey,
    drivers: [
      { name: "Driver Package", version: "1.1", date: "2025-05-15", size: "1.98 GB", link: "http://gofile.me/5wnJP/Gne50FQ5q" }
    ]
  },
  {
    id: 2,
    name: "UKN15I310-8DG256-IF1599445",
    category: "laptops",
    manufacturer: "Thomson",
    os: ["windows11"],
    image: N15Grey,
    drivers: [
      { name: "Driver Package", version: "1.1", date: "2025-06-02", size: "2.30 GB", link: "http://gofile.me/5wnJP/YTr0V82x9" }
    ]
  },
  {
    id: 3,
    name: "UA-N15C8SL512",
    category: "laptops",
    manufacturer: "Thomson",
    os: ["windows11"],
    image: N15C8SL512,
    drivers: [
      { name: "Driver Package", version: "30.0.15.1179", date: "2023-06-10", size: "1.67 GB", link: "http://gofile.me/5wnJP/nb3OCv4AB" }
    ]
  },
  {
    id: 4,
    name: "TH17V2C4WH128-OR155481",
    category: "laptops",
    manufacturer: "Thomson",
    os: ["windows10", "windows11"],
    image: TH17V2,
    drivers: [
      { name: "Driver Package", version: "531.61", date: "2023-04-25", size: "1.05 GB", link: "http://gofile.me/5wnJP/f32DlaHd6" }
    ]
  },
  {
    id: 5,
    name: "TH15I510-16SL512-SH1589355",
    category: "laptops",
    manufacturer: "Thomson",
    os: ["windows10", "windows11"],
    image: N15Grey,
    drivers: [
      { name: "Driver Package", version: "27.20.100.9749", date: "2023-05-10", size: "3.37 GB", link: "http://gofile.me/5wnJP/S425TxWSf" }
    ]
  },
  {
    id: 6,
    name: "SPN14C4128.OR15451",
    category: "laptops",
    manufacturer: "Thomson",
    os: ["windows10"],
    image: n14c4,
    drivers: [
      { name: "Driver Package", version: "49.5.4851", date: "2023-06-01", size: "1.73 GB", link: "http://gofile.me/5wnJP/7NrLvcDIK" }
    ]
  },
  {
    id: 7,
    name: "SPK14C4BK128-OR146563",
    category: "laptops",
    manufacturer: "Thomson",
    os: ["windows10", "windows11"],
    image: n14128,
    drivers: [
      { name: "Driver Package", version: "2.1.5", date: "2023-03-18", size: "1.67 GB", link: "http://gofile.me/5wnJP/lS0M39Hol" }
    ]
  },
  {
    id: 8,
    name: "N17V2C4WH128",
    category: "laptops",
    manufacturer: "Thomson",
    os: ["windows10", "windows11"],
    image: N17V2C4WH128,
    drivers: [
      { name: "Driver Package", version: "3.3.1.2", date: "2023-04-02", size: "1.05 GB", link: "http://gofile.me/5wnJP/N8ELay1Zl" }
    ]
  },
  {
    id: 9,
    name: "N17V2C4WH128",
    category: "laptops",
    manufacturer: "Thomson",
    os: ["windows10", "windows11"],
    image: N17V2C4WH128,
    drivers: [
      { name: "Driver Package", version: "3.3.1", date: "2023-04-02", size: "1.05 GB", link: "http://gofile.me/5wnJP/N8ELay1Zl" }
    ]
  },
  {
    id: 10,
    name: "N17I712GENI3",
    category: "laptops",
    manufacturer: "Thomson",
    os: ["windows10", "windows11"],
    image: n17i712img,
    drivers: [
      { name: "Driver Package", version: "3.1.2", date: "2023-04-02", size: "1.05 GB", link: "http://gofile.me/5wnJP/QIeryHJyn" }
    ]
  },
  {
    id: 11,
    name: "N17I510.8SL512",
    category: "laptops",
    manufacturer: "Thomson",
    os: ["windows10", "windows11"],
    image: N17I5108SLIMG,
    drivers: [
      { name: "Driver Package", version: "3.3.2", date: "2023-04-02", size: "1.99 GB", link: "http://gofile.me/5wnJP/jP6rtMtmr" }
    ]
  },
  {
    id: 12,
    name: "N17I310-16BK512-IP1613462",
    category: "laptops",
    manufacturer: "Thomson",
    os: ["windows10", "windows11"],
    image: n17i712img,
    drivers: [
      { name: "Driver Package", version: "3.3.", date: "2023-07-02", size: "1.45 GB", link: "http://gofile.me/5wnJP/XTcV9qP0b" }
    ]
  },
  {
    id: 13,
    name: "N15I310.8GR256",
    category: "laptops",
    manufacturer: "Thomson",
    os: ["windows11"],
    image: N15Grey,
    drivers: [
      { name: "Driver Package", version: "3.3.1.2", date: "2024-04-02", size: "1.70 GB", link: "http://gofile.me/5wnJP/gVyNA0jEW" }
    ]
  },
  {
    id: 14,
    name: "N15C12SL512-OR146041",
    category: "laptops",
    manufacturer: "Thomson",
    os: ["windows11"],
    image: N15C12SL512IMG,
    drivers: [
      { name: "Driver Package", version: "3.3.1.2", date: "2023-04-02", size: "1.05 GB", link: "http://gofile.me/5wnJP/MLLrAa6ba" }
    ]
  },
  {
    id: 15,
    name: "N15C4SL128.OR14411",
    category: "laptops",
    manufacturer: "Thomson",
    os: ["windows11"],
    image: N15C12SL512IMG,
    drivers: [
      { name: "Driver Package", version: "3.3", date: "2023-04-02", size: "1.66 GB", link: "http://gofile.me/5wnJP/HnvTTH4GL" }
    ]
  },
  {
    id: 16,
    name: "N14C.4BK128.YU156608",
    category: "laptops",
    manufacturer: "Thomson",
    os: ["windows11"],
    image: N14C4BK128IMG,
    drivers: [
      { name: "Driver Package", version: "3.3.1.2", date: "2023-04-02", size: "1.79 GB", link: "http://gofile.me/5wnJP/MLLrAa6ba" }
    ]
  },
  {
    id: 17,
    name: "K14C4T128.OR146569",
    category: "laptops",
    manufacturer: "Thomson",
    os: ["windows11"],
    image: K14C4T128IMG,
    drivers: [
      { name: "Driver Package", version: "1.2", date: "2023-04-02", size: "1.79 GB", link: "http://gofile.me/5wnJP/onDTRKk9N" }
    ]
  },
  {
    id: 18,
    name: "HUN14C.4BK128",
    category: "laptops",
    manufacturer: "Thomson",
    os: ["windows11"],
    image: HUN14C4BK128IMG,
    drivers: [
      { name: "Driver Package", version: "1.2", date: "2024-04-02", size: "1.55 GB", link: "http://gofile.me/5wnJP/eGwd0juwK" }
    ]
  },
  {
    id: 19,
    name: "N15I712-16GR512",
    category: "laptops",
    manufacturer: "Thomson",
    os: ["windows11"],
    image: N15Grey,
    drivers: [
      { name: "Driver Package", version: "1.2", date: "2024-04-02", size: "1.62 GB", link: "http://gofile.me/5wnJP/5RHrCzNdP" },
      { name: "Touchpad Firmware", version: "2", date: "2025-04-02", size: "243 KB", link: "http://gofile.me/5wnJP/WgsCE7qRn" }
    ]
  },
  {
    id: 20,
    name: "N15I512-16GR512",
    category: "laptops",
    manufacturer: "Thomson",
    os: ["windows11"],
    image: N15Grey,
    drivers: [
      { name: "Driver Package", version: "1.2", date: "2024-04-02", size: "1.62 GB", link: "http://gofile.me/5wnJP/v4H5rm6e2" },
      { name: "Touchpad Firmware", version: "2", date: "2025-04-02", size: "243 KB", link: "http://gofile.me/5wnJP/WgsCE7qRn" }
    ]
  },
  {
    id: 21,
    name: "N15I512-8GR512",
    category: "laptops",
    manufacturer: "Thomson",
    os: ["windows11"],
    image: N15Grey,
    drivers: [
      { name: "Driver Package", version: "1.7", date: "2025-04-02", size: "1.62 GB", link: "http://gofile.me/5wnJP/mdv9h5t1K" }
    ]
  },
  {
    id: 22,
    name: "N15I312-8GR512",
    category: "laptops",
    manufacturer: "Thomson",
    os: ["windows11"],
    image: N15Grey,
    drivers: [
      { name: "Driver Package", version: "1.2", date: "2024-04-02", size: "1.54 GB", link: "http://gofile.me/5wnJP/3J0lwLQMO" }
    ]
  },
  {
    id: 23,
    name: "N15I312-8GR256",
    category: "laptops",
    manufacturer: "Thomson",
    os: ["windows11"],
    image: N15Grey,
    drivers: [
      { name: "Driver Package", version: "1.2", date: "2024-04-02", size: "1.55 GB", link: "http://gofile.me/5wnJP/rWjfXLPvD" }
    ]
  },
  {
    id: 24,
    name: "IN-PX14C4SL128",
    category: "laptops",
    manufacturer: "Thomson",
    os: ["windows11"],
    image: PX14C4SL128IMG,
    drivers: [
      { name: "Driver Package", version: "1.2", date: "2024-04-02", size: "1.25 GB", link: "http://gofile.me/5wnJP/eCriymvL3" }
    ]
  }
];

// Function to get the next available ID
export const getNextDriverId = (): number => {
  const storedDrivers = localStorage.getItem('drivers');
  
  if (storedDrivers) {
    const drivers = JSON.parse(storedDrivers);
    const maxId = Math.max(...drivers.map((d: ExistingDriver) => parseInt(d.id.toString()) || 0));
    return maxId + 1;
  }
  
  // If no stored drivers, start from the last existing driver ID + 1
  return 25;
};