import {Router} from 'express'
import { confirmarMail, registro , recuperarPassword, comprobarTokenPasword, crearNuevoPassword, login, perfil} from '../controllers/DoctorController.js'
import { verificarTokenJWT } from '../middlewares/JWT.js'

const router = Router()

router.post('/registro',registro)
router.get('/confirmar/:token',confirmarMail)


router.post('/recuperarpassword',recuperarPassword)
router.get('/recuperarpassword/:token',comprobarTokenPasword)
router.post('/nuevopassword/:token',crearNuevoPassword)
router.post('/doctor/login',login)
router.get('/doctor/perfil',verificarTokenJWT,perfil)

export default router