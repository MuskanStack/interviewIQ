import genToken from "../config/token.js"
import User from "../models/user.model.js"

export const googleAuth = async (req, res) => {
  try {
    const { name, email } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
      });
    }

    const token = await genToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: `Google auth error ${error}` });
  }
};

export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    return res.status(200).json({ exists: !!user });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const logOut = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "LogOut Successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Logout error ${error}` });
  }
};
