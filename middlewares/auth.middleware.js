const jwt = require("jsonwebtoken");
const db = require("../db/db"); 

module.exports.authUser = async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      const refreshToken = req.headers["x-refresh-token"];
      if (!refreshToken) {
        return res.status(401).json({ message: "Unauthorized: Refresh token missing" });
      }

      try {
        const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const userId = decodedRefreshToken._id;

        const userSnapshot = await db.ref(`UserDataBase/${userId}`).once("value");
        const userData = userSnapshot.val();

        if (!userData || userData.refreshToken !== refreshToken) {
          return res.status(403).json({ message: "Invalid refresh token" });
        }

        const newAccessToken = jwt.sign({ _id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const newRefreshToken = jwt.sign({ _id: userId }, process.env.JWT_SECRET, { expiresIn: "1y" });

        await db.ref(`UserDataBase/${userId}`).update({ refreshToken: newRefreshToken });

        return res.status(200).json({
          token: newAccessToken,
          refreshToken: newRefreshToken,
        });
      } catch (refreshError) {
        console.error("Error with refresh token:", refreshError);
        return res.status(401).json({ message: "Unauthorized: Invalid refresh token" });
      }
    }

    console.error("Error verifying token:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
