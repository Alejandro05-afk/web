// Requerir módulos
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors';
import cloudinary from 'cloudinary'
import fileUpload from "express-fileupload"

import routerDoctor from './routers/doctor_routes.js';
import routerPacientes from './routers/paciente_routers.js';
import routerTratamientos from './routers/tratamiento_routes.js'


// Inicializaciones
const app = express()
dotenv.config()

// Configuraciones 
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// Middlewares 
app.use(express.json())
app.use(cors())
 
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : './uploads'
}))

// Variables globales
app.set('port',process.env.PORT || 3000)


// Rutas 
app.get('/',(req,res)=> res.send("Server on"))
app.use('/api',routerDoctor)
app.use(`/api`,routerPacientes)
app.use(`/api`,routerTratamientos)
app.use((req,res)=>res.status(404).send("Endpoint no encontrado - 404"))





// Exportar la instancia de express por medio de app
export default  app