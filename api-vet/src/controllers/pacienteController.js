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
            veterinario: req.veterinarioHeader._id
        })
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
        res.status(500).json({msg: `Error en el servidor - ${error}`})
    }
}

export{
    registrarPaciente
}