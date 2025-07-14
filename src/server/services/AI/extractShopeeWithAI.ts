import { config } from "dotenv";
config(); 

import { OpenAI } from "openai";
import fs from "fs";
import path from "path";

// ✅ สร้าง client ด้วย API key (with fallback)
let openai: OpenAI | null = null;

try {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "sk-placeholder-key-for-development") {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  } else {
    console.warn("⚠️ OpenAI API key not found or is placeholder. AI features will be disabled.");
  }
} catch (error) {
  console.warn("⚠️ Failed to initialize OpenAI client:", error);
}

// ✅ ฟังก์ชันล้าง ```json ... ``` ที่ GPT ชอบตอบมา
function stripMarkdownJson(input: string): string {
  return input
    .replace(/^```json\s*/i, "") // ตัด ```json ด้านบน
    .replace(/^```\s*/i, "")     // ตัด ``` ที่อยู่โดด ๆ ด้านบน
    .replace(/```$/i, "")        // ตัด ``` ท้าย
    .trim();
}

// ✅ ฟังก์ชันหลัก
export async function extractShopeeWithAI(text: string) {
  // ถ้าไม่มี OpenAI client ให้ return mock data
  if (!openai) {
    console.warn("⚠️ OpenAI not available, returning mock data");
    return [
      {
        order: "MOCK123",
        recipient: "นาย ทดสอบ ระบบ 123 หมู่ 1 ตำบลบางพลี อำเภอบางพลี จังหวัดสมุทรปราการ 10540 Tel: 081-234-5678",
        sender: "บริษัท กิจกนก จำกัด 91-93-95 ซอยสวนผัก 29, แขวงตลิ่งชัน, เขตตลิ่งชัน, จังหวัดกรุงเทพมหานคร 10170"
      }
    ];
  }

  const prompt =
`คุณเป็น AI ที่เชี่ยวชาญในการวิเคราะห์เอกสาร PDF และสกัดข้อมูลสำคัญ

งานของคุณคือหาข้อมูลต่อไปนี้จากเอกสาร:
1. หา Order Number/เลขที่ออเดอร์ (อาจเป็น Order No, Order Number, เลขที่ออเดอร์, เลขคำสั่งซื้อ, Shopee Order No.หรือรูปแบบอื่นๆ)
2. หาข้อมูลผู้รับ (ชื่อ-สกุล, ที่อยู่ เบอร์โทร) รวมเป็นข้อความเดียว
3. หาข้อมูลผู้ส่ง (ชื่อ-สกุล, ที่อยู่ เบอร์โทร) รวมเป็นข้อความเดียว
4. ข้อมูลที่อยู่ของผู้รับและผู้ส่งควรมีความสมบูรณ์และชัดเจน
 - **กรุณาละเว้นการดึงข้อมูลที่อยู่ของบริษัท เช่น "บริษัท กิจกนก จำกัด" หรือ "ซอยสวนผัก 29" หรือที่อยู่ที่มีลักษณะไม่สมบูรณ์ เช่น "91-93-95 ซอยสวนผัก29" หรือ "เขตตลิ่งชัน"**
กรุณาตอบในรูปแบบ JSON Array ตามตัวอย่างนี้:
5. ข้อมูลที่อยู่จะมีการขึ้นต้นด้วย "เลขที่" หรือ "บ้านเลขที่" หรือ "บ้านเลขที่" หรือ "หมู่บ้าน" หรือ "ซอย" หรือ "ถนน" หรือ "แขวง" หรือ "เขต" หรือ "จังหวัด" หรือ "สถานที่"ให้ชัดเจนแล้วครบถ้วน

[
  {
    "order": "ABC123",
    "recipient": "กรอกข้อมูลผู้รับ เช่น นาย สมชาย ใจดี 123 หมู่ 1 ตำบลบางพลี อำเภอบางพลี จังหวัดสมุทรปราการ 10540 Tel: 081-234-5678",
    "sender":"กรอกข้อมูลผู้ส่ง เช่น บริษัท กิจกนก จำกัด 91-93-95 ซอยสวนผัก 29, แขวงตลิ่งชัน, เขตตลิ่งชัน, จังหวัดกรุงเทพมหานคร 10170"
  },
  {องค์การบริหารส่วนจังหวัด
    "order": "XYZ789", 
    "recipient": "กรอกข้อมูลผู้รับ เช่น นางสาว มาลี รักดี 456 ซอย 5 ถนนสุขุมวิท แขวงคลองตัน เขตวัฒนา กรุงเทพฯ 10110",
    "sender":"กรอกข้อมูลผู้ส่ง เช่น บริษัท กิจกนก จำกัด 91-93-95 ซอยสวนผัก 29, แขวงตลิ่งชัน, เขตตลิ่งชัน, จังหวัดกรุงเทพมหานคร 10170"
  },
    {
    "order": "123456", 
    "recipient": "กรอกข้อมูลผู้รับ เช่น นางสาว มาลี รักดี เลขที่ 5/4 หมู่ที่ 4, หมู่บ้านสีเสียด, ตําบล ตกพรม, อําเภอขลุง, ตําบลตกพรม, อําเภอขลุง, จังหวัดจันทบุร 22110",
    "sender":"กรอกข้อมูลผู้ส่ง เช่น บริษัท กิจกนก จำกัด 91-93-95 ซอยสวนผัก 29, แขวงตลิ่งชัน, เขตตลิ่งชัน, จังหวัดกรุงเทพมหานคร 10170"
  },
    {
    "order": "123456", 
    "recipient": "กรอกข้อมูลผู้รับ เช่น นางสาว มาลี รักดี องค์การบริหารส่วนจังหวัดอุบลราชธานี เลขที่ 5/4 หมู่ที่ 4, หมู่บ้านสีเสียด, ตําบล ตกพรม, อําเภอขลุง, ตําบลตกพรม, อําเภอขลุง, จังหวัดจันทบุรี 22110",
    "sender":"กรอกข้อมูลผู้ส่ง เช่น บริษัท กิจกนก จำกัด 91-93-95 ซอยสวนผัก 29, แขวงตลิ่งชัน, เขตตลิ่งชัน, จังหวัดกรุงเทพมหานคร 10170"
  },

  

]

หลักเกณฑ์สำคัญ:
- ข้อมูลผู้รับควรรวมทั้งชื่อ ที่อยู่ และเบอร์โทร (ถ้ามี) ในช่องเดียว
- ช่วยตรวจข้อมูลที่อยู่จะมีการขึ้นต้นด้วย "เลขที่" หรือ "บ้านเลขที่" หรือ "บ้านเลขที่" หรือ "หมู่บ้าน" หรือ "ซอย" หรือ "ถนน" หรือ "แขวง" หรือ "เขต" หรือ "จังหวัด" หรือ "สถานที่"ให้ชัดเจนแล้วครบถ้วน
- พยายามหาข้อมูลให้ครบถ้วนที่สุด
- ถ้าเลขออเดอร์เป็นตัวเลข ให้ return เป็น string
- ระวังอย่าสับสนระหว่าง tracking number กับ order number

ข้อความจากเอกสาร:
"""
${text}
"""
`;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // ✅ ใช้รุ่นเร็วและถูก
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant for extracting structured shipping data from Thai e-commerce receipts.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    });

    const resultText = completion.choices[0].message.content || "";
    console.log("📦 AI raw response:\n", resultText);
    const cleaned = stripMarkdownJson(resultText);

    console.log("📦 AI cleaned JSON:\n", cleaned);

    const data = JSON.parse(cleaned);
    return Array.isArray(data) ? data : [];

  } catch (e: any) {
    console.error("❌ JSON parse error or OpenAI error:\n", e.message || e);
    return [];
  }
}
