import { userModel } from "../../models/user.model.js";

export default class UsersServiceDao {
  async getUserByEmail(email) {
    try {
      return await userModel.findOne({ email: email });
    } catch (error) {
      throw new Error(`Error while fetching user by email: ${error.message}`);
    }
  }

  async modifyUser(email, password) {
    try {
      // Buscar al usuario por su correo electrónico
      const user = await userModel.findOne({ email: email });

      if (!user) {
        throw new Error("User not found");
      }

      // Modificar la contraseña del usuario
      user.password = password;
      await user.save();

      return user; // Retorna el usuario modificado
    } catch (error) {
      throw new Error(`Error while modifying user: ${error.message}`);
    }
  }
}
