import express from 'express';
import multer from 'multer';
import { excelController } from '../controllers/excelController';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-template', upload.single('file'), excelController.uploadTemplate);
router.post('/upload-source', upload.single('file'), excelController.uploadSourceFile);
router.post('/process-mapping', excelController.processMapping);
router.get('/download/:templateId', excelController.downloadMappedData);

export default router; 