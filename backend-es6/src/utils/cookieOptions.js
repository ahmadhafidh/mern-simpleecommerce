const cookieOptions = (req) => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction && req.hostname !== "localhost", // ⛔ cookie harus HTTPS di production
    sameSite: "Strict",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000, // 1 hari
  };
};

export default cookieOptions;
