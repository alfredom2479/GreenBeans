import authRoutes from "./authRoutes.js";
import spotifyRoutes from "./spotifyRoutes.js";
const constructorMethod = (app) => {
    app.use("/api/auth", authRoutes);
    app.use("/api/spotify", spotifyRoutes);
    app.use("*", (req, res) => { res.status(400).json({ Error: "Bad Request" }); });
};
export default constructorMethod;
//# sourceMappingURL=index.js.map