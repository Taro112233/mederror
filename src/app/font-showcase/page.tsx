import { Inter, Roboto, Open_Sans, Prompt, Noto_Sans_Thai, IBM_Plex_Sans_Thai, Sarabun } from "next/font/google";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-roboto",
});

const openSans = Open_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-open-sans",
});

const prompt = Prompt({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-prompt",
});

const notoSansThai = Noto_Sans_Thai({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-noto-sans-thai",
});

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-ibm-plex-sans-thai",
});

const sarabun = Sarabun({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-sarabun",
});

const fonts = [
  {
    name: "Inter",
    variable: inter.variable,
    description: "ฟอนต์ที่ทันสมัย อ่านง่าย เหมาะสำหรับเว็บไซต์",
    category: "สากล",
  },
  {
    name: "Roboto",
    variable: roboto.variable,
    description: "ฟอนต์ของ Google ที่อ่านง่ายและเป็นที่นิยม",
    category: "สากล",
  },
  {
    name: "Open Sans",
    variable: openSans.variable,
    description: "ฟอนต์ที่ออกแบบมาเพื่อการอ่านบนหน้าจอ",
    category: "สากล",
  },
  {
    name: "Prompt",
    variable: prompt.variable,
    description: "ฟอนต์ไทยที่สวยงามและทันสมัย",
    category: "ไทย",
  },
  {
    name: "Noto Sans Thai",
    variable: notoSansThai.variable,
    description: "ฟอนต์ที่ออกแบบมาเพื่อภาษาไทยโดยเฉพาะ",
    category: "ไทย",
  },
  {
    name: "IBM Plex Sans Thai",
    variable: ibmPlexSansThai.variable,
    description: "ฟอนต์ที่สวยงามและอ่านง่าย",
    category: "ไทย",
  },
  {
    name: "Sarabun",
    variable: sarabun.variable,
    description: "ฟอนต์ไทยที่ออกแบบโดย SIPA",
    category: "ไทย",
  },
];

export default function FontShowcasePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Font Showcase
          </h1>
          <p className="text-xl text-gray-600">
            เปรียบเทียบฟอนต์ต่างๆ สำหรับภาษาไทย
          </p>
        </div>

        <div className="grid gap-8">
          {fonts.map((font) => (
            <div
              key={font.name}
              className="bg-white rounded-xl shadow-lg p-8 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {font.name}
                  </h2>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    font.category === "ไทย" 
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {font.category}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Variable: {font.variable}
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                {font.description}
              </p>

              <div className="space-y-4">
                {/* Thai Text Samples */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    ตัวอย่างภาษาไทย:
                  </h3>
                  <div className={`${font.variable} space-y-2`}>
                    <p className="text-2xl font-light">
                      ระบบรายงานความคลาดเคลื่อนทางยา
                    </p>
                    <p className="text-lg font-normal">
                      ยินดีต้อนรับสู่ระบบจัดการข้อผิดพลาดทางการแพทย์
                    </p>
                    <p className="text-base font-medium">
                      กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ
                    </p>
                    <p className="text-sm font-semibold">
                      ข้อมูลส่วนตัว • การตั้งค่า • ความปลอดภัย
                    </p>
                  </div>
                </div>

                {/* English Text Samples */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    English Text:
                  </h3>
                  <div className={`${font.variable} space-y-2`}>
                    <p className="text-2xl font-light">
                      Medical Error Reporting System
                    </p>
                    <p className="text-lg font-normal">
                      Welcome to the medical error management system
                    </p>
                    <p className="text-base font-medium">
                      Please login to continue
                    </p>
                    <p className="text-sm font-semibold">
                      Profile • Settings • Security
                    </p>
                  </div>
                </div>

                {/* Numbers and Special Characters */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    ตัวเลขและสัญลักษณ์:
                  </h3>
                  <div className={`${font.variable} text-lg`}>
                    <p>0123456789 • @#$%^&*() • ๑๒๓๔๕๖๗๘๙๐</p>
                    <p>ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
                    <p>abcdefghijklmnopqrstuvwxyz</p>
                    <p>กขคฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮ</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            คำแนะนำการเลือกฟอนต์
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ฟอนต์สากล (Inter, Roboto, Open Sans)
              </h3>
              <ul className="text-gray-600 space-y-1">
                <li>• รองรับหลายภาษาได้ดี</li>
                <li>• มีประสิทธิภาพดี</li>
                <li>• เหมาะสำหรับเว็บไซต์สากล</li>
                <li>• โหลดเร็ว</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ฟอนต์ไทย (Prompt, Noto Sans Thai, IBM Plex Sans Thai, Sarabun)
              </h3>
              <ul className="text-gray-600 space-y-1">
                <li>• ออกแบบมาเพื่อภาษาไทยโดยเฉพาะ</li>
                <li>• อ่านง่ายสำหรับคนไทย</li>
                <li>• รองรับตัวอักษรไทยได้ครบถ้วน</li>
                <li>• เหมาะสำหรับเว็บไซต์ไทย</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 