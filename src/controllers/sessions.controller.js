import { usersService } from "../services/service.js";
import { generateJWToken } from "../utils.js";

export const registerUser = async (req, res) => {
  try {
    console.log("Registrando usuario:");

    res.status(201).send({
      status: "success",
      message: "Usuario creado con éxito con ID.",
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).send("Error interno del servidor");
  }
};

export const loginUser = async (req, res) => {
  try {
    const user = req.user;
    console.log(user);

    const tokenUser = {
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      age: user.age,
      role: user.role,
    };
    const access_token = generateJWToken(tokenUser);
    console.log(access_token);

    res.cookie("jwtCookieToken", access_token, {
      maxAge: 100000,
      httpOnly: true,
    });
    res.send({ message: "Login success!!" });
  } catch (error) {
    console.error("Error al procesar el inicio de sesión:", error);
    res.status(500).send("Error interno del servidor");
  }
};

export const logoutUser = (req, res) => {
  if (req.session.login || req.session.user) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error al destruir la sesión:", err);
        res
          .status(500)
          .json({ status: "error", message: "Error al cerrar sesión" });
      } else {
        res
          .status(200)
          .json({ status: "success", message: "Sesión cerrada exitosamente" });
      }
    });
  } else {
    res
      .status(400)
      .json({ status: "error", message: "No hay sesión activa para cerrar" });
  }
};

export const githubLogin = async (req, res) => {
  const user = req.user;

  const tokenUser = {
    name: `${user.first_name} ${user.last_name}`,
    email: user.email,
    age: user.age,
    role: user.role,
  };
  const access_token = generateJWToken(tokenUser);
  console.log(access_token);

  res.cookie("jwtCookieToken", access_token, {
    maxAge: 100000,
    httpOnly: true,
  });
  res.redirect("/api/products");
};

export const cambiararPass = async (req, res) => {
  try {
    // Busca el correo electrónico en la base de datos
    const usuario = await usersService.getUserByEmail({
      email: req.body.email,
    });

    if (!usuario) {
      // Si no se encuentra el usuario, renderiza un mensaje indicando que el correo no fue encontrado
      return res.render("recoveryMessage", {
        title: "Recupero de contraseña",
        message:
          "El correo electrónico no fue encontrado en nuestra base de datos.",
      });
    }

    // Llama a la función sendRecoveryMail y pasa el correo electrónico del usuario
    await sendRecoveryMail(req, res, usuario.email);

    // Renderiza un mensaje indicando que se ha enviado un correo electrónico de recuperación
    res.render("recoveryMessage", {
      title: "Recupero de contraseña",
      message:
        "Se ha enviado un correo electrónico con instrucciones para recuperar tu contraseña.",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

const sendRecoveryMail = async (req, res, email) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
      user: config.gmailAccount,
      pass: config.gmailAppPassword,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log("Server is ready to send recovery email.");
    }
  });

  const mailOptions = {
    from: "Coder ecommerce - " + config.gmailAccount,
    to: email, // Utiliza el correo electrónico pasado como argumento
    subject: "Recuperar tu contraseña",
    html: `<div><h1>Haz clic en el siguiente enlace para cambiar tu contraseña:</h1><br><a href="/api/sessions/modificarpass">Cambiar contraseña</a></div>`,
    attachments: [],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error(error);
  }
};

export const renderModificarPass = async (req, res) => {
  try {
    res.render("cambiarPass", {
      title: "Cambio de contraseña",
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error interno del servidor");
  }
};

export const modificarPass = async (req, res) => {
  try {
    const email = req.body.email;
    const newPassword = req.body.password; // Suponiendo que el campo de la nueva contraseña se llama "password" en el formulario

    // Modificar la contraseña del usuario
    const usuario = await usersService.modifyUser(email, newPassword);

    // Renderizar la vista con un mensaje de éxito
    res.render("cambiarPass", {
      title: "Cambio de contraseña",
      message: "Se ha cambiado la contraseña con éxito.",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error interno del servidor");
  }
}
