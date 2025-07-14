import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";

const UploadPdfClient: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles?.length) {
      setFile(selectedFiles[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const res = await axios.post("/upload/OCR", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob", // ✅ รับ PDF เป็น binary
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${file.name.replace(/\.pdf$/, "")}_processed.pdf`;
      link.click();

      URL.revokeObjectURL(url);

      Swal.fire("✅ สำเร็จ", "ไฟล์ PDF ได้ถูกดาวน์โหลดแล้ว", "success");
    } catch (err: any) {
      Swal.fire("❌ ผิดพลาด", err?.response?.data || "ไม่สามารถประมวลผลไฟล์ได้", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f9f9f9"
    >
      <Card sx={{ width: 400, p: 3, boxShadow: 6, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" align="center" gutterBottom>
            📤 อัปโหลด PDF สำหรับ OCR
          </Typography>

          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ my: 2 }}
          >
            เลือกไฟล์ PDF
            <input hidden type="file" accept=".pdf" onChange={handleChange} />
          </Button>

          {file && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              🗂️ ไฟล์ที่เลือก: {file.name}
            </Typography>
          )}

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleUpload}
            disabled={uploading || !file}
          >
            {uploading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                กำลังอัปโหลด...
              </>
            ) : (
              "อัปโหลดและประมวลผล PDF"
            )}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UploadPdfClient;
