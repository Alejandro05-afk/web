import {Router} from 'express'
import { verificarTokenJWT } from '../middlewares/JWT.js'
import { registrarTratamiento, eliminarTratamiento } from '../controllers/tratamientoController.js'
const router = Router()
router.post("/tratamiento/registro",verificarTokenJWT,registrarTratamiento)
router.delete("/tratamiento/eliminar/:id",verificarTokenJWT,eliminarTratamiento)

export default router