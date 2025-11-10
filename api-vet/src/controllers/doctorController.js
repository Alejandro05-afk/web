import { sendMailToRegister } from "../helpers/sendMail.js"
import Doctor from "../models/Doctor.js"

const registro = async (req,res)=>{
    try{
        const{email,password} = req.body

        if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos debes llenar todos los campos"})
        const verificarEmailBDD = await Doctor.findOne({email})
        if (verificarEmailBDD) return res.status(400).json({msg:"El email ya se encuentra registrado"})
        
        const nuevoDoctor = new Doctor(req.body)
    
        nuevoDoctor.password = await nuevoDoctor.encrypyPassword(password)
        const token = await nuevoDoctor.createToken()

        
        await sendMailToRegister(email,token)

        await nuevoDoctor.save()

        res.status(201).json({msg:"Revisa tu correo electronico para verificar tu cuenta"})

    }catch(error){
        res.status(500).json({msg: `Error en el servidor - ${error}`})
}
}

const confirmarMail = async(req,res) => {
    const { token } = req.params

    const validarEmailBDD = await Doctor.findOne({ token })

    if (!validarEmailBDD) return res.status(404).json({ msg: "Token ivalido o cuenta ya confirmada"})

    validarEmailBDD.token = null
    validarEmailBDD.confirmEmail = true
    await validarEmailBDD.save()

    res.status(200).json({ msg: "Cuenta confirmada, ya puedes iniciar sesion"})
}


export {
    registro,
    confirmarMail
}