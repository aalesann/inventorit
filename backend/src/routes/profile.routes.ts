import { Router } from 'express';
import profileController from '../controllers/profile.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { uploadAvatar } from '../middlewares/upload.middleware';

const router = Router();

// Todas las rutas requieren autenticación.
// El middleware verifyToken agrega req.user
router.use(verifyToken);

// Obtener perfil
router.get('/', profileController.getProfile);

// Actualizar datos básicos (username, email)
router.put('/', profileController.updateProfile);

// Cambiar contraseña
router.put('/password', profileController.changePassword);

// Subir avatar
router.post('/avatar', uploadAvatar.single('avatar'), profileController.uploadAvatar);

export default router;
