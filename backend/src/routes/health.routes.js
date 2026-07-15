import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { 
  getHealthLogs, createHealthLog, deleteHealthLog,
  getMedicines, createMedicine, updateMedicine, deleteMedicine
} from '../controllers/health.controller.js';

const router = express.Router();

router.use(protect);

router.route('/logs')
  .get(getHealthLogs)
  .post(createHealthLog);

router.route('/logs/:id')
  .delete(deleteHealthLog);

router.route('/medicine')
  .get(getMedicines)
  .post(createMedicine);

router.route('/medicine/:id')
  .put(updateMedicine)
  .delete(deleteMedicine);

export default router;
