# ระบบแจ้งซ่อมคอมพิวเตอร์และอุปกรณ์ของวิทยาลัย (Back-End)

- ชื่อ-รหัสนักศึกษา: รักษ์ชัย ธรรมสุจริต - 69319010043
- รายวิชา: 31901-2005 การพัฒนาซอฟต์แวร์ด้วยเทคโนโลยี Back-End
- โปรเจกต์สัปดาห์ที่ 1–2: แบบจำลอง UML และ Repair Request API

## ขอบเขต

บริการ REST API สำหรับสร้าง ดู แก้ไข และยกเลิกคำขอแจ้งซ่อม เก็บข้อมูลในหน่วยความจำตามใบสถานการณ์จำลอง ข้อมูลจะถูกล้างเมื่อหยุดหรือเริ่มเซิร์ฟเวอร์ใหม่ สัปดาห์นี้ยังไม่รวมการเข้าสู่ระบบและฐานข้อมูลจริง

ฟิลด์ของคำขอคือ `id`, `computerId`, `symptom`, `status`, `technicianId` และ `resultNote` รายการใหม่สร้าง `id` โดยเซิร์ฟเวอร์ เริ่มด้วยสถานะ `pending` และกำหนด `technicianId` กับ `resultNote` เป็น `null` เสมอ

สถานะที่รองรับ: `pending`, `in_progress`, `waiting_parts`, `done`

## ตาราง Endpoint

| HTTP | Path | ความหมาย / Use Case | สำเร็จ | ข้อผิดพลาด |
| --- | --- | --- | --- | --- |
| `GET` | `/api/v1/repair-requests` | ดูรายการคำขอ (FR-03); ช่างดูงานรอซ่อมใช้ `?status=pending` (FR-05) | `200` พร้อม JSON array | `400` เมื่อกรองด้วยสถานะที่ไม่รองรับ |
| `GET` | `/api/v1/repair-requests/:id` | ดูรายละเอียดและสถานะของรายการ (FR-03) | `200` พร้อม JSON object | `400` เมื่อ id ไม่ใช่จำนวนเต็มบวก; `404` เมื่อไม่พบ |
| `POST` | `/api/v1/repair-requests` | แจ้งซ่อมโดยระบุเครื่องและอาการ (FR-02) | `201` พร้อมรายการที่สร้าง | `400` เมื่อ `computerId` หรือ `symptom` ไม่ถูกต้อง |
| `PUT` | `/api/v1/repair-requests/:id` | แก้รายละเอียด มอบหมายช่าง และอัปเดตสถานะ/ผลซ่อม (FR-06, FR-07, FR-09) | `200` พร้อมรายการที่แก้ไข | `400` เมื่อข้อมูลไม่ถูกต้อง; `404` เมื่อไม่พบ |
| `DELETE` | `/api/v1/repair-requests/:id` | ยกเลิกคำขอที่ช่างยังไม่รับ (FR-04) | `204` ไม่มี response body | `404` เมื่อไม่พบ; `409` เมื่อช่างรับงานแล้ว |

รายการทั้งหมดรับ query `status` เพื่อกรองงาน เช่น `GET /api/v1/repair-requests?status=pending` ค่าที่ไม่อยู่ในสถานะทั้งสี่จะตอบ `400` ทุก request/response ใช้ JSON ยกเว้น response `204` ซึ่งไม่มี body

### ตัวอย่างข้อมูล

สร้างคำขอด้วย `POST`:

```json
{
  "computerId": 101,
  "symptom": "เปิดเครื่องแล้วไม่มีภาพ"
}
```

Response `201`:

```json
{
  "id": 1,
  "computerId": 101,
  "symptom": "เปิดเครื่องแล้วไม่มีภาพ",
  "status": "pending",
  "technicianId": null,
  "resultNote": null
}
```

แก้สถานะและบันทึกผลด้วย `PUT`:

```json
{
  "status": "done",
  "technicianId": 12,
  "resultNote": "เปลี่ยนสายจอและทดสอบแล้ว"
}
```

