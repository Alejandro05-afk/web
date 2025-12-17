import { sendMailToOwner } from "../helpers/sendMail.js";
import {
  subirBase64Cloudinary,
  subirImagenCloudinary,
} from "../helpers/uploadClaudinary.js";
import Paciente from "../models/Paciente.js";
import mongoose from "mongoose";
import { v2 as cloudinary } from 'cloudinary'
import fs from "fs-extra"
import { createTokenJWT } from "../middlewares/JWT.js";


const registrarPaciente = async(req,res) =>{
    try {
        const {emailPropietario} = req.body

        if (Object.values(req.body).includes("")) return res.status(400).json({msg: "Debes llenar todos los campos"})

        const emailExistente = await Paciente.findOne({emailPropietario})
        if(emailExistente) return res.status(400).json({msg: "El email ya se encuentra registrado"})

        
        const password = Math.random().toString(36).toUpperCase().slice(2, 5)
   
        
        const nuevoPaciente = new Paciente({
            ...req.body,
            passwordPropietario: await Paciente.prototype.encryptPassword("VET"+password),
            doctor: req.doctorHeader._id
        })
        console.log(nuevoPaciente);
        
        if (req.files?.imagen) {
            const { secure_url, public_id } = await subirImagenCloudinary(req.files.imagen.tempFilePath)
            nuevoPaciente.avatarMascota = secure_url
            nuevoPaciente.avatarMascotaID = public_id
        }

        if (req.body?.avatarMascotaIA) {
            const secure_url = await subirBase64Cloudinary(req.body.avatarMascotaIA)
            nuevoPaciente.avatarMascotaIA = secure_url
        }

        await nuevoPaciente.save()

        
        
        await sendMailToOwner(emailPropietario,"VET"+password)
        res.status(201).json({ msg: "Registro exitoso de la mascota y correo enviado al propietario" })

    } catch (error) {
        console.log(error);
        
        res.status(500).json({msg: `Error en el servidor - ${error}`})
    }
}
const listarPacientes = async (req,res)=>{
    try {
        const pacientes = await Paciente.find({ estadoMascota: true, doctor: req.doctorHeader._id }).select("-salida -createdAt -updatedAt -__v").populate('doctor','_id nombre apellido')
        res.status(200).json(pacientes)

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const detallePaciente = async(req,res)=>{

    try {
        const {id} = req.params
        if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`No existe el doctor ${id}`});
        const paciente = await Paciente.findById(id).select("-createdAt -updatedAt -__v").populate('doctor','_id nombre apellido')
        res.status(200).json(paciente)
        
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const eliminarPaciente = async (req,res)=>{

    try {
        const {id} = req.params
        const {salidaMascota} = req.body
        if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Debes llenar todos los campos"})
        if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`No existe el paciente ${id}`})
        await Paciente.findByIdAndUpdate(id,{salidaMascota:Date.parse(salidaMascota),estadoMascota:false})
        res.status(200).json({msg:"Fecha de salida registrado exitosamente"})

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const actualizarPaciente = async(req,res)=>{
    const {id} = req.params
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, no existe el doctor ${id}`})
    if (req.files?.imagen) {
        const paciente = await Paciente.findById(id)
        if (paciente.avatarMascotaID) {
            await cloudinary.uploader.destroy(paciente.avatarMascotaID);
        }
        const cloudiResponse = await cloudinary.uploader.upload(req.files.imagen.tempFilePath, { folder: 'Pacientes' });
        req.body.avatarMascota = cloudiResponse.secure_url;
        req.body.avatarMascotaID = cloudiResponse.public_id;
        await fs.unlink(req.files.imagen.tempFilePath);
    }
    await Paciente.findByIdAndUpdate(id, req.body, { new: true })
    res.status(200).json({msg:"Actualización exitosa del paciente"})
}

const loginPropietario = async(req,res)=>{

    try {
        const {email:emailPropietario,password:passwordPropietario} = req.body
        if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Debes llenar todos los campos"})
        const propietarioBDD = await Paciente.findOne({emailPropietario})
        if(!propietarioBDD) return res.status(404).json({msg:"El propietario no se encuentra registrado"})
        const verificarPassword = await propietarioBDD.matchPassword(passwordPropietario)
        if(!verificarPassword) return res.status(404).json({msg:"El password no es el correcto"})
        const token = createTokenJWT(propietarioBDD._id,propietarioBDD.rol)
        
        const {_id,rol} = propietarioBDD
        res.status(200).json({
            token,
            rol,
            _id
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}


export{
    registrarPaciente,
    listarPacientes,
    detallePaciente,
    eliminarPaciente,
    actualizarPaciente,
    loginPropietario
}