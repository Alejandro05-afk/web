import { Router } from 'express'
import { registrarPaciente } from '../controllers/pacienteController.js'
const router = Router()

router.post(`/paciente/registro`, registrarPaciente)


export default router