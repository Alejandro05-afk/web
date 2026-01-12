import mongoose from "mongoose"
import Tratamiento from "../models/Tratamiento.js"

const registrarTratamiento = async (req,res) => {
    try {
        //paso 1 Obtener
        const {paciente} = req.body
        //paso 2 Validar
        if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Debes llenar todos los campos"})
        if(!mongoose.Types.ObjectId.isValid(paciente)) return res.status(404).json({msg:`Lo sentimos, no existe el paciente ${paciente}`})
        //paso 3 Logica
        await Tratamiento.create(req.body)
        //paso 4
        res.status(201).json({msg:"Registro exitoso del tratamiento"})
    } catch (error) {
        res.status(500).json({msg:`Error en el servidor - ${error}`})
    }
}

const eliminarTratamiento = async(req,res) => {
    try {
        const {id} = req.params

        if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({msg: `No existe el id ${id}`})

        await Tratamiento.findByIdAndDelete(id)

        return res.status(200).json({msg: `Tratamiento eliminado exitosamente`})
    } catch (error) {
        res.status(500).json({msg: `Error en el servidor - ${error}`})
    }
}

export{
    registrarTratamiento,
    eliminarTratamiento
}