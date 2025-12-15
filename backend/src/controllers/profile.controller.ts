import { Request, Response, NextFunction } from 'express';
import profileService from '../services/profile.service';

class ProfileController {
    getProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user.user_id;
            const profile = await profileService.getProfile(userId);
            res.json(profile);
        } catch (error) {
            next(error);
        }
    };

    updateProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user.user_id;
            const { username, email } = req.body;
            const updatedProfile = await profileService.updateProfile(userId, { username, email });
            res.json(updatedProfile);
        } catch (error) {
            next(error);
        }
    };

    changePassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user.user_id;
            const { password_actual, password_nueva } = req.body;

            if (!password_actual || !password_nueva) {
                res.status(400).json({ error: 'Faltan datos requeridos' });
                return;
            }

            await profileService.changePassword(userId, password_actual, password_nueva);
            res.json({ message: 'Contraseña actualizada correctamente' });
        } catch (error) {
            next(error);
        }
    };

    uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.file) {
                res.status(400).json({ error: 'No se subió ningún archivo' });
                return;
            }

            const userId = (req as any).user.user_id;
            // Construct public URL
            const protocol = req.protocol;
            const host = req.get('host');
            const avatarUrl = `${protocol}://${host}/uploads/avatars/${req.file.filename}`;

            const newUrl = await profileService.updateAvatar(userId, avatarUrl);
            res.json({ avatar_url: newUrl });
        } catch (error) {
            next(error);
        }
    };
}

export default new ProfileController();
