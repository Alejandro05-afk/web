import { sendMailToRegister , sendMailToRecoverPassword} from "../helpers/sendMail.js"
import { createTokenJWT } from "../middlewares/JWT.js"
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

    if (!validarEmailBDD) return res.status(404).json({ msg: "Token invalido o cuenta ya confirmada"})

    validarEmailBDD.token = null
    validarEmailBDD.confirmEmail = true
    await validarEmailBDD.save()

    res.status(200).json({ msg: "Cuenta confirmada, ya puedes iniciar sesion"})
}

const recuperarPassword = async (req,res)=>{
  try {
    const { email } = req.body
        if (!email) return res.status(400).json({ msg: "Debes ingresar un correo electrónico" })
        const doctorBDD = await Doctor.findOne({ email })
        if (!doctorBDD) return res.status(404).json({ msg: "El usuario no se encuentra registrado" })
        const token = doctorBDD.createToken()
        doctorBDD.token = token
        await sendMailToRecoverPassword(email, token)
        await doctorBDD.save()
        res.status(200).json({ msg: "Revisa tu correo electrónico para reestablecer tu cuenta" })
  } catch (error){
    res.status(500).json({msg: `Error en el servidor - ${error}`})
}
};

const comprobarTokenPasword = async (req,res)=>{
  try {
    const {token} = req.params
        const doctorBDD = await Doctor.findOne({token})
        if(doctorBDD?.token !== token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
        res.status(200).json({msg:"Token confirmado, ya puedes crear tu nuevo password"})
  } catch (error){
    res.status(500).json({msg: `Error en el servidor - ${error}`})
}
};

const crearNuevoPassword = async (req,res)=>{
  try {
    const {token} = req.params
    const {password,confirmPassword}=req.body

    if (Object.values(req.body).includes("")) return res.status(404).json({msg: "Debes llenar todos los campos"})
    if (password !== confirmPassword) return res.status(404).json({msg: "Los passwords no coinciden"})
    const doctorBDD = await Doctor.findOne({token})
    if(!doctorBDD) return res.status(400).json({msg: "No se puede validar la cuenta"})


    doctorBDD.password = await doctorBDD.encrypyPassword(password)
    doctorBDD.token = null
    await doctorBDD.save()

    res.status(200).json({msg: "Felicictaciones, ya puedes iniciar sesion con tu nuevo password"})
  } catch (error){
    res.status(500).json({msg: `Error en el servidor - ${error}`})
}

};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos vacíos
    if (Object.values(req.body).includes(""))
      return res.status(400).json({ msg: "Debes llenar todos los campos" });

    // Buscar doctor por email
    const doctorBDD = await Doctor.findOne({ email });
    if (!doctorBDD)
      return res.status(404).json({ msg: "El usuario no se encuentra registrado" });

    // Validar confirmación de correo
    if (!doctorBDD.confirmEmail)
      return res.status(403).json({ msg: "Debes verificar tu cuenta antes de iniciar sesión" });

    // Verificar contraseña
    const verificarPassword = await doctorBDD.matchPassword(password);
    if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password no es el correcto"})
		const {nombre,apellido,rol,direccion,telefono,_id} = doctorBDD
		const token = createTokenJWT(doctorBDD._id,doctorBDD.rol)

    res.status(200).json({
        token,
        nombre,
        apellido,
        rol,
        direccion,
        telefono,
        _id,
        email:doctorBDD.email
    })

  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: `Error en el servidor - ${error.message}` });
  }
};

const perfil =(req,res)=>{
	const {token,rol,confirmEmail,createdAt,updatedAt,__v,...datosPerfil} = req.doctorHeader
    res.status(200).json(datosPerfil)
}

const actualizarPassword = async(req,res) =>{
  try {
    const {passwordActual, passwordNuevo} = req.body
    const {_id} = req.doctorHeader

    const doctorBDD = await Doctor.findById(_id)
    if(!doctorBDD) return res.status(404).json({msg:`Lo sentimos no existe odontologo ${id}`})
    
    const verificarPassword = await doctorBDD.matchPassword(passwordActual)
    if(!verificarPassword) res.status(404).json({msg: "Lo sentimos el password actual no es el correcto"})

    
    doctorBDD.password = await doctorBDD.encrypyPassword(passwordNuevo)
    await doctorBDD.save()

    res.status(200).json({msg: "Password actualizado correctamente"})
  } catch (error) {
    res.status(500).json({msg : `Error en el servidor - ${error}`})
  }
}

const actualizarDatos = async(req,res) =>{
  try {
    const {nombre, apellido, direccion, celular, email} = req.body
    const {_id} = req.doctorHeader

    const doctorBDD = await Doctor.findById(_id)
    if(!doctorBDD) return res.status(404).json({msg:`Lo sentimos no existe odontologo ${_id}`})
      
      doctorBDD.nombre = nombre || doctorBDD.nombre
      doctorBDD.apellido = apellido || doctorBDD.apellido
      doctorBDD.direccion = direccion || doctorBDD.direccion
      doctorBDD.celular = celular || doctorBDD.celular
      doctorBDD.email = email || doctorBDD.email
    
    await doctorBDD.save()
    res.status(200).json({msg: "Datos actualizados correctamente"}) 

  } catch (error) {
    res.status(500).json({msg : `Error en el servidor - ${error}`})
  }
}

export {
    registro,
    confirmarMail,
    recuperarPassword,
    comprobarTokenPasword,
    crearNuevoPassword,
    login,
    perfil,
    actualizarPassword,
    actualizarDatos
} 