`PUT` รับเฉพาะฟิลด์ที่ต้องการแก้และคงค่าฟิลด์อื่นไว้ หากยกเลิกรายการที่มี `technicianId` หรือมีสถานะอื่นนอกจาก `pending` ระบบตอบ `409 Conflict` ตาม FR-04

### การโยง Use Case จากสัปดาห์ที่ 1

| Use Case / FR | Endpoint |
| --- | --- |
| แจ้งซ่อม (FR-02) | `POST /api/v1/repair-requests` |
| ดูสถานะ/ประวัติการแจ้ง (FR-03) | `GET /api/v1/repair-requests`, `GET /api/v1/repair-requests/:id` |
| ยกเลิกคำขอ (FR-04) | `DELETE /api/v1/repair-requests/:id` |
| ดูรายการงานรอซ่อม (FR-05) | `GET /api/v1/repair-requests?status=pending` |
| รับงาน / อัปเดตสถานะ (FR-06, FR-07) | `PUT /api/v1/repair-requests/:id` |
| มอบหมายงานให้ช่าง (FR-09) | `PUT /api/v1/repair-requests/:id` |

Use Case สัปดาห์ที่ 1 ระบุว่าผู้แจ้งดูรายการของตนเอง แต่สัปดาห์ที่ 2 ยังไม่รวม login/authentication และสัญญาข้อมูล API ที่ให้มาระบุฟิลด์เพียงหกตัวด้านบน จึงยังแยกเจ้าของคำขอในผล `GET` ไม่ได้ เมื่อเพิ่มระบบยืนยันตัวตนให้ผูก `reporterId` กับผู้ใช้ที่เข้าสู่ระบบ แทนการเชื่อค่าจาก client

## โครงสร้างโค้ด

- `src/app.js` สร้าง Express app, JSON middleware และ error responses
- `src/index.js` เปิด HTTP server ที่ port `3000` (เปลี่ยนได้ด้วย `PORT`)
- `src/routes/repairRequests.js` ประกาศ 5 route ของ resource
- `src/controllers/repairRequestsController.js` ตรวจข้อมูลและกำหนด HTTP status
- `src/models/repairRequestModel.js` จัดเก็บรายการในหน่วยความจำ

## เริ่มโปรเจกต์

ต้องใช้ Node.js 18 ขึ้นไป

```bash
npm install
npm run dev
```

หรือเปิดแบบปกติด้วย `npm start` แล้วเรียก API ที่ `http://localhost:3000/api/v1/repair-requests`

## Postman Collection

นำเข้าไฟล์ [`docs/postman/repair.postman_collection.json`](docs/postman/repair.postman_collection.json) ใน Postman Collection ชื่อ `Repair API` มีตัวแปร `baseUrl` ตั้งต้นเป็น `http://localhost:3000` และสคริปต์ตรวจ status, body, การสร้าง/แก้ไข/ลบ, validation, not found และการยกเลิกหลังช่างรับงาน

เมื่อเซิร์ฟเวอร์กำลังทำงาน สามารถรัน Collection ด้วย Postman CLI:

```bash
postman collection run docs/postman/repair.postman_collection.json
```

## สรุปผล/ข้อจำกัด

API ครอบคลุม Use Case แจ้งซ่อม ดูรายการ/สถานะ แก้สถานะและผลซ่อม และยกเลิกคำขอที่ยังไม่รับงาน การสร้างข้อมูลผิดรูปแบบตอบ `400`, id ที่ไม่พบตอบ `404`, การสร้างสำเร็จตอบ `201`, การลบสำเร็จตอบ `204` และการยกเลิกงานที่ช่างรับแล้วตอบ `409` ข้อมูลในหน่วยความจำเหมาะกับการทดลองเฉพาะเครื่อง; การใช้งานจริงต้องเพิ่มฐานข้อมูลและการยืนยันตัวตนเพื่อแยกสิทธิ์ผู้แจ้ง ช่าง และหัวหน้างาน
